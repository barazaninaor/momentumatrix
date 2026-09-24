import React, { useState } from "react";
import { Button } from "../Button/Button";
import { Paragraph } from "../Paragraph/Paragraph";

type ToggleParagraphProps = {
  paragraphText?: string;
  hideButtonText?: string;
  showButtonText?: string;
  buttonVariant?: "text" | "solid";
};

export const ToggleParagraph: React.FC<ToggleParagraphProps> = ({
  paragraphText,
  hideButtonText = "Hide",
  showButtonText = "Show",
  buttonVariant = "solid",
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const handleToggle = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <>
      <Button
        text={isVisible ? hideButtonText : showButtonText}
        variant={buttonVariant}
        onClick={handleToggle}
      />
      {isVisible && <Paragraph Paragraph={paragraphText} />}
    </>
  );
};
