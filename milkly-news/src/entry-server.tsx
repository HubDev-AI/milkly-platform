import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router";
import { cssVariables } from "milkly-shared/tokens";
import App, { createQueryClient } from "./App";

export interface RenderResult {
  html: string;
  statusCode: number;
}

export function render(url: string): RenderResult {
  const queryClient = createQueryClient();

  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App queryClient={queryClient} />
      </StaticRouter>
    </StrictMode>,
  );

  // Detect 404: check if the rendered HTML contains the NotFoundPage marker
  const statusCode = html.includes('data-page="not-found"') ? 404 : 200;

  return { html, statusCode };
}

export { cssVariables };
