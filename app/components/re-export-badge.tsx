interface ReExportBadgeProps {
  reExportedAs?: string[];
}

export default function ReExportBadge({ reExportedAs }: ReExportBadgeProps) {
  if (!reExportedAs || reExportedAs.length === 0) return null;

  return (
    <div>
      <span>Re-exported as:</span>
      <div>
        {reExportedAs.map((reExport, index) => (
          <span key={index}>{reExport}</span>
        ))}
      </div>
    </div>
  );
}
