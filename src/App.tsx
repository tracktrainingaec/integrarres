import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Checkin from "./pages/Checkin";
import Menu from "./pages/Menu";
import CloudPage from "./pages/CloudPage";
import EvaluationPage from "./pages/EvaluationPage";
import Galeria from "./pages/Galeria";
import DashboardPage from "./pages/DashboardPage";
import CloudProjection from "./pages/CloudProjection";
import ProtectedRoute from "./components/ProtectedRoute";
import Sorteio from "./pages/Sorteio";
import Joias from "./pages/Joias";
import { AIConsultant } from "./components/AIConsultant";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

const AIConsultantWrapper = () => {
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem('user_session');
      setHasSession(!!session);
    };

    checkSession();
    window.addEventListener('storage', checkSession);
    const interval = setInterval(checkSession, 1000);

    return () => {
      window.removeEventListener('storage', checkSession);
      clearInterval(interval);
    };
  }, []);

  if (!hasSession) return null;
  return <AIConsultant />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/joias"
            element={
              <ProtectedRoute>
                <Joias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nuvem"
            element={
              <ProtectedRoute>
                <CloudPage />
              </ProtectedRoute>
            }
          />
          <Route path="/nuvem-telao" element={<CloudProjection />} />
          <Route path="/nuvem-telao-v4" element={<CloudProjection />} />
          <Route
            path="/avaliacao"
            element={
              <ProtectedRoute>
                <EvaluationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/galeria"
            element={
              <ProtectedRoute>
                <Galeria />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sorteio"
            element={
              <ProtectedRoute>
                <Sorteio />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<DashboardPage />} />
        </Routes>
        <AIConsultantWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
