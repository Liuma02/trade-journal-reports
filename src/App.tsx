import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TradeProvider } from "@/contexts/TradeContext";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import TradesPage from "./pages/Trades";
import Journal from "./pages/Journal";
import Reports from "./pages/Reports";
import Import from "./pages/Import";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TradeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/trades" element={<TradesPage />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/import" element={<Import />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TradeProvider>
  </QueryClientProvider>
);

export default App;
