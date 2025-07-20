import ItemCard from "./item-card";
import ItemHeader from "./item-header";
import ItemMeta from "./item-meta";
import StatItem from "./stat-item";
import SectionTitle from "./section-title";

interface Module {
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

interface ModulesViewProps {
  modules: Module[];
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  toggleCodeBlock: (id: string) => void;
  onModuleClick?: (module: Module) => void;
}

export default function ModulesView({
  modules,
  showCodeBlocksByDefault,
  expandedCodeBlocks,
  toggleCodeBlock,
  onModuleClick,
}: ModulesViewProps) {
  return (
    <>
      {modules.map((module) => (
        <ItemCard
          key={module.key}
          className={
            onModuleClick
              ? "cursor-pointer hover:bg-neutral-800/50 transition-colors duration-200"
              : ""
          }
          onClick={onModuleClick ? () => onModuleClick(module) : undefined}
        >
          <ItemHeader name={module.name} source={module.source} />
          <ItemMeta>
            <div>
              {module.functions.length} functions • {module.types.length} types
              • {module.constants.length} constants
            </div>
          </ItemMeta>
        </ItemCard>
      ))}
    </>
  );
}
