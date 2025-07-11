import { forwardRef } from "react";

interface ItemCardProps {
  children: React.ReactNode;
  className?: string;
}

const ItemCard = forwardRef<HTMLDivElement, ItemCardProps>(
  ({ children, className = "" }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-5 border-b border-neutral-800  ${className}`}
      >
        {children}
      </div>
    );
  }
);

ItemCard.displayName = "ItemCard";

export default ItemCard;
