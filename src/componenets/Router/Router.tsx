import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { ScrollToTop } from "../ScrollToTop/ScrollToTop";
import { NavBar } from "../NavBar/NavBar";
import { arrForNav } from "../../types/NavBarInfo";
import { Home } from "../../pages/Home/Home";
import { About } from "../../pages/About/About";
import { Strategy } from "../../pages/Strategy/Strategy";
import { Backtesting } from "../../pages/Backtesting/Backtesting";
import { Performance } from "../../pages/Performance/Performance";
import { Portfolio } from "../../pages/Portfolio/Portfolio";
import { Transactions } from "../../pages/Transactions/Transactions";
import { Login } from "../../pages/Login/Login";
import { GenerateToken } from "../../pages/GenerateToken/GenerateToken"; 
import { TokenLogin } from "../../pages/TokenLogin/TokenLogin";
import { Footer } from "../Footer/Footer";
import { Modal } from "../Modal/Modal";

// ProtectedRoute component that shows the modal and returns to the previous page on close
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState<boolean>(false);
  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  useEffect(() => {
    if (!isLoggedIn) {
      setShowModal(true);
    }
  }, [location.pathname, isLoggedIn]);

  if (isLoggedIn) {
    return <>{children}</>;
  }

  const handleCloseModal = () => {
    setShowModal(false);
    navigate(-1);
  };

  return (
    <Modal 
      isOpen={showModal} 
      onClose={handleCloseModal} 
    />
  );
};

export const Router = () => {
  // שימוש ב-BASE_URL של Vite כדי שיתאים אוטומטית גם לוקאלית (/) וגם לגיט (/momentumatrix)
  const basename = import.meta.env.DEV ? "" : "/momentumatrix";

  return (
    <div>
      <BrowserRouter basename={basename}>
        <ScrollToTop />
        <NavBar theArr={arrForNav} />

        <Routes>
          {/* Public routes accessible to everyone */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/login" element={<Login />} />
          
          {/* Public or Token login route */}
          <Route path="/token-login" element={<TokenLogin />} />

          {/* Protected routes requiring authentication */}
          <Route 
            path="/generate-token" 
            element={
              <ProtectedRoute>
                <GenerateToken />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/backtesting" 
            element={
              <ProtectedRoute>
                <Backtesting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/performance" 
            element={
              <ProtectedRoute>
                <Performance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/change-password" 
            element={
              <ProtectedRoute>
                <Login />
              </ProtectedRoute>
            } 
          />
        </Routes>

        <Footer />
      </BrowserRouter>
    </div>
  );
};