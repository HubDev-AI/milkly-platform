import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
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

hydrateRoot(
  rootElement,
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
