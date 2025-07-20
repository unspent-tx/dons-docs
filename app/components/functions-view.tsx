import {
  IconBrackets,
  IconDevicesCode,
  IconDeviceWatchCode,
  IconEye,
  IconEyeOff,
  IconGitCompare,
  IconDownload,
} from "@tabler/icons-react";
import ItemCard from "./item-card";
import ItemHeader from "./item-header";
import ItemMeta from "./item-meta";
import CodeBlock from "./code-block";
import DocumentationBlock from "./documentation-block";
import SectionTitle from "./section-title";
import { getImportStatement } from "./utils";

interface Function {
  fullName: string;
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
  isPublic: boolean;
  source: string;
  reExportedAs?: string[];
  implementation?: string;
  tests?: string[];
}

interface FunctionsViewProps {
  functions: Function[];
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  toggleCodeBlock: (id: string) => void;
  showImportsByDefault: boolean;
  expandedImports: Set<string>;
  toggleImportBlock: (id: string) => void;
}

export default function FunctionsView({
  functions,
  showCodeBlocksByDefault,
  expandedCodeBlocks,
  toggleCodeBlock,
  showImportsByDefault,
  expandedImports,
  toggleImportBlock,
}: FunctionsViewProps) {
  return (
    <>
      {functions.map((func) => {
        const codeBlockId = `func-${func.fullName}`;
        const importBlockId = `import-func-${func.fullName}`;
        const shouldShowCodeBlock =
          showCodeBlocksByDefault || expandedCodeBlocks.has(codeBlockId);
        const shouldShowImportBlock =
          showImportsByDefault || expandedImports.has(importBlockId);
        const hasCodeContent =
          func.documentation ||
          func.implementation ||
          (func.tests && func.tests.length > 0);
        return (
          <ItemCard key={func.fullName}>
            <ItemHeader
              name={func.name}
              source={func.source}
              line={func.line}
            />
            <ItemMeta fullName={func.fullName} />

            {/* Import Statement */}
            {shouldShowImportBlock && (
              <div className="my-5 relative">
                <CodeBlock
                  code={getImportStatement(
                    func.fullName,
                    func.name,
                    func.reExportedAs
                  )}
                  language="aiken"
                  showLineNumbers={false}
                />
              </div>
            )}

            {/* Import Toggle Button */}

            {/* Code Block Toggle Button */}

            {/* Complete Function Block */}
            {hasCodeContent && shouldShowCodeBlock && (
              <div className="mb-4">
                <CodeBlock
                  code={[
                    // Add function implementation first
                    func.implementation || "",

                    // Add documentation comments
                    func.documentation
                      ? func.documentation
                          .split("\n")
                          .map((line) => `/// ${line}`)
                          .join("\n")
                      : "",

                    // Add test cases
                    func.tests && func.tests.length > 0
                      ? "\n" + func.tests.join("\n\n")
                      : "",
                  ]
                    .filter(Boolean)
                    .join("\n")}
                />
              </div>
            )}
          </ItemCard>
        );
      })}
    </>
  );
}
