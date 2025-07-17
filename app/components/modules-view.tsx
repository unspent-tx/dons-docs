import ItemCard from "./item-card";
import ItemHeader from "./item-header";
import ItemMeta from "./item-meta";
import StatItem from "./stat-item";
import SectionTitle from "./section-title";

interface Module {
  key: string;
  name: string;
  source: "stdlib" | "prelude" | "vodka";
  functions: any[]; // Array of function objects
  atoms: any[]; // Array of atom objects
  types: any[]; // Array of type objects
  privateTypes: any[]; // Array of private type objects
  constants: any[]; // Array of constant objects
  privateConstants: any[]; // Array of private constant objects
  dependencies: string[];
  isReExportFile?: boolean;
  reExportedAs?: string[];
}

interface ModulesViewProps {
  modules: Module[];
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  toggleCodeBlock: (id: string) => void;
}

export default function ModulesView({
  modules,
  showCodeBlocksByDefault,
  expandedCodeBlocks,
  toggleCodeBlock,
}: ModulesViewProps) {
  return (
    <>
      {modules.map((module) => (
        <ItemCard key={module.key}>
          <ItemHeader
            name={module.name}
            source={module.source}
            badges={
              module.isReExportFile
                ? [<span key="re-export">Re-export</span>]
                : undefined
            }
          />
          <ItemMeta>
            <div>
              {module.functions.length} functions • {module.atoms.length} atoms
              • {module.types.length} types
            </div>
          </ItemMeta>
        </ItemCard>
      ))}
    </>
  );
}
