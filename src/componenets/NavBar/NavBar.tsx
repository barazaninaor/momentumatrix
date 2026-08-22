import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./NavBar.css";
import type { NavItem } from "../../types/NavBarInfo";
import { Button } from "../Button/Button";
import { Modal } from "../Modal/Modal";
import logoImg from "../../assets/logo.jpg";

type NavBarProps = {
  theArr: NavItem[];
};

export const NavBar: React.FC<NavBarProps> = ({ theArr }) => {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("access_token"));
  const loginType = localStorage.getItem("login_type");
  const isRegularUser = isLoggedIn && loginType === "user";
  const showTimer = isLoggedIn && !isRegularUser;

  const [isTokenExpiredModalOpen, setIsTokenExpiredModalOpen] = useState(false);

  // Initial state setup from localStorage if a saved expiration time exists
  const [timeLeft, setTimeLeft] = useState<string>(() => {
    const savedExpiration = localStorage.getItem("token_expiration");
    if (savedExpiration) {
      const diff = Number(savedExpiration) - Date.now();
      if (diff > 0) {
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
      }
    }
    return "00:00";
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("login_type");
    localStorage.removeItem("user_email");
    localStorage.removeItem("token_expiration");
    localStorage.removeItem("token_issued_at");
    setIsTokenExpiredModalOpen(false);
    navigate("/"); // Redirects to the home page upon token expiration or logout
  };

  useEffect(() => {
    if (isRegularUser || !isLoggedIn) return;

    let isMounted = true;
    let interval: number;

    const startInterval = (expirationTime: number) => {
      if (interval) clearInterval(interval);

      interval = window.setInterval(() => {
        const now = Date.now();
        const difference = expirationTime - now;

        if (difference <= 0) {
          if (isMounted) {
            setTimeLeft("00:00");
            setIsTokenExpiredModalOpen(true);
          }
          clearInterval(interval);
          return;
        }

        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const formatted = [
          minutes.toString().padStart(2, "0"),
          seconds.toString().padStart(2, "0"),
        ].join(":");

        if (isMounted) {
          setTimeLeft(formatted);
        }
      }, 1000);
    };

    // Immediate start from local storage to prevent delay
    const savedExpiration = Number(localStorage.getItem("token_expiration"));
    if (savedExpiration && savedExpiration > Date.now()) {
      startInterval(savedExpiration);
    }

    // Call Python server to get the exact expiration time
    const fetchTokenStatusFromDB = async () => {
      try {
        const userEmail = localStorage.getItem("user_email");
        if (!userEmail) return;

        const response = await fetch(`http://localhost:8000/auth/token-status/${encodeURIComponent(userEmail)}`);
        
        if (response.ok && isMounted) {
          const data = await response.json();
          console.log("Python Server Expiration Response:", data);

          if (data.expired) {
            setTimeLeft("00:00");
            setIsTokenExpiredModalOpen(true);
            return;
          }

          if (data.expires_at) {
            const dynamicExpiration = Number(data.expires_at);
            localStorage.setItem("token_expiration", dynamicExpiration.toString());
            startInterval(dynamicExpiration);
          }
        }
      } catch (error) {
        console.error("Failed to fetch token status from database:", error);
      }
    };

    fetchTokenStatusFromDB();

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [isRegularUser, isLoggedIn]);

  return (
    <>
      <nav className="NavBar">
        <div className="navbar-left">
          <NavLink to="/" className="navbar-logo-wrapper">
            <img src={logoImg} alt="MomentuMatrix Logo" className="navbar-logo-icon" />
          </NavLink>
          <NavLink to="/" className="navbar-brand">
            MomentuMatrix
          </NavLink>
          <NavLink to="/" className="navbar-logo-wrapper">
            <img src={logoImg} alt="MomentuMatrix Logo" className="navbar-logo-icon" />
          </NavLink>
        </div>

        <div className="navbar-links">
          {theArr.map((curr) => {
            const isHome = curr.hrefStr === "/";
            return (
              <div className="navItem" key={curr.hrefStr}>
                <NavLink to={curr.hrefStr} end={isHome}>
                  {curr.displayStr}
                </NavLink>
              </div>
            );
          })}
        </div>

        <div className="navbar-right">
          <div className="navbar-right">
          {isLoggedIn ? (
            <div className="logged-in-container">
              <span className="logged-in-text">
                Logged In
              </span>

              {showTimer && (
                <div className="token-expiry-timer">
                  expired in: {timeLeft}
                </div>
              )}

              {isRegularUser && (
                <div className="navbar-action-wrapper" onClick={() => navigate("/generate-token")}>
                  <Button text="Generate Token" variant="solid" />
                </div>
              )}

              {isRegularUser && (
                <div className="navbar-action-wrapper" onClick={() => navigate("/change-password")}>
                  <Button text="Edit" variant="solid" />
                </div>
              )}

              <div className="navbar-action-wrapper logout-btn-wrapper" onClick={handleLogout}>
                <Button text="Log Out" variant="solid" />
              </div>
            </div>
          ) : (
            <div className="logged-out-container">
              <NavLink to="/token-login" className="navbar-login-link">
                <Button text="Token Access" variant="solid" />
              </NavLink>
              <NavLink to="/login" className="navbar-login-link">
                <Button text="Log in" variant="solid" />
              </NavLink>
            </div>
          )}
        </div>
        </div>
      </nav>

      <Modal 
        isOpen={isTokenExpiredModalOpen}
        onClose={handleLogout}
        title="Session Expired"
        message={
          <>
            Your token has expired. <br />For further information please contact Naor:
          </>
        }
        showEmail={true}
      />
    </>
  );
};