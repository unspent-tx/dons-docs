import { IconDownload, IconDownloadOff } from "@tabler/icons-react";
import { useState } from "react";

interface ImportsToggleButtonProps {
  onToggle?: (showImports: boolean) => void;
}

export default function ImportsToggleButton({
  onToggle,
}: ImportsToggleButtonProps) {
  const [showImportsByDefault, setShowImportsByDefault] = useState(true);

  const toggleGlobalImports = () => {
    const newValue = !showImportsByDefault;
    setShowImportsByDefault(newValue);
    onToggle?.(newValue);
  };

  return (
    <button
      onClick={toggleGlobalImports}
      className={`transition-colors flex items-center gap-1.5 ${"button-1 !bg-neutral-900 !text-pink-300"}`}
    >
      {showImportsByDefault ? (
        <>
          <IconDownloadOff size={16} />
          No imports
        </>
      ) : (
        <>
          <IconDownload size={16} />
          Imports
        </>
      )}
    </button>
  );
}
