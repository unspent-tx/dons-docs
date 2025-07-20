interface ToggleOption {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  className?: string;
}

function Toggle({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <button
      onClick={() => onToggle(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-pink-500" : "bg-neutral-700"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function ToggleGroup({
  options,
  className = "",
}: ToggleGroupProps) {
  return (
    <div className={`flex flex-col w-full gap-4 ${className}`}>
      {options.map((option) => {
        const IconComponent = option.icon;
        return (
          <div key={option.id} className="flex items-center gap-2 ">
            {IconComponent && <IconComponent size={12} />}
            <span className="text-xs flex-1  whitespace-nowrap font-medium text-neutral-300">
              {option.label}
            </span>
            <div
              style={{
                zoom: 0.7,
              }}
            >
              <Toggle checked={option.checked} onToggle={option.onToggle} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
