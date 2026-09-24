import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../Login/Login.css";
import "./TokenLogin.css";
import { MainTitle } from "../../componenets/MainTitle/MainTitle";
import { Button } from "../../componenets/Button/Button";

// Import central API client
import { api } from "../../services/api";

export const TokenLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [token, setToken] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Handle form submission for token-based authentication
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      // Send token login request (POST) to the server using the central api client
      const response = await api.post('/auth/token-login', { email, token });
      const data = response.data;

      // Save access token, type, user email, and expiration time in localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);
      localStorage.setItem("user_email", email);
      
      // חישוב זמן תפוגה בסיסי (ברירת מחדל 10 דקות מעכשיו או לפי מה שהשרת מחזיר)
      const expirationTime = data.expires_at 
        ? new Date(data.expires_at).getTime() 
        : Date.now() + 10 * 60 * 1000;
        
      localStorage.setItem("token_expiration", expirationTime.toString());
      localStorage.setItem("login_type", "token_login");

      setSuccessMessage("Successfully logged in!");
      
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.message || "An unexpected error occurred";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <MainTitle MainTitle="Sign in with Token" />

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error-message token-error-msg">{error}</div>}
        {successMessage && <div className="success-message token-success-msg">{successMessage}</div>}

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

        {/* Token field */}
        <div className="form-group">
          <label htmlFor="token">Token</label>
          <input
            type="text"
            id="token"
            placeholder="Enter token"
            maxLength={5}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
          />
        </div>

        {/* Submit button */}
        <Button 
          text={loading ? "Processing..." : "Sign In with Token"} 
          variant="solid" 
        />

        {/* Navigation button back to standard login */}
        <div className="token-back-container">
          <Button
            text="Standard Login"
            variant="solid"
            onClick={() => navigate("/login")}
          />
        </div>
      </form>
    </div>
  );
};