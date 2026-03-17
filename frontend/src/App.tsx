import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute } from "./hooks/useAuth";
import { Layout } from "./components/layout/Layout";
import { Toaster } from "./components/ui/toaster";
import { toast } from "./components/ui/use-toast";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import FeedCreatePage from "./pages/FeedCreatePage";
import FeedEditPage from "./pages/FeedEditPage";

export default function App() {
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      toast({
        variant: "destructive",
        title: t("common.unexpectedError"),
        description: event.reason?.message ?? t("common.unexpectedErrorDesc"),
      });
    };
    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/feeds/new" element={<FeedCreatePage />} />
              <Route path="/feeds/:id" element={<FeedEditPage />} />
            </Route>
            <Route path="*" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-2xl font-bold">404 - Page Not Found</h1></div>} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
