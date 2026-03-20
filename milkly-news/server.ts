import http from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ViteDevServer } from "vite";

const isProduction = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 5175;
const __dirname = new URL(".", import.meta.url).pathname;

let vite: ViteDevServer | undefined;
let template: string;
let render: (url: string) => { html: string; statusCode: number };
let ssrCssVariables: string;

if (isProduction) {
  template = readFileSync(resolve(__dirname, "dist/client/index.html"), "utf-8");
  const serverModule = (await import(
    resolve(__dirname, "dist/server/entry-server.js")
  )) as { render: (url: string) => { html: string; statusCode: number }; cssVariables: string };
  render = serverModule.render;
  ssrCssVariables = serverModule.cssVariables;
} else {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  template = readFileSync(resolve(__dirname, "index.html"), "utf-8");
}

function getContentType(pathname: string): string {
  const ext = pathname.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    js: "application/javascript",
    mjs: "application/javascript",
    css: "text/css",
    html: "text/html",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
  };
  return types[ext ?? ""] ?? "application/octet-stream";
}

async function handleDevAssets(
  devServer: ViteDevServer,
  req: Request,
  url: URL,
): Promise<Response | null> {
  const pathname = url.pathname;

  // Let Vite's middleware handle HMR, module transforms, and static files
  if (
    pathname.startsWith("/node_modules/") ||
    pathname.startsWith("/__vite") ||
    pathname.startsWith("/src/") ||
    pathname.startsWith("/@") ||
    pathname.includes(".")
  ) {
    return new Promise<Response | null>((resolveResponse) => {
      // Use Vite's connect middleware via a minimal Node-compatible shim
      const fakeReq = new http.IncomingMessage(
        undefined as unknown as import("node:net").Socket,
      );
      fakeReq.url = req.url.replace(url.origin, "");
      fakeReq.method = req.method;
      fakeReq.headers = Object.fromEntries(req.headers.entries());

      const chunks: Buffer[] = [];
      const fakeRes = new http.ServerResponse(fakeReq);

      const originalWrite = fakeRes.write.bind(fakeRes);
      const originalEnd = fakeRes.end.bind(fakeRes);

      fakeRes.write = function writeShim(chunk: unknown): boolean {
        if (chunk) chunks.push(Buffer.from(chunk as Buffer));
        return originalWrite(chunk as string | Buffer);
      };

      fakeRes.end = function endShim(chunk?: unknown): http.ServerResponse {
        if (chunk) chunks.push(Buffer.from(chunk as Buffer));
        const body = Buffer.concat(chunks);
        const headers: Record<string, string> = {};
        const rawHeaders = fakeRes.getHeaders();
        for (const [key, val] of Object.entries(rawHeaders)) {
          if (val !== undefined) {
            headers[key] = String(val);
          }
        }
        resolveResponse(
          new Response(body.length > 0 ? body : null, {
            status: fakeRes.statusCode,
            headers,
          }),
        );
        return originalEnd() as http.ServerResponse;
      };

      devServer.middlewares(fakeReq, fakeRes, () => {
        // Vite didn't handle it -- fall through to SSR
        resolveResponse(null);
      });
    });
  }

  return null;
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // In production, serve static assets from dist/client/
  if (isProduction && (pathname.startsWith("/assets/") || pathname.includes("."))) {
    try {
      const filePath = resolve(__dirname, `dist/client${pathname}`);
      const clientDir = resolve(__dirname, "dist/client/");
      if (!filePath.startsWith(clientDir)) {
        return new Response("Forbidden", { status: 403 });
      }
      const file = Bun.file(filePath);
      if (await file.exists()) {
        const cacheControl = pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600";
        return new Response(file, {
          headers: {
            "Content-Type": getContentType(pathname),
            "Cache-Control": cacheControl,
          },
        });
      }
    } catch {
      // Fall through to SSR
    }
  }

  // In dev mode, let Vite handle asset/module requests
  if (!isProduction && vite) {
    const assetResponse = await handleDevAssets(vite, req, url);
    if (assetResponse) {
      return assetResponse;
    }
  }

  // SSR render for page requests
  try {
    let html: string;
    let statusCode = 200;

    if (!isProduction && vite) {
      const devTemplate = await vite.transformIndexHtml(pathname, template);
      const mod = (await vite.ssrLoadModule("/src/entry-server.tsx")) as {
        render: (url: string) => { html: string; statusCode: number };
        cssVariables: string;
      };
      const result = mod.render(pathname);
      const tokenStyle = `<style>:root { ${mod.cssVariables} }</style>`;
      html = devTemplate
        .replace("</head>", `${tokenStyle}</head>`)
        .replace("<!--ssr-outlet-->", result.html);
      statusCode = result.statusCode;
    } else {
      const result = render(pathname);
      const tokenStyle = `<style>:root { ${ssrCssVariables} }</style>`;
      html = template
        .replace("</head>", `${tokenStyle}</head>`)
        .replace("<!--ssr-outlet-->", result.html);
      statusCode = result.statusCode;
    }

    return new Response(html, {
      status: statusCode,
      headers: { "Content-Type": "text/html" },
    });
  } catch (e) {
    if (!isProduction && vite) {
      vite.ssrFixStacktrace(e as Error);
    }
    console.error("SSR render error:", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}

Bun.serve({
  port: PORT,
  fetch: handleRequest,
});

console.log(
  `milkly-news ${isProduction ? "production" : "dev"} server running at http://localhost:${String(PORT)}`,
);
