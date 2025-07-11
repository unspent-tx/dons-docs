import { IconEye, IconEyeOff } from "@tabler/icons-react";
import ItemCard from "./item-card";
import ItemHeader from "./item-header";
import ItemMeta from "./item-meta";
import CodeBlock from "./code-block";
import DocumentationBlock from "./documentation-block";
import SectionTitle from "./section-title";
import { getImportStatement } from "./utils";

interface Atom {
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
  source: "stdlib" | "prelude" | "vodka";
  reExportedAs?: string[];
  implementation?: string;
  tests?: string[];
}

interface AtomsViewProps {
  atoms: Atom[];
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  toggleCodeBlock: (id: string) => void;
}

export default function AtomsView({
  atoms,
  showCodeBlocksByDefault,
  expandedCodeBlocks,
  toggleCodeBlock,
}: AtomsViewProps) {
  return (
    <div>
      <div>
        {atoms.map((atom) => {
          const codeBlockId = `atom-${atom.fullName}`;
          const shouldShowCodeBlock =
            showCodeBlocksByDefault || expandedCodeBlocks.has(codeBlockId);
          const hasCodeContent =
            atom.documentation ||
            atom.implementation ||
            (atom.tests && atom.tests.length > 0);

          return (
            <ItemCard key={atom.fullName}>
              <ItemHeader
                name={atom.name}
                source={atom.source}
                badges={[<span key="private">Private</span>]}
                line={atom.line}
              />
              <ItemMeta fullName={atom.fullName} />

              {/* Import Statement */}
              <div className="my-5">
                <CodeBlock
                  code={getImportStatement(
                    atom.fullName,
                    atom.name,
                    atom.reExportedAs
                  )}
                  language="aiken"
                  showLineNumbers={false}
                />
              </div>

              {/* Code Block Toggle Button */}
              {hasCodeContent && !showCodeBlocksByDefault && (
                <div className="mb-5">
                  <button
                    onClick={() => toggleCodeBlock(codeBlockId)}
                    className="text-sm text-pink-400 hover:text-pink-300 underline flex items-center gap-1"
                  >
                    {expandedCodeBlocks.has(codeBlockId) ? (
                      <>
                        <IconEyeOff size={16} />
                        Hide code
                      </>
                    ) : (
                      <>
                        <IconEye size={16} />
                        Show code
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Complete Function Block */}
              {hasCodeContent && shouldShowCodeBlock && (
                <div className="mb-4">
                  <CodeBlock
                    code={[
                      // Add function implementation first
                      atom.implementation || "",

                      // Add documentation comments
                      atom.documentation
                        ? atom.documentation
                            .split("\n")
                            .map((line) => `/// ${line}`)
                            .join("\n")
                        : "",

                      // Add test cases
                      atom.tests && atom.tests.length > 0
                        ? "\n" + atom.tests.join("\n\n")
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
      </div>
    </div>
  );
}
