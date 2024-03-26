import React from 'react';

// Aktualizacja stylów dla przykładu
const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  fontSize: '1em', // Zwiększona czcionka
  transform: 'translate(-50%, -50%)',
  zIndex: '999',
  backgroundColor: '#212529', // Zaktualizowany kolor tła
  color: '#e7e7e7', // Zaktualizowana czcionka
  padding: '20px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  borderRadius: '5px',
  width: '80%',
  maxWidth: '80%',
  maxHeight: '80%', // Ograniczenie maksymalnej szerokości
  overflowY: 'auto', // Umożliwienie przewijania
};
const headerStyle = {
    fontSize: '18px', // Zmniejszenie rozmiaru czcionki dla nagłówków
  };

const overlayStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  bottom: '0',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: '998',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '10px',
  right: '10px',
  border: '3px',
  background: 'none',
  cursor: 'pointer',
  fontSize: '40px', // Zwiększona czcionka dla przycisku zamknięcia
};

const childrenContainerStyle = {
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      fontSize: '16px', // Zmniejszenie rozmiaru czcionki dla nagłówków
    },
  };



  

// Komponent Modal
const Modal = ({ title, children, onClose }) => {
  return (
    <>
      <div style={overlayStyle} onClick={onClose}></div>
      <div style={modalStyle}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>
        {title && <h2>{title}</h2>}
        <div className="modal-children">
            {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
