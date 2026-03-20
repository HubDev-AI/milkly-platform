import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PublicLayout } from "@/layouts/PublicLayout";
import { BrowsePage } from "@/pages/BrowsePage";
import { NewsletterPage } from "@/pages/NewsletterPage";
import { CreatorProfilePage } from "@/pages/CreatorProfilePage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { SsoCallbackPage } from "@/pages/SsoCallbackPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
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
  );
}

export default App;
