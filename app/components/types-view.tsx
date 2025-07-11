import { useState, useRef, useEffect } from "react";
import ItemCard from "./item-card";
import ItemHeader from "./item-header";
import ItemMeta from "./item-meta";
import ClickableTypeCodeBlock from "./clickable-type-code-block";
import ReExportBadge from "./re-export-badge";
import SectionTitle from "./section-title";

interface Type {
  fullName: string;
  name: string;
  definition: string;
  line: number;
  isPublic: boolean;
  source: "stdlib" | "prelude" | "vodka";
  reExportedAs?: string[];
}

interface TypesViewProps {
  types: Type[];
  privateTypes: Type[];
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  toggleCodeBlock: (id: string) => void;
}

export default function TypesView({
  types,
  privateTypes,
  showCodeBlocksByDefault,
  expandedCodeBlocks,
  toggleCodeBlock,
}: TypesViewProps) {
  const allTypes = [...types, ...privateTypes];
  const [highlightedType, setHighlightedType] = useState<string | null>(null);
  const typeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Clear highlight after a delay
  useEffect(() => {
    if (highlightedType) {
      const timer = setTimeout(() => {
        setHighlightedType(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedType]);

  const handleTypeClick = (typeName: string) => {
    // Find the type in our list
    const targetType = allTypes.find((type) => type.name === typeName);
    if (targetType && typeRefs.current[targetType.fullName]) {
      // Scroll to the type
      typeRefs.current[targetType.fullName]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Highlight the type
      setHighlightedType(targetType.fullName);
    }
  };

  return (
    <div>
      <div className="">
        {allTypes.map((type) => (
          <ItemCard
            key={type.fullName}
            ref={(el: HTMLDivElement | null) => {
              typeRefs.current[type.fullName] = el;
            }}
            className={`transition-all duration-300 space-y-5 ${
              highlightedType === type.fullName
                ? "ring-2 ring-pink-500 bg-pink-950 "
                : ""
            }`}
          >
            <ItemHeader
              name={type.name}
              source={type.source}
              badges={
                !type.isPublic
                  ? [
                      <span key="private" className="text-orange-400">
                        Private
                      </span>,
                    ]
                  : undefined
              }
              line={type.line}
            />
            <ItemMeta fullName={type.fullName} />
            <ClickableTypeCodeBlock
              code={type.definition}
              availableTypes={allTypes}
              onTypeClick={handleTypeClick}
            />
            <ReExportBadge reExportedAs={type.reExportedAs} />
          </ItemCard>
        ))}
      </div>
    </div>
  );
}
