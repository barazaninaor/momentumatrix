import { useState, type FormEvent } from "react";
import "./GenerateToken.css";
import { Button } from "../../componenets/Button/Button";
import { MainTitle } from "../../componenets/MainTitle/MainTitle";

export const GenerateToken = () => {
  const [email, setEmail] = useState<string>("");
  const [durationMinutes, setDurationMinutes] = useState<number>(10);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setGeneratedToken(null);
    setCopied(false);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/auth/generate-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email, 
          duration_minutes: Number(durationMinutes)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to generate token");
      }

      setGeneratedToken(data.token);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="login-page">
      <MainTitle MainTitle="Generate Magic Token" />

      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}

        {/* שדה אימייל */}
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">Validity Duration (Minutes)</label>
          <input
            type="number"
            id="duration"
            min={1}
            max={1440}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            required
          />
        </div>

        {/* כפתור שליחת הטופס הראשי */}
        <Button 
          text={loading ? "Generating..." : "Get Token"} 
          variant="solid" 
        />

        {generatedToken && (
          <div className="token-result-container">
            <p className="token-label">Your 5-Digit Token:</p>
            <h2 className="token-value">{generatedToken}</h2>
            
            <div className="copy-btn-wrapper">
              <button 
                type="button"
                onClick={handleCopy}
                className="copy-token-btn"
              >
                {copied ? "Copied!" : "Copy Token"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};