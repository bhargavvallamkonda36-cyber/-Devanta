import React from "react";
import { Link } from "react-router-dom";
import { PenLine } from "lucide-react";

import DevantaSidebar from "./components/DevantaSidebar";

import "./styles/DiscoverLayout.css";

export default function DiscoverLayout({
  title,
  subtitle,
  children,
  eyebrow = "DISCOVER",
}) {
  const username =
    localStorage.getItem("devanta_username") || "Developer";

  return (
    <div className="discover-layout">
      <DevantaSidebar />

      <main className="discover-main">
        <header className="discover-top-header">
          <div className="discover-header-spacer" />

          <div className="discover-header-actions">
            <Link
              to="/write"
              className="discover-header-write"
            >
              <PenLine size={17} />
              <span>Write</span>
            </Link>

            <Link
              to="/profile"
              className="discover-header-user"
            >
              <span className="discover-header-avatar">
                {username.charAt(0).toUpperCase()}
              </span>

              <strong>{username}</strong>
            </Link>
          </div>
        </header>

        <section className="discover-page">
          <div className="discover-hero">
            <div className="discover-hero-inner">
              <span className="discover-eyebrow">
                {eyebrow}
              </span>

              <h1>{title}</h1>

              {subtitle && (
                <p>{subtitle}</p>
              )}
            </div>
          </div>

          <div className="discover-content">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
