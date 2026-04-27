import { toast } from "react-toastify";
import React from "react";
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";

// Custom toast configuration
const toastConfig = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Success toast with icon
export const showSuccessToast = (message) => {
  toast.success(
    React.createElement("div", { className: "flex items-center gap-3 pr-6" },
      React.createElement(CheckCircleOutlined, { className: "text-green-600 text-lg flex-shrink-0" }),
      React.createElement("span", { className: "font-medium flex-1" }, message)
    ),
    {
      ...toastConfig,
      icon: false, // Disable default icon
    }
  );
};

// Error toast with icon
export const showErrorToast = (message) => {
  toast.error(
    React.createElement("div", { className: "flex items-center gap-3 pr-6" },
      React.createElement(CloseCircleOutlined, { className: "text-red-600 text-lg flex-shrink-0" }),
      React.createElement("span", { className: "font-medium flex-1" }, message)
    ),
    {
      ...toastConfig,
      icon: false, // Disable default icon
    }
  );
};

// Warning toast with icon
export const showWarningToast = (message) => {
  toast.warning(
    React.createElement("div", { className: "flex items-center gap-3 pr-6" },
      React.createElement(ExclamationCircleOutlined, { className: "text-yellow-600 text-lg flex-shrink-0" }),
      React.createElement("span", { className: "font-medium flex-1" }, message)
    ),
    {
      ...toastConfig,
      icon: false, // Disable default icon
    }
  );
};

// Info toast with icon
export const showInfoToast = (message) => {
  toast.info(
    React.createElement("div", { className: "flex items-center gap-3 pr-6" },
      React.createElement(InfoCircleOutlined, { className: "text-blue-600 text-lg flex-shrink-0" }),
      React.createElement("span", { className: "font-medium flex-1" }, message)
    ),
    {
      ...toastConfig,
      icon: false, // Disable default icon
    }
  );
};

// Custom toast with custom icon
export const showCustomToast = (message, type = "info", icon = null) => {
  const toastFunction = toast[type] || toast.info;
  
  const content = icon 
    ? React.createElement("div", { className: "flex items-center gap-3 pr-6" },
        React.createElement("span", { className: "text-lg flex-shrink-0" }, icon),
        React.createElement("span", { className: "font-medium flex-1" }, message)
      )
    : React.createElement("div", { className: "flex items-center gap-3 pr-6" },
        React.createElement("span", { className: "font-medium flex-1" }, message)
      );
  
  toastFunction(content, {
    ...toastConfig,
    icon: false, // Disable default icon
  });
};

// Export default toast for backward compatibility
export { toast }; 