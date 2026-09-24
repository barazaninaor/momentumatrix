import React from "react";
import "./Button.css";

type ButtonProps = {
  text?: string;
  variant?: "text" | "solid";
  onClick?: () => void;
  style?: React.CSSProperties;
};

export const Button: React.FC<ButtonProps> = ({
  text = "Click me",
  variant = "text",
  onClick,
  style,
}) => {
  const className = `custom-btn ${variant === "solid" ? "solid-style" : "text-style"}`;

  return (
    <button className={className} onClick={onClick} style={style}>
      {text}
    </button>
  );
};