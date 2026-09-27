import React, { useEffect } from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Write from "./pages/Write";
import ArticleDetail from "./pages/ArticleDetail";
import Bookmarks from "./pages/Bookmarks";
import Explore from "./pages/Explore";
import Tags from "./pages/Tags";
import TagPage from "./pages/TagPage";
import People from "./pages/People";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import "./App.css";

/* =====================================================
   API
===================================================== */

export const API_URL = "http://127.0.0.1:8000";


/* =====================================================
   PROTECTED ROUTE
===================================================== */

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("devanta_token");

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


/* =====================================================
   PUBLIC ONLY ROUTE

   Prevents logged-in users from going back to
   Login/Register unnecessarily.
===================================================== */

function PublicOnlyRoute({ children }) {
  const token = localStorage.getItem("devanta_token");

  if (token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}


/* =====================================================
   SCROLL TO TOP
===================================================== */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
}


/* =====================================================
   APP
===================================================== */

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>

        {/* =================================================
            PUBLIC ROUTES
        ================================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/explore"
          element={<Explore />}
        />

        <Route
          path="/tags"
          element={<Tags />}
        />

        <Route
          path="/tag/:slug"
          element={<TagPage />}
        />

        <Route
          path="/people"
          element={<People />}
        />

        <Route
          path="/post/:slug"
          element={<ArticleDetail />}
        />

        <Route
          path="/profile/:id"
          element={<Profile />}
        />


        {/* =================================================
            AUTH ROUTES
        ================================================= */}

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />


        {/* =================================================
            DASHBOARD / MY POSTS
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/myposts"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            BOOKMARKS
        ================================================= */}

        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <Bookmarks />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            WRITE / EDITOR
        ================================================= */}

        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <Write />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/new"
          element={
            <ProtectedRoute>
              <Write />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor/:id"
          element={
            <ProtectedRoute>
              <Write />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PROFILE
        ================================================= */}

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/me"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            FALLBACK
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
