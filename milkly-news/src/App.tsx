import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Placeholder(): JSX.Element {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        fontFamily: "var(--milkly-font-sans)",
        color: "var(--milkly-fg-primary)",
        background: "var(--milkly-bg-primary)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--milkly-font-serif)",
          fontSize: "2rem",
          fontWeight: 600,
        }}
      >
        milkly.news
      </h1>
    </div>
  );
}

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Placeholder />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
