import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { cssVariables } from "milkly-shared/tokens";
import "./index.css";
import App from "./App";

// Inject Milkly design tokens into document root
const style = document.createElement("style");
style.textContent = `:root { ${cssVariables} }`;
document.head.appendChild(style);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
