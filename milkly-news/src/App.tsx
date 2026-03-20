import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PublicLayout } from "@/layouts/PublicLayout";
import { BrowsePage } from "@/pages/BrowsePage";
import { NewsletterPage } from "@/pages/NewsletterPage";
import { CreatorProfilePage } from "@/pages/CreatorProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SsoCallbackPage } from "@/pages/SsoCallbackPage";

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Client-side singleton — SSR creates a fresh one per request via props
let clientQueryClient: QueryClient | undefined;

function getClientQueryClient(): QueryClient {
  if (!clientQueryClient) {
    clientQueryClient = createQueryClient();
  }
  return clientQueryClient;
}

interface AppProps {
  queryClient?: QueryClient | undefined;
}

function App({ queryClient }: AppProps): JSX.Element {
  const client = queryClient ?? getClientQueryClient();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={client}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<BrowsePage />} />
            <Route path="/@:username/:slug" element={<NewsletterPage />} />
            <Route path="/@:username" element={<CreatorProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/auth/callback" element={<SsoCallbackPage />} />
        </Routes>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
export { createQueryClient };
