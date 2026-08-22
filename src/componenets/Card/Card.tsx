import type { ReactNode } from "react";
import "./Card.css";

interface CardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "", glowColor }) => {
  return (
    <div 
      className={`modern-card ${className}`} 
      style={glowColor ? ({ "--glow-color": glowColor } as React.CSSProperties) : undefined}
    >
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};