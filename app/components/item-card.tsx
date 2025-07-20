import { forwardRef } from "react";

interface ItemCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const ItemCard = forwardRef<HTMLDivElement, ItemCardProps>(
  ({ children, className = "", onClick }, ref) => {
    return (
      <div ref={ref} className={`  ${className}`} onClick={onClick}>
        {children}
      </div>
    );
  }
);

ItemCard.displayName = "ItemCard";

export default ItemCard;
