import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Global styles
import "./global.css";

// Layouts
import MainLayout from "./layouts/MainLayout";
import MainLayoutconnect from "./layouts/MainLayoutconnect";
import Mainlayoutadmin from "./layouts/Mainlayoutadmin";

// Pages
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyCode from "./pages/auth/VerifyCode";
import ForumPage from "./pages/ForumPage";
import ClubsPage from "./pages/ClubsPage";
import EventsPage from "./pages/EventsPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

import UserProfilePopup from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="auth" element={<AuthPage />}>
              <Route index element={<SignIn />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="verify-code" element={<VerifyCode />} />
            </Route>
          </Route>

          {/* Protected User Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  'ROLE_ETUDIANT',
                  'ROLE_PROFESSEUR',
                  'ROLE_MODERATEUR'
                ]}
              />
            }
          >
            <Route path="/app" element={<MainLayoutconnect />}>
              <Route path="forum" element={<ForumPage />} />
              <Route path="clubs" element={<ClubsPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="profile" element={<ProfilePage />} />
             
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']} />
            }
          >
            <Route path="/acces" element={<Mainlayoutadmin />}>
              <Route path="admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);


export default App;