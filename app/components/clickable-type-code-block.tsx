import React, { useState, useCallback } from "react";
import { customTheme } from "./code-block";
import { Highlight } from "prism-react-renderer";

interface AikenType {
  fullName: string;
  name: string;
  definition: string;
  line: number;
  isPublic: boolean;
  source: string;
  reExportedAs?: string[];
}

interface ClickableTypeCodeBlockProps {
  code: string;
  availableTypes: AikenType[];
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
    const map = new Map<string, AikenType>();
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
      return null;
    }

    // Create regex pattern to match any of the type names
    const pattern = new RegExp(
      `\\b(${typeNames
        .map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")})\\b`,
      "g"
    );

    return { pattern, types };
  }, [typeMap]);

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
      <Highlight theme={customTheme} code={code.trim()} language="aiken">
        {({ className, style, tokens, getLineProps, getTokenProps }) => {
          const clickableData = renderClickableCode();

          return (
            <div className="">
              <pre className="text-neutral-300 font-mono text-sm overflow-x-auto p-5 pr-20">
                {tokens.map((line, i) => (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    className="table-row"
                  >
                    {line.map((token, key) => {
                      const tokenProps = getTokenProps({ token });
                      const tokenText = token.content;

                      // Check if this token contains a clickable type
                      if (
                        clickableData &&
                        clickableData.pattern.test(tokenText)
                      ) {
                        // Reset the regex for the next test
                        clickableData.pattern.lastIndex = 0;

                        // Find all matches in this token
                        const matches = [];
                        let match;
                        while (
                          (match = clickableData.pattern.exec(tokenText)) !==
                          null
                        ) {
                          matches.push({
                            typeName: match[1],
                            start: match.index,
                            end: match.index + match[0].length,
                          });
                        }

                        if (matches.length > 0) {
                          // Split the token into clickable and non-clickable parts
                          const parts = [];
                          let lastIndex = 0;

                          matches.forEach((match, matchIndex) => {
                            // Add text before the match
                            if (match.start > lastIndex) {
                              parts.push(
                                <span
                                  key={`text-${matchIndex}-${match.start}`}
                                  {...tokenProps}
                                >
                                  {tokenText.slice(lastIndex, match.start)}
                                </span>
                              );
                            }

                            // Add clickable type
                            const type = clickableData.types.get(
                              match.typeName
                            );
                            if (type) {
                              parts.push(
                                <button
                                  key={`type-${matchIndex}-${match.start}`}
                                  onClick={() => onTypeClick(type.name)}
                                  className="text-pink-400 hover:text-blue-300 hover:underline cursor-pointer bg-transparent border-none p-0 font-mono"
                                  title={`Click to navigate to ${type.name}`}
                                  style={tokenProps.style}
                                >
                                  {match.typeName}
                                </button>
                              );
                            }

                            lastIndex = match.end;
                          });

                          // Add remaining text
                          if (lastIndex < tokenText.length) {
                            parts.push(
                              <span
                                key={`text-end-${lastIndex}`}
                                {...tokenProps}
                              >
                                {tokenText.slice(lastIndex)}
                              </span>
                            );
                          }

                          return (
                            <React.Fragment key={`parts-${key}`}>
                              {parts}
                            </React.Fragment>
                          );
                        }
                      }

                      return <span key={key} {...tokenProps} />;
                    })}
                  </div>
                ))}
              </pre>
            </div>
          );
        }}
      </Highlight>
    </div>
  );
}
