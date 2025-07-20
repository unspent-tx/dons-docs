interface ActionButtonProps {
  icon?: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger" | "success";
  className?: string;
}

export default function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  className = "",
}: ActionButtonProps) {
  const baseClasses =
    "px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5";

  const variantClasses = {
    default: "button-1",
    danger: "button-1 !bg-red-500/20 !text-red-400 hover:!bg-red-500/30",
    success: "button-1 !bg-green-500/20 !text-green-400 hover:!bg-green-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );
}
