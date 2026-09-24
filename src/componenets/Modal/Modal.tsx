import React, { useEffect } from "react";
import "./Modal.css";
import { Button } from "../Button/Button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: React.ReactNode;
  showEmail?: boolean;
};

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title = "Access Denied", 
  message = (
    <>
      This page is restricted to authorized users only. <br />For further information please contact Naor:
    </>
  ),
  showEmail = true
}) => {
  // פונקציה לסגירה נקייה שגם משחררת את הפוקוס מהאלמנט הנוכחי בדפדפן
  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  // הוספת האזנה למקש Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">{title}</h2>
        <p className="modal-text">{message}</p>
        
        {showEmail && (
          <a href="mailto:barazaninaor@gmail.com" className="modal-email">
            barazaninaor@gmail.com
          </a>
        )}
        
        <div className="modal-button-wrapper" onClick={handleClose}>
          <Button text="Close" variant="solid" />
        </div>
      </div>
    </div>
  );
};