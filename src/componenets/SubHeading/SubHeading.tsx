import React from "react";
import "./SubHeading.css";

type SubHeadingProps = {
  SubHeading?: string;
};

export const SubHeading: React.FC<SubHeadingProps> = ({ SubHeading }) => {
  return <h2 className="SubHeading">{SubHeading || "Algo Trading"}</h2>;
};
