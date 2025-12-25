import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/Layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Users from "./pages/Users";
import Donation from "./pages/Donation";
import Books from "./pages/Books";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { isAdminAuthenticated } from "./services/api";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="messages" element={<Messages />} />
            <Route path="users" element={<Users />} />
            <Route path="books" element={<Books />} />
            <Route path="donation" element={<Donation />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App; 
 