const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p className="spinner-text">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
