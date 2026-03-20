import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { cssVariables } from "milkly-shared/tokens";
import App from "./App";

export function render(url: string): string {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );

  return html;
}

export { cssVariables };
