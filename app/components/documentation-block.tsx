import CodeBlock from "./code-block";

interface DocumentationBlockProps {
  documentation: string;
}

export default function DocumentationBlock({
  documentation,
}: DocumentationBlockProps) {
  return (
    <div>
      <CodeBlock code={documentation} />
    </div>
  );
}
