import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Home,
  Compass,
  Tags as TagsIcon,
  Bookmark,
  Users,
  FileText,
  User,
  Settings,
  PenLine,
  LogOut,
  Sparkles,
} from "lucide-react";

import "./DevantaSidebar.css";

export default function DevantaSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const username =
    localStorage.getItem("devanta_username") || "Developer";

  const initial =
    username.charAt(0).toUpperCase();

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("devanta_token");
    localStorage.removeItem("devanta_username");

    navigate("/login");
  };

  return (
    <>
      <aside className="devanta-sidebar">

        {/* BRAND */}

        <div className="devanta-brand">
          <Link to="/" className="devanta-brand-link">

            <div className="devanta-brand-logo">
              D
            </div>

            <div className="devanta-brand-text">
              <strong>DEVANTA</strong>
              <span>Developer community</span>
            </div>

          </Link>
        </div>


        {/* WRITE */}

        <Link
          to="/write"
          className="devanta-write-button"
        >
          <PenLine size={20} />
          <span>Write an article</span>
        </Link>


        {/* DISCOVER */}

        <div className="devanta-section">

          <div className="devanta-section-title">
            DISCOVER
          </div>

          <nav className="devanta-nav">

            <Link
              to="/"
              className={
                `devanta-nav-item ${
                  isActive("/") ? "active" : ""
                }`
              }
            >
              <Home size={20} />
              <span>Home</span>
            </Link>


            <Link
              to="/explore"
              className={
                `devanta-nav-item ${
                  isActive("/explore") ? "active" : ""
                }`
              }
            >
              <Compass size={20} />
              <span>Explore</span>
            </Link>


            <Link
              to="/tags"
              className={
                `devanta-nav-item ${
                  isActive("/tags") ? "active" : ""
                }`
              }
            >
              <TagsIcon size={20} />
              <span>Tags</span>
            </Link>


            <Link
              to="/bookmarks"
              className={
                `devanta-nav-item ${
                  isActive("/bookmarks") ? "active" : ""
                }`
              }
            >
              <Bookmark size={20} />
              <span>Bookmarks</span>
            </Link>


            <Link
              to="/people"
              className={
                `devanta-nav-item ${
                  isActive("/people") ? "active" : ""
                }`
              }
            >
              <Users size={20} />
              <span>People</span>
            </Link>

          </nav>
        </div>


        {/* YOUR SPACE */}

        <div className="devanta-section">

          <div className="devanta-section-title">
            YOUR SPACE
          </div>

          <nav className="devanta-nav">

            <Link
              to="/dashboard"
              className={
                `devanta-nav-item ${
                  isActive("/dashboard") ||
                  isActive("/myposts")
                    ? "active"
                    : ""
                }`
              }
            >
              <FileText size={20} />
              <span>My Posts</span>
            </Link>


            <Link
              to="/profile"
              className={
                `devanta-nav-item ${
                  isActive("/profile") ? "active" : ""
                }`
              }
            >
              <User size={20} />
              <span>Profile</span>
            </Link>


            <Link
              to="/settings"
              className={
                `devanta-nav-item ${
                  isActive("/settings") ? "active" : ""
                }`
              }
            >
              <Settings size={20} />
              <span>Settings</span>
            </Link>

          </nav>
        </div>


        {/* GROWTH CARD */}

        <div className="devanta-growth">

          <div className="devanta-growth-icon">
            <Sparkles size={18} />
          </div>

          <strong>
            Build your presence
          </strong>

          <p>
            Share your knowledge with developers.
          </p>

          <Link to="/write">
            Start writing →
          </Link>

        </div>


        {/* USER */}

        <div className="devanta-sidebar-bottom">

          <Link
            to="/profile"
            className="devanta-user"
          >

            <div className="devanta-user-avatar">
              {initial}
            </div>

            <div className="devanta-user-info">
              <strong>{username}</strong>
              <span>Devanta member</span>
            </div>

          </Link>


          <button
            type="button"
            className="devanta-logout"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut size={19} />
          </button>

        </div>

      </aside>
    </>
  );
}
