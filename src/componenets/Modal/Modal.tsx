import React from "react";
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
        
        <div className="modal-button-wrapper" onClick={onClose}>
          <Button text="Close" variant="solid" />
        </div>
      </div>
    </div>
  );
};