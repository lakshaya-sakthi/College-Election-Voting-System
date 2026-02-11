import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PageWrapper from "./components/PageWrapper";

import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPositions from "./pages/AdminPositions";
import AdminCandidates from "./pages/AdminCandidates";
import Vote from "./pages/Vote";
import Results from "./pages/Results";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        
        <Route
          path="/"
          element={<PageWrapper><Login /></PageWrapper>}
        />

        <Route
          path="/login"
          element={<PageWrapper><Login /></PageWrapper>}
        />

        <Route
          path="/register"
          element={<PageWrapper><Register /></PageWrapper>}
        />

        <Route
          path="/admin-register"
          element={<PageWrapper><AdminRegister /></PageWrapper>}
        />

        <Route
          path="/vote"
          element={
            <ProtectedRoute>
              <PageWrapper><Vote /></PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <PageWrapper><Results /></PageWrapper>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <PageWrapper><AdminDashboard /></PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/candidates"
          element={
            <ProtectedRoute>
              <PageWrapper><AdminCandidates /></PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/positions"
          element={
            <ProtectedRoute>
              <PageWrapper><AdminPositions /></PageWrapper>
            </ProtectedRoute>
          }
        />

      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <ToastContainer position="top-center" autoClose={1500} />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
