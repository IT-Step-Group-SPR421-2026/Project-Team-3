import "./LoadingSpinner.css";

export default function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      Loading your habits…
    </div>
  );
}
