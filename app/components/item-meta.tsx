interface ItemMetaProps {
  fullName?: string;
  children?: React.ReactNode;
}

export default function ItemMeta({ fullName, children }: ItemMetaProps) {
  return (
    <div>
      {/* {fullName && <div>{fullName}</div>} */}
      {children}
    </div>
  );
}
