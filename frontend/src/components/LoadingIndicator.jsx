function LoadingIndicator({ label = "Loading" }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}

export default LoadingIndicator;
