import "./LoadingSpinner.css";

export function LoadingSpinner({ text = "Carregando..." }) {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-ring" />
      <p className="loading-text">{text}</p>
    </div>
  );
}

export function CourseSkeletonGrid({ count = 3 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-body">
            <div className="skeleton-header-row">
              <div className="skeleton-logo" />
              <div className="skeleton-line short" />
            </div>
            <div className="skeleton-line title" />
            <div className="skeleton-line medium" />
            <div className="skeleton-button-row">
              <div className="skeleton-button" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
