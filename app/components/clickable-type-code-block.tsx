import { useState, useCallback } from "react";

interface Type {
  fullName: string;
  name: string;
  definition: string;
  line: number;
  isPublic: boolean;
  source: "stdlib" | "prelude" | "vodka";
  reExportedAs?: string[];
}

interface ClickableTypeCodeBlockProps {
  code: string;
  availableTypes: Type[];
  onTypeClick: (typeName: string) => void;
  className?: string;
}

export default function ClickableTypeCodeBlock({
  code,
  availableTypes,
  onTypeClick,
  className = "",
}: ClickableTypeCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create a simple map of type names for quick lookup
  const typeMap = useCallback(() => {
    const map = new Map<string, Type>();
    availableTypes.forEach((type) => {
      // Just add the simple name (e.g., "KeepValue" from "KeepValue<key, value>")
      const simpleName = type.name.split("<")[0];
      map.set(simpleName, type);
    });
    return map;
  }, [availableTypes]);

  // Parse the code and make type names clickable
  const renderClickableCode = useCallback(() => {
    const types = typeMap();
    const typeNames = Array.from(types.keys()).sort(
      (a, b) => b.length - a.length
    );

    if (typeNames.length === 0) {
      return <span>{code}</span>;
    }

    // Create regex pattern to match any of the type names
    const pattern = new RegExp(
      `\\b(${typeNames
        .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")})\\b`,
      "g"
    );

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(code)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {code.slice(lastIndex, match.index)}
          </span>
        );
      }

      // Add clickable type
      const typeName = match[1];
      const type = types.get(typeName);
      if (type) {
        parts.push(
          <button
            key={`type-${match.index}`}
            onClick={() => onTypeClick(type.name)}
            className="text-pink-400 hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-none p-0 font-mono"
            title={`Click to navigate to ${type.name}`}
          >
            {typeName}
          </button>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < code.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>{code.slice(lastIndex)}</span>
      );
    }

    return <>{parts}</>;
  }, [code, typeMap, onTypeClick]);

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-neutral-900 ${className}`}
    >
      <div className="absolute right-2 top-2">
        <button
          onClick={copyToClipboard}
          className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 rounded transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div className="p-4">
        <pre className="text-neutral-300 font-mono text-sm overflow-x-auto">
          {renderClickableCode()}
        </pre>
      </div>
    </div>
  );
}
