import {
  IconLayoutGrid,
  IconLayoutColumns,
  IconLayoutDashboard,
  IconSquare,
  IconGrid3x3,
} from "@tabler/icons-react";
import { useState } from "react";

export type GridSize = "1" | "2" | "3" | "4";

interface GridToggleButtonProps {
  onGridSizeChange?: (gridSize: GridSize) => void;
}

export default function GridToggleButton({
  onGridSizeChange,
}: GridToggleButtonProps) {
  const [gridSize, setGridSize] = useState<GridSize>("4");

  const toggleGridSize = () => {
    const newGridSize = (() => {
      switch (gridSize) {
        case "1":
          return "2";
        case "2":
          return "3";
        case "3":
          return "4";
        case "4":
          return "1";
        default:
          return "4";
      }
    })();

    setGridSize(newGridSize);
    onGridSizeChange?.(newGridSize);
  };

  // Get grid icon based on current grid size
  const getGridIcon = () => {
    switch (gridSize) {
      case "1":
        return IconSquare;
      case "2":
        return IconLayoutColumns;
      case "3":
        return IconGrid3x3;
      case "4":
        return IconLayoutDashboard;
      default:
        return IconLayoutGrid;
    }
  };

  return (
    <button
      onClick={toggleGridSize}
      className="button-1 flex items-center gap-1.5 !bg-neutral-900 !text-pink-300"
    >
      {(() => {
        const IconComponent = getGridIcon();
        return <IconComponent size={16} />;
      })()}
      Grid {gridSize}
    </button>
  );
}

// Utility function to get grid classes based on grid size
export const getGridClasses = (gridSize: GridSize) => {
  switch (gridSize) {
    case "1":
      return "grid grid-cols-1 gap-5";
    case "2":
      return "grid grid-cols-1 md:grid-cols-2 gap-5";
    case "3":
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5";
    case "4":
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5";
    default:
      return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5";
  }
};
