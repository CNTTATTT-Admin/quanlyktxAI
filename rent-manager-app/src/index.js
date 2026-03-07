import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { toast } from "react-toastify";
import registerServiceWorker from "./registerServiceWorker";
import "./assets/vendor/animate.css/animate.min.css";
import "./assets/vendor/bootstrap/css/bootstrap.min.css";
import "./assets/vendor/bootstrap-icons/bootstrap-icons.css";
import "./assets/vendor/swiper/swiper-bundle.min.css";
import "./assets/css/bootstrap.min.css";
import "./assets/css/style.css";

// Global interceptor for toast.error to deduplicate face validation messages
const originalToastError = toast.error;
toast.error = (content, options) => {
  if (
    typeof content === "string" &&
    content.includes("Vui lòng hoàn tất xác thực khuôn mặt")
  ) {
    return originalToastError(content, {
      ...options,
      toastId: "face-required-toast-id", // Same ID overrides existing toast instead of stacking
    });
  }
  return originalToastError(content, options);
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root"),
);
registerServiceWorker();
