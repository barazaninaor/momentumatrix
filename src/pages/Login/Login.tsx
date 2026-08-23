import { useState, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import { MainTitle } from "../../componenets/MainTitle/MainTitle";
import { Button } from "../../componenets/Button/Button";

// Base URL for API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if the current route is for changing the password
  const isEditingPassword = location.pathname === "/change-password";

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle form submission for login or password change
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validate new passwords match when changing password
    if (isEditingPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      if (isEditingPassword) {
        // Send password change request (PUT) to the server
        const response = await fetch(`${API_URL}/auth/change-password`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            old_password: password,
            new_password: newPassword,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to change password");
        }

        // Clear tokens and login type on successful password update
        localStorage.removeItem("access_token");
        localStorage.removeItem("token_type");
        localStorage.removeItem("login_type");
        localStorage.removeItem("user_email");
        localStorage.removeItem("token_expiration");

        setSuccessMessage("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        // Send standard login request (POST)
        const response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Login failed");
        }

        // Save access token, type, login_type, and user email in localStorage upon successful authentication
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token_type", data.token_type);
        localStorage.setItem("login_type", "user");
        localStorage.setItem("user_email", email);

        navigate("/"); 
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <MainTitle 
        MainTitle={
          isEditingPassword 
            ? "Change Password" 
            : "Login"
        } 
      />

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Email field */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="on"
            required
          />
        </div>

        {/* Password field - displayed only in standard login */}
        {!isEditingPassword && (
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}

        {/* Password change fields - displayed only in change password mode */}
        {isEditingPassword && (
          <>
            <div className="form-group">
              <label htmlFor="password">Current Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter current password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {/* Primary submit button */}
        <Button 
          text={
            loading 
              ? "Processing..." 
              : isEditingPassword 
                ? "Update Password" 
                : "Sign In"
          } 
          variant="solid" 
        />

        {/* Cancel and return button for password change */}
        {isEditingPassword && (
          <div className="login-link-container">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="secondary-toggle-btn"
            >
              Cancel / Back to Home
            </button>
          </div>
        )}

        {/* Link to token login page implemented as a button */}
        {!isEditingPassword && (
          <div className="login-link-container">
            <Button
              text="Sign in with Token"
              variant="solid"
              onClick={() => navigate("/token-login")}
            />
          </div>
        )}
      </form>
    </div>
  );
};