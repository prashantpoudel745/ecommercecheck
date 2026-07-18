// src/main.tsx
// React import removed - StrictMode removed to prevent double effect invocations
// which caused duplicate NaraRouter API requests per user prompt
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <App />
);
