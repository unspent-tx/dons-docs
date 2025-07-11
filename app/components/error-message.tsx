interface ErrorMessageProps {
  error: string;
}

export default function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <div>
      <div>
        <div>
          <div>⚠️ Error</div>
          <div>
            <div>Error</div>
            <p>{error}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
