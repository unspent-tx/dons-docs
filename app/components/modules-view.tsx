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
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                {module.functions.length} functions • {module.atoms.length}{" "}
                atoms • {module.types.length} types
              </div>
            </ItemMeta>
            <div>
              <StatItem label="Functions" value={module.functions.length} />
              <StatItem label="Atoms" value={module.atoms.length} />
              <StatItem label="Types" value={module.types.length} />
              <StatItem label="Constants" value={module.constants.length} />
            </div>
          </ItemCard>
        ))}
      </div>
    </div>
  );
}
