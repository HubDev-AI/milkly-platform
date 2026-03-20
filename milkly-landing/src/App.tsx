import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageLayout } from "@/layouts/PageLayout";
import { LandingPage } from "@/pages/LandingPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { TermsPage } from "@/pages/TermsPage";

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
