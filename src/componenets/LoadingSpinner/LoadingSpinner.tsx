import React from "react";
import "./LoadingSpinner.css";

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading data...",
}) => {
  return (
    <div className="spinner-container">
      <div className="spinner-ring">
        <div className="spinner-core"></div>
      </div>
      <p className="spinner-message">{message}</p>
    </div>
  );
};