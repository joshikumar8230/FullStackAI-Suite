import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import AutoCategoryPage from "./AutoCategoryPage";
import ProposalGeneratorPage from "./ProposalGeneratorPage";
import SupportBotPage from "./SupportBotPage";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";
import ViewAutoCategoryPage from "./ViewAutoCategoryPage";
import ProtectedRoute from "./ProtectedRoute"; 

function AppContent() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/signup";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
     
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />


        <Route
          path="/auto-category"
          element={
            <ProtectedRoute>
              <AutoCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-auto-category"
          element={
            <ProtectedRoute>
              <ViewAutoCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/b2b-proposal"
          element={
            <ProtectedRoute>
              <ProposalGeneratorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support-bot"
          element={
            <ProtectedRoute>
              <SupportBotPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function AppRouter() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default AppRouter;