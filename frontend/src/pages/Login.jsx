import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Code2, Sparkles } from "lucide-react";
import { loginUser } from "../services/api";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(username, password);

      localStorage.setItem("devanta_token", data.access_token);
      localStorage.setItem("devanta_username", username);

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* Background decoration */}
      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>

      {/* Top brand */}
      <header className="login-header">
        <Link to="/" className="login-brand">
          <span className="brand-icon">
            <Code2 size={22} strokeWidth={2.5} />
          </span>

          <span className="brand-name">DEVANTA</span>
        </Link>

        <div className="header-text">
          Developer community
        </div>
      </header>

      {/* Main */}
      <main className="login-main">

        <div className="login-container">

          {/* Left branding panel */}
          <section className="login-showcase">

            <div className="showcase-badge">
              <Sparkles size={16} />
              Developer publishing platform
            </div>

            <h1>
              Build.
              <br />
              Write.
              <br />
              <span>Share.</span>
            </h1>

            <p className="showcase-description">
              A modern space for developers to share knowledge,
              publish technical articles, and connect with the
              developer community.
            </p>

            <div className="showcase-features">
              <div className="feature-item">
                <div className="feature-number">01</div>
                <div>
                  <strong>Write & Publish</strong>
                  <span>Turn your ideas into technical stories.</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-number">02</div>
                <div>
                  <strong>Build Your Profile</strong>
                  <span>Showcase your developer identity.</span>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-number">03</div>
                <div>
                  <strong>Connect & Learn</strong>
                  <span>Discover developers and new ideas.</span>
                </div>
              </div>
            </div>

          </section>

          {/* Login card */}
          <section className="login-card">

            <div className="login-card-header">
              <div className="mobile-logo">
                <span className="brand-icon">
                  <Code2 size={20} strokeWidth={2.5} />
                </span>
              </div>

              <h2>Welcome back</h2>

              <p>
                Sign in to continue writing and sharing.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="login-error">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">

              {/* Username */}
              <div className="form-group">
                <label htmlFor="username">
                  Username
                </label>

                <div className="input-wrapper">
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group">
                <div className="password-label-row">
                  <label htmlFor="password">
                    Password
                  </label>
                </div>

                <div className="input-wrapper password-wrapper">

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>
              </div>

              {/* Login */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={19} />
                  </>
                )}
              </button>

            </form>

            <div className="login-divider">
              <span></span>
              <p>New to Devanta?</p>
              <span></span>
            </div>

            <Link
              to="/register"
              className="create-account-button"
            >
              Create your account
            </Link>

            <p className="login-terms">
              By continuing, you agree to build, write and
              share responsibly with the Devanta community.
            </p>

          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="login-footer">
        <span>DEVANTA</span>
        <span>•</span>
        <span>Build. Write. Share.</span>
      </footer>

    </div>
  );
}

export default Login;
