import { ReactNode } from "react";

interface RadioOption {
  value: string;
  label: string;
  icon?: React.ComponentType<any>;
  count?: number;
}

interface RadioButtonGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  name: string;
}

export default function RadioButtonGroup({
  options,
  value,
  onChange,
  className = "",
  name,
}: RadioButtonGroupProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {options.map((option) => {
        const IconComponent = option.icon;
        const isSelected = value === option.value;

        return (
          <label
            key={option.value}
            className={`relative px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer border ${
              isSelected
                ? "bg-pink-500/20 border-pink-500/40 text-pink-300 shadow-lg shadow-pink-500/10"
                : "bg-neutral-900/50 border-neutral-700 text-neutral-400 hover:bg-neutral-800/50 hover:border-neutral-600 hover:text-neutral-300"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={(e) => onChange(e.target.value)}
              className="sr-only"
            />

            {/* Custom radio indicator */}
            <div
              className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                isSelected
                  ? "border-pink-400 bg-pink-400"
                  : "border-neutral-500 bg-transparent"
              }`}
            >
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              )}
            </div>

            {IconComponent && <IconComponent size={16} />}
            <span className="font-medium text-xs whitespace-nowrap truncate">
              {option.label}
            </span>
            {option.count !== undefined && (
              <span className="font-mono text-xs opacity-75 ml-auto">
                {" "}
                ({option.count})
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
