import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PenLine,
  User,
  UserRound,
} from "lucide-react";

import { API_URL } from "../config";

import "../styles/Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    bio: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  function updateField(event) {
    const { name, value } =
      event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.username.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.full_name.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }

    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            username:
              form.username.trim(),

            email:
              form.email.trim(),

            password:
              form.password,

            full_name:
              form.full_name.trim(),

            bio:
              form.bio.trim() || null,
          }),
        }
      );

      const data =
        await response.json().catch(
          () => null
        );

      if (!response.ok) {
        let message =
          "Unable to create your account.";

        if (
          typeof data?.detail ===
          "string"
        ) {
          message = data.detail;
        } else if (
          Array.isArray(data?.detail)
        ) {
          message = data.detail
            .map(
              (item) =>
                item?.msg ||
                "Invalid input"
            )
            .join(", ");
        }

        throw new Error(message);
      }

      setSuccess(
        "Account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login");
      }, 900);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <div className="register-background-shape register-shape-one" />
      <div className="register-background-shape register-shape-two" />

      <main className="register-container">
        <section className="register-brand-panel">
          <Link
            to="/"
            className="register-brand"
          >
            <span className="register-logo">
              D
            </span>

            <span>
              <strong>DEVANTA</strong>
              <small>
                Developer community
              </small>
            </span>
          </Link>

          <div className="register-brand-content">
            <span className="register-brand-eyebrow">
              BUILD. WRITE. SHARE.
            </span>

            <h2>
              Your ideas deserve
              <span> an audience.</span>
            </h2>

            <p>
              Join developers who write,
              learn and share knowledge on
              Devanta.
            </p>

            <div className="register-feature-list">
              <div>
                <span>
                  <PenLine size={17} />
                </span>

                <div>
                  <strong>
                    Publish your ideas
                  </strong>

                  <p>
                    Share tutorials,
                    projects and technical
                    stories.
                  </p>
                </div>
              </div>

              <div>
                <span>
                  <UserRound size={17} />
                </span>

                <div>
                  <strong>
                    Connect with developers
                  </strong>

                  <p>
                    Discover people and
                    learn from the community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="register-form-panel">
          <div className="register-card">
            <div className="register-mobile-brand">
              <span>D</span>
              <strong>DEVANTA</strong>
            </div>

            <div className="register-heading">
              <span className="register-eyebrow">
                JOIN DEVANTA
              </span>

              <h1>
                Create your account
              </h1>

              <p>
                Build. Write. Share.
              </p>
            </div>

            {error && (
              <div className="register-alert register-alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="register-alert register-alert-success">
                {success}
              </div>
            )}

            <form
              className="register-form"
              onSubmit={handleSubmit}
            >
              <div className="register-field">
                <label htmlFor="username">
                  Username
                </label>

                <div className="register-input-wrapper">
                  <User size={18} />

                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={updateField}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="email">
                  Email
                </label>

                <div className="register-input-wrapper">
                  <Mail size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={updateField}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="register-input-wrapper">
                  <Lock size={18} />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={updateField}
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) =>
                          !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="full_name">
                  Full name
                </label>

                <div className="register-input-wrapper">
                  <UserRound size={18} />

                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    placeholder="Your full name"
                    value={form.full_name}
                    onChange={updateField}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="register-field">
                <label htmlFor="bio">
                  About you
                  <span>Optional</span>
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={updateField}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>
            </form>

            <div className="register-login">
              <span>
                Already have an account?
              </span>

              <Link to="/login">
                Login
              </Link>
            </div>

            <Link
              to="/"
              className="register-back-home"
            >
              ← Back to Devanta
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
