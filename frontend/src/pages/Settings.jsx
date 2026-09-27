import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Save,
  Settings as SettingsIcon,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import DevantaSidebar from "../components/DevantaSidebar";
import { API_URL } from "../config";

import "../styles/Settings.css";

export default function Settings() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    avatar_url: "",
    github_url: "",
    twitter_url: "",
    website_url: "",
  });

  const [username, setUsername] = useState("Developer");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("devanta_token");

  /* =====================================================
     LOAD CURRENT PROFILE
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/users/me`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("devanta_token");
          localStorage.removeItem("devanta_username");

          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Unable to load profile."
          );
        }

        if (cancelled) {
          return;
        }

        setUsername(data.username || "Developer");

        setForm({
          name: data.name || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          github_url: data.github_url || "",
          twitter_url: data.twitter_url || "",
          website_url: data.website_url || "",
        });
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Profile loading error:", err);

        setError(
          err?.message ||
            "Unable to load your profile."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate, token]);

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccess("");
    setError("");
  };

  /* =====================================================
     SAVE PROFILE
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          bio: form.bio.trim(),
          avatar_url: form.avatar_url.trim(),
          github_url: form.github_url.trim(),
          twitter_url: form.twitter_url.trim(),
          website_url: form.website_url.trim(),
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem("devanta_token");
        localStorage.removeItem("devanta_username");

        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string"
            ? data.detail
            : "Unable to update profile."
        );
      }

      /* Keep username in local storage */
      if (data.username) {
        localStorage.setItem(
          "devanta_username",
          data.username
        );

        setUsername(data.username);
      }

      /* Update form with saved backend values */
      setForm({
        name: data.name || "",
        bio: data.bio || "",
        avatar_url: data.avatar_url || "",
        github_url: data.github_url || "",
        twitter_url: data.twitter_url || "",
        website_url: data.website_url || "",
      });

      setSuccess(
        "Your profile has been updated successfully."
      );

      /* Scroll to top so success message is visible */
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err?.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const initial =
    (
      form.name ||
      username ||
      "Developer"
    )
      .charAt(0)
      .toUpperCase();

  return (
    <div className="settings-layout">

      <DevantaSidebar />

      <main className="settings-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="settings-header">

          <div>
            <span className="settings-eyebrow">
              ACCOUNT
            </span>

            <h1>Profile Settings</h1>

            <p>
              Update your Devanta developer profile.
            </p>
          </div>

          <Link
            to="/profile"
            className="settings-profile-button"
          >
            <span>{initial}</span>

            <strong>
              {username}
            </strong>
          </Link>

        </header>

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="settings-content">

          {/* SUCCESS */}
          {success && (
            <div className="settings-alert settings-success">
              <CheckCircle size={20} />

              <span>
                {success}
              </span>
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="settings-alert settings-error">
              <span>
                {error}
              </span>
            </div>
          )}

          {/* =================================================
              PROFILE EDIT CARD
          ================================================= */}

          <form
            className="settings-card settings-profile-form"
            onSubmit={handleSubmit}
          >

            <div className="settings-card-heading">

              <div className="settings-card-icon">
                <UserRound size={24} />
              </div>

              <div>
                <h2>
                  Edit profile
                </h2>

                <p>
                  Keep your developer profile
                  information up to date.
                </p>
              </div>

            </div>

            {loading ? (
              <div className="settings-loading">
                <div className="settings-loader" />

                <p>
                  Loading your profile...
                </p>
              </div>
            ) : (
              <>

                {/* =================================================
                    NAME
                ================================================= */}

                <div className="settings-field">

                  <label htmlFor="name">
                    Display name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    maxLength={100}
                  />

                  <span>
                    This is the name displayed on your profile.
                  </span>

                </div>


                {/* =================================================
                    USERNAME
                ================================================= */}

                <div className="settings-field">

                  <label htmlFor="username">
                    Username
                  </label>

                  <input
                    id="username"
                    type="text"
                    value={username}
                    disabled
                  />

                  <span>
                    Username cannot be changed from profile settings.
                  </span>

                </div>


                {/* =================================================
                    BIO
                ================================================= */}

                <div className="settings-field">

                  <label htmlFor="bio">
                    Bio
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Tell the Devanta community about yourself..."
                    rows={5}
                    maxLength={500}
                  />

                  <span>
                    {form.bio.length}/500 characters
                  </span>

                </div>


                {/* =================================================
                    AVATAR
                ================================================= */}

                <div className="settings-field">

                  <label htmlFor="avatar_url">
                    Profile image URL
                  </label>

                  <input
                    id="avatar_url"
                    name="avatar_url"
                    type="url"
                    value={form.avatar_url}
                    onChange={handleChange}
                    placeholder="https://example.com/profile.jpg"
                  />

                  <span>
                    Optional. Use a publicly accessible image URL.
                  </span>

                </div>


                {/* =================================================
                    SOCIAL LINKS
                ================================================= */}

                <div className="settings-section-title">

                  <h3>
                    Social links
                  </h3>

                  <p>
                    Add links so other developers
                    can find you online.
                  </p>

                </div>


                <div className="settings-field">

                  <label htmlFor="github_url">
                    GitHub
                  </label>

                  <input
                    id="github_url"
                    name="github_url"
                    type="url"
                    value={form.github_url}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                  />

                </div>


                <div className="settings-field">

                  <label htmlFor="twitter_url">
                    X / Twitter
                  </label>

                  <input
                    id="twitter_url"
                    name="twitter_url"
                    type="url"
                    value={form.twitter_url}
                    onChange={handleChange}
                    placeholder="https://x.com/username"
                  />

                </div>


                <div className="settings-field">

                  <label htmlFor="website_url">
                    Personal website
                  </label>

                  <input
                    id="website_url"
                    name="website_url"
                    type="url"
                    value={form.website_url}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="settings-form-actions">

                  <Link
                    to="/profile"
                    className="settings-cancel-button"
                  >
                    <ArrowLeft size={17} />

                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="settings-save-button"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="settings-button-loader" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Save changes
                      </>
                    )}
                  </button>

                </div>

              </>
            )}

          </form>


          {/* =================================================
              ACCOUNT INFORMATION
          ================================================= */}

          <div className="settings-card settings-account-card">

            <div className="settings-card-icon">
              <SettingsIcon size={24} />
            </div>

            <div className="settings-card-content">

              <h2>
                Account information
              </h2>

              <p>
                Your username is used to identify
                your Devanta account.
              </p>

              <div className="settings-user-row">

                <div className="settings-avatar">
                  {initial}
                </div>

                <div>
                  <strong>
                    {form.name || username}
                  </strong>

                  <span>
                    @{username}
                  </span>
                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              BACK
          ================================================= */}

          <Link
            to="/profile"
            className="settings-back"
          >
            <ArrowLeft size={18} />

            Back to Profile
          </Link>

        </section>

      </main>

    </div>
  );
}
