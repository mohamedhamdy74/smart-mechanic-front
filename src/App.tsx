import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import Mechanics from "./pages/Mechanics";
import AIDiagnosis from "./pages/AIDiagnosis";
import Auth from "./pages/Auth";
import ClientProfile from "./pages/ClientProfile";
import EditClientProfile from "./pages/EditClientProfile";
import MechanicProfile from "./pages/MechanicProfile";
import MechanicPublicProfile from "./pages/MechanicPublicProfile";
import BookAppointment from "./pages/BookAppointment";
import EditMechanicProfile from "./pages/EditMechanicProfile";
import WorkshopProfile from "./pages/WorkshopProfile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/store" element={<Store />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/mechanics" element={<Mechanics />} />
            <Route path="/mechanic/:id" element={<MechanicPublicProfile />} />
            <Route path="/book-appointment/:id" element={<BookAppointment />} />
            <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/client" element={<ClientProfile />} />
            <Route path="/profile/client/edit" element={<EditClientProfile />} />
            <Route path="/profile/mechanic" element={<MechanicProfile />} />
            <Route path="/profile/mechanic/edit" element={<EditMechanicProfile />} />
            <Route path="/profile/workshop" element={<WorkshopProfile />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/about" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
