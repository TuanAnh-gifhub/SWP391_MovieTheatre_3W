import React from "react";
import { RouterProvider } from 'react-router-dom'
import { router } from './routers/router'
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// Custom toast styles
const toastStyle = {
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  fontSize: '14px',
  fontWeight: '500',
  padding: '16px 20px',
  minHeight: 'auto',
  width: '400px',
  maxWidth: '400px',
  wordWrap: 'break-word',
  whiteSpace: 'pre-wrap',
  lineHeight: '1.5',
  overflowWrap: 'break-word',
};

const toastContainerStyle = {
  top: '20px',
  right: '20px',
};

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer 
        position="top-right"
        autoClose={4000}
        closeOnClick={true}
        draggable={true}
        pauseOnHover={true}
        hideProgressBar={false}
        newestOnTop={true}
        rtl={false}
        style={toastContainerStyle}
        toastStyle={toastStyle}
        closeButton={({ closeToast }) => (
          <button
            onClick={closeToast}
            className="text-red-500 hover:text-red-700 transition-colors duration-200"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '0',
              lineHeight: '1',
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            ×
          </button>
        )}
        toastClassName={({ type }) => {
          let className = "custom-toast relative break-words ";
          switch (type) {
            case 'success':
              className += "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800";
              break;
            case 'error':
              className += "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800";
              break;
            case 'warning':
              className += "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-800";
              break;
            case 'info':
              className += "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800";
              break;
            default:
              className += "bg-white border-gray-200 text-gray-800";
          }
          return className;
        }}
      />
    </>
  );
}

export default App;
