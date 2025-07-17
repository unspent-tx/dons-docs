import { IconBrackets, IconBracketsOff } from "@tabler/icons-react";
import { useState } from "react";

interface CodeBlocksToggleButtonProps {
  onToggle?: (showCodeBlocks: boolean) => void;
}

export default function CodeBlocksToggleButton({
  onToggle,
}: CodeBlocksToggleButtonProps) {
  const [showCodeBlocksByDefault, setShowCodeBlocksByDefault] = useState(true);

  const toggleGlobalCodeBlocks = () => {
    const newValue = !showCodeBlocksByDefault;
    setShowCodeBlocksByDefault(newValue);
    onToggle?.(newValue);
  };

  return (
    <button
      onClick={toggleGlobalCodeBlocks}
      className={`transition-colors flex items-center gap-1.5 ${"button-1 !bg-neutral-900 !text-pink-300"}`}
    >
      {showCodeBlocksByDefault ? (
        <>
          <IconBracketsOff size={16} />
          No code
        </>
      ) : (
        <>
          <IconBrackets size={16} />
          Code
        </>
      )}
    </button>
  );
}
