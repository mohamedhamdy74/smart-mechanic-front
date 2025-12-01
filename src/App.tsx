import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { AuthProvider } from "@/contexts/SimpleAuthContext";
import { NotificationProvider } from "@/contexts/WebSocketNotificationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const Store = lazy(() => import("./pages/Store"));
const Cart = lazy(() => import("./pages/Cart"));
const Mechanics = lazy(() => import("./pages/Mechanics"));
const AIDiagnosis = lazy(() => import("./pages/AIDiagnosis"));
const Auth = lazy(() => import("./pages/Auth"));
const ClientProfile = lazy(() => import("./pages/ClientProfile"));
const EditClientProfile = lazy(() => import("./pages/EditClientProfile"));
const MechanicProfile = lazy(() => import("./pages/MechanicProfile"));
const MechanicPublicProfile = lazy(() => import("./pages/MechanicPublicProfile"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const EditMechanicProfile = lazy(() => import("./pages/EditMechanicProfile"));
const WorkshopProfile = lazy(() => import("./pages/WorkshopProfile"));
const OrderManagement = lazy(() => import("./pages/OrderManagement"));
const InventoryManagement = lazy(() => import("./pages/InventoryManagement"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminReviews = lazy(() => import("./pages/AdminReviews"));
const Chat = lazy(() => import("./pages/Chat"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                </div>
              }>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/auth" element={<Auth />} />

                  {/* Protected Routes */}
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                  <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
                  <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/mechanics" element={<ProtectedRoute><Mechanics /></ProtectedRoute>} />
                  <Route path="/mechanic-public/:id" element={<ProtectedRoute><MechanicPublicProfile /></ProtectedRoute>} />
                  <Route path="/book-appointment/:id" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
                  <Route path="/ai-diagnosis" element={<ProtectedRoute><AIDiagnosis /></ProtectedRoute>} />
                  <Route path="/profile/client" element={<ProtectedRoute roles={['client']}><ClientProfile /></ProtectedRoute>} />
                  <Route path="/profile/client/edit" element={<ProtectedRoute roles={['client']}><EditClientProfile /></ProtectedRoute>} />
                  <Route path="/profile/mechanic" element={<ProtectedRoute roles={['mechanic']}><MechanicProfile /></ProtectedRoute>} />
                  <Route path="/profile/mechanic/edit" element={<ProtectedRoute roles={['mechanic']}><EditMechanicProfile /></ProtectedRoute>} />
                  <Route path="/profile/workshop" element={<ProtectedRoute roles={['workshop']}><WorkshopProfile /></ProtectedRoute>} />
                  <Route path="/order-management" element={<ProtectedRoute roles={['workshop']}><OrderManagement /></ProtectedRoute>} />
                  <Route path="/inventory-management" element={<ProtectedRoute roles={['workshop']}><InventoryManagement /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute roles={['workshop']}><ReportsPage /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                  <Route path="/about" element={<ProtectedRoute><Index /></ProtectedRoute>} />

                  {/* Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                  <Route path="/admin/reviews" element={<ProtectedRoute roles={['admin']}><AdminReviews /></ProtectedRoute>} />

                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
