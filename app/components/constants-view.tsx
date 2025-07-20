import ItemCard from "./item-card";
import ItemHeader from "./item-header";
import ItemMeta from "./item-meta";
import CodeBlock from "./code-block";
import ReExportBadge from "./re-export-badge";
import SectionTitle from "./section-title";

interface Constant {
  fullName: string;
  name: string;
  type: string;
  value: string;
  line: number;
  isPublic: boolean;
  source: string;
  reExportedAs?: string[];
}

interface ConstantsViewProps {
  constants: Constant[];
  privateConstants: Constant[];
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  toggleCodeBlock: (id: string) => void;
}

export default function ConstantsView({
  constants,
  privateConstants,
  showCodeBlocksByDefault,
  expandedCodeBlocks,
  toggleCodeBlock,
}: ConstantsViewProps) {
  const allConstants = [...constants, ...privateConstants];

  return (
    <>
      {allConstants.map((constant) => (
        <ItemCard key={constant.fullName}>
          <ItemHeader
            name={constant.name}
            source={constant.source}
            badges={
              !constant.isPublic
                ? [<span key="private">Private</span>]
                : undefined
            }
            line={constant.line}
          />
          <ItemMeta fullName={constant.fullName} />
          <CodeBlock code={`${constant.type} = ${constant.value}`} />
          <ReExportBadge reExportedAs={constant.reExportedAs} />
        </ItemCard>
      ))}
    </>
  );
}
