"use client";

import React, { useState } from "react";
import {
  IconChevronRight,
  IconChevronDown,
  IconFolder,
  IconFile,
} from "@tabler/icons-react";

interface ImportItem {
  module: string;
  items: string[];
  line: number;
  raw: string;
  source: string;
}

interface ModuleData {
  key: string;
  name: string;
  source: string;
  description?: string;
  functions: Array<{
    name: string;
    signature: string;
    documentation?: string;
    parameters: Array<{
      name: string;
      type: string;
      optional?: boolean;
    }>;
    returnType: string;
    line: number;
    raw: string;
    isPublic: boolean;
    source: string;
    implementation?: string;
  }>;
  types: Array<{
    name: string;
    definition: string;
    line: number;
    raw: string;
    isPublic: boolean;
    source: string;
  }>;
  constants: Array<{
    name: string;
    type: string;
    value: string;
    line: number;
    raw: string;
    isPublic: boolean;
    source: string;
  }>;
}

interface FileStructureSidebarProps {
  modules: ModuleData[];
  isOpen: boolean;
  onToggle: () => void;
  onSearchChange: (
    query: string,
    source: string,
    itemType?: "function" | "type" | "module",
    moduleKey?: string
  ) => void;
}

interface TreeNode {
  name: string;
  type: "folder" | "file";
  children: Map<string, TreeNode>;
  moduleData?: ModuleData;
  isExpanded: boolean;
}

export default function FileStructureSidebar({
  modules,
  isOpen,
  onToggle,
  onSearchChange,
}: FileStructureSidebarProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Build the file structure tree from modules and their imports
  const buildFileTree = (): Map<string, TreeNode> => {
    const tree = new Map<string, TreeNode>();

    modules.forEach((module) => {
      // Add the module itself to the tree
      // Use the key which includes package info (e.g., "vodka:cip" -> "vodka/cip")
      const modulePath = module.key.replace(/:/g, "/").replace(/\./g, "/");
      const pathParts = modulePath.split("/");

      let currentLevel = tree;
      let currentPath = "";

      pathParts.forEach((part, index) => {
        const isLast = index === pathParts.length - 1;
        const nodePath = currentPath ? `${currentPath}/${part}` : part;

        if (!currentLevel.has(part)) {
          currentLevel.set(part, {
            name: part,
            type: isLast ? "file" : "folder",
            children: new Map(),
            moduleData: isLast ? module : undefined,
            isExpanded: expandedNodes.has(nodePath),
          });
        }

        if (!isLast) {
          currentLevel = currentLevel.get(part)!.children;
          currentPath = nodePath;
        }
      });
    });

    return tree;
  };

  const toggleNode = (nodePath: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      return newSet;
    });
  };

  const handleItemClick = (
    itemName: string,
    source: string,
    itemType: "function" | "type" | "module",
    moduleKey?: string
  ) => {
    // Set search query to the item name and pass the item type
    onSearchChange(itemName, source, itemType, moduleKey);
  };

  // Color scheme for different tree levels
  const getLevelColors = (level: number) => {
    const colors = [
      {
        folder: "text-pink-400",
        text: "text-pink-300",
        border: "border-pink-500",
      }, // Level 0 - Package roots
      {
        folder: "text-purple-400",
        text: "text-purple-300",
        border: "border-purple-500",
      }, // Level 1
      {
        folder: "text-orange-400",
        text: "text-orange-300",
        border: "border-orange-500",
      }, // Level 2 (orange)
      {
        folder: "text-emerald-400",
        text: "text-emerald-300",
        border: "border-emerald-500",
      }, // Level 3 (bright emerald)
      {
        folder: "text-yellow-400",
        text: "text-yellow-300",
        border: "border-yellow-500",
      }, // Level 4
      {
        folder: "text-red-400",
        text: "text-red-300",
        border: "border-red-500",
      }, // Level 5+
    ];
    return colors[Math.min(level, colors.length - 1)];
  };

  const renderTreeNode = (
    node: TreeNode,
    level: number = 0,
    path: string = ""
  ): React.JSX.Element => {
    const nodePath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedNodes.has(nodePath);
    const hasChildren = node.children.size > 0;
    const isPackageRoot = level === 0; // Top-level items are package roots
    const colors = getLevelColors(level);

    return (
      <div key={nodePath}>
        <div
          className={`flex items-center gap-2 px-2 py-1 hover:bg-neutral-800 rounded cursor-pointer ${
            isPackageRoot ? `bg-neutral-800/50 border-l-2 ${colors.border}` : ""
          }`}
          style={{ marginLeft: level > 0 ? `${level * 16}px` : "0px" }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(nodePath);
            } else if (node.moduleData) {
              // Click on a file/module - show all items from this module
              handleItemClick(
                "",
                node.moduleData.source,
                "function",
                node.moduleData.key
              );
            }
          }}
        >
          {hasChildren ? (
            <button className="flex items-center justify-center w-4 h-4">
              {isExpanded ? (
                <IconChevronDown size={12} className="text-neutral-400" />
              ) : (
                <IconChevronRight size={12} className="text-neutral-400" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}

          {node.type === "folder" ? (
            <IconFolder size={14} className={colors.folder} />
          ) : (
            <IconFile size={14} className={colors.folder} />
          )}

          <span
            className={`text-sm font-mono ${
              isPackageRoot ? `${colors.text} font-semibold` : colors.text
            }`}
          >
            {node.name}
            {isPackageRoot && (
              <span className="ml-2 text-xs text-neutral-500 font-normal">
                ({node.children.size} modules)
              </span>
            )}
          </span>
        </div>

        {/* Show module details for files */}
        {node.type === "file" && node.moduleData && (
          <div className="ml-6 space-y-2">
            {/* Functions */}
            {node.moduleData.functions.length > 0 && (
              <div style={{ marginLeft: `${(level + 1) * 16}px` }}>
                <div className="space-y-1">
                  {node.moduleData.functions.map((func, index) => (
                    <div
                      key={index}
                      className="text-xs text-blue-300 ml-2 font-mono whitespace-nowrap hover:text-blue-200 cursor-pointer"
                      onClick={() =>
                        handleItemClick(
                          func.name,
                          node.moduleData!.source,
                          "function"
                        )
                      }
                    >
                      • {func.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Types */}
            {node.moduleData.types.length > 0 && (
              <div style={{ marginLeft: `${(level + 1) * 16}px` }}>
                <div className="space-y-1">
                  {node.moduleData.types.map((type, index) => (
                    <div
                      key={index}
                      className="text-xs text-green-300 ml-2 font-mono hover:text-green-200 cursor-pointer"
                      onClick={() =>
                        handleItemClick(
                          type.name,
                          node.moduleData!.source,
                          "type"
                        )
                      }
                    >
                      • {type.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {Array.from(node.children.values()).map((child) => (
              <div key={child.name}>
                {renderTreeNode(child, level + 1, nodePath)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const fileTree = buildFileTree();

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-4 z-50 p-2 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition-colors"
      >
        <IconChevronRight size={20} className="text-neutral-300" />
      </button>
    );
  }

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-neutral-900 overflow-y-auto border-r border-neutral-700 z-40">
      <div className="p-4 border-b border-neutral-700">
        <div className="flex items-center justify-between">
          <h1 className="font-bold whitespace-nowrap text-xl text-neutral-100">
            Dons Docs
          </h1>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-neutral-800 rounded transition-colors"
          >
            <IconChevronRight size={20} className="text-neutral-300" />
          </button>
        </div>
        <p className="text-sm text-neutral-400 mt-1">Module structures</p>
      </div>

      <div className="p-2 space-y-2">
        {Array.from(fileTree.values()).map((node, index) => (
          <div key={index}>{renderTreeNode(node)}</div>
        ))}
      </div>
    </div>
  );
}
