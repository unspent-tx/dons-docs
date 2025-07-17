import { Highlight, themes, Prism, PrismTheme } from "prism-react-renderer";
import { useState } from "react";

// Custom theme with CSS variables
export const customTheme: PrismTheme = {
  plain: {
    color: "var(--color-neutral-300)", // Bright text for contrast
    backgroundColor: "var(--color-neutral-900)", // Darker background for depth
  },
  styles: [
    {
      types: ["keyword", "boolean"],
      style: {
        color: "var(--color-lime-200)", // Vibrant red for keywords
      },
    },
    {
      types: ["function", "method"],
      style: {
        color: "var(--color-pink-300)", // Bright cyan for functions
      },
    },
    {
      types: ["string", "template-string"],
      style: {
        color: "var(--color-lime-300)", // Fresh lime for strings
      },
    },
    {
      types: ["number", "constant"],
      style: {
        color: "var(--color-orange-300)", // Warm orange for numbers
      },
    },
    {
      types: ["comment", "doc-comment"],
      style: {
        color: "var(--color-neutral-400)", // Subtle neutral for comments
        fontStyle: "italic" as const, // Type assertion to ensure literal type
      },
    },
    {
      types: ["operator", "symbol"],
      style: {
        color: "var(--color-red-500)", // Softer red for operators
      },
    },
    {
      types: ["punctuation"],
      style: {
        color: "var(--color-neutral-200)", // Light neutral for punctuation
      },
    },
    {
      types: ["class-name", "tag"],
      style: {
        color: "var(--color-violet-300)", // Purple for classes and tags
      },
    },
    {
      types: ["parameter"],
      style: {
        color: "var(--color-amber-200)", // Soft amber for parameters
      },
    },
  ],
};

// Register Aiken language with Prism
Prism.languages.aiken = {
  keyword: {
    pattern:
      /\b(if|else|when|fn|pub|priv|use|type|const|let|in|test|expect|fail|error|debug|trace|spend|mint|burn|datum|redeemer|validator|script|module|struct|enum|opaque|constraint)\b/,
    greedy: true,
  },
  function: {
    pattern: /\b[a-z_][a-z0-9_]*\s*\(/i,
    greedy: true,
    inside: {
      punctuation: /\(/,
    },
  },
  string: {
    pattern: /"[^"]*"/,
    greedy: true,
  },
  number: /\b\d+(\.\d+)?\b/,
  comment: {
    pattern: /\/\/.*/,
    greedy: true,
  },
  operator: /[+\-*/=<>!&|]+/,
  punctuation: /[{}[\]();,:]/,
};

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export default function CodeBlock({
  code,
  language = "aiken",
  showLineNumbers = true,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={copyToClipboard}
      className={`relative cursor-pointer rounded-lg overflow-hidden active:ring-2 ty active:ring-pink-300 transition-all  bg-neutral-900 ${className}`}
    >
      <div className="absolute right-2 top-2">
        <button className="px-2 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 rounded transition-colors">
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <Highlight theme={customTheme} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={`${className} p-4 overflow-x-auto`} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                {showLineNumbers && (
                  <span className="table-cell text-right pr-4 select-none text-gray-500">
                    {i + 1}
                  </span>
                )}
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
