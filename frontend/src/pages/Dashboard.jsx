import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Edit3,
  FileText,
  Heart,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import DevantaSidebar from "../components/DevantaSidebar";
import { API_URL } from "../App";

import "../styles/Dashboard.css";


/* =====================================================
   HELPERS
===================================================== */

function getInitial(value = "") {
  const text = String(value || "").trim();

  return text
    ? text.charAt(0).toUpperCase()
    : "D";
}


function normalizePost(post = {}) {
  const author =
    post.author ||
    post.user ||
    {};

  const content =
    post.excerpt ||
    post.description ||
    post.content ||
    "";

  return {
    ...post,

    id: post.id,

    slug: String(
      post.slug ||
      post.id ||
      ""
    ),

    title:
      post.title ||
      "Untitled article",

    excerpt: String(content),

    authorName:
      author.full_name ||
      author.fullName ||
      author.name ||
      author.username ||
      post.author_name ||
      post.authorName ||
      post.username ||
      "Devanta User",

    avatar:
      author.avatar_url ||
      author.avatarUrl ||
      post.avatar_url ||
      post.avatarUrl ||
      null,

    coverImage:
      post.cover_image ||
      post.coverImage ||
      post.image_url ||
      post.imageUrl ||
      null,

    status:
      post.status ||
      "draft",

    likes:
      Number(
        post.likes_count ??
        post.like_count ??
        post.likes ??
        0
      ),

    comments:
      Number(
        post.comments_count ??
        post.comment_count ??
        post.comments ??
        0
      ),

    createdAt:
      post.created_at ||
      post.createdAt ||
      post.published_at ||
      null,

    updatedAt:
      post.updated_at ||
      post.updatedAt ||
      null,
  };
}


function getPostsFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.posts)) {
    return data.posts;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}


function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


/* =====================================================
   DASHBOARD
===================================================== */

export default function Dashboard() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] =
    useState(null);


  /* ===================================================
     LOAD MY POSTS
  =================================================== */

  async function loadPosts() {
    const token =
      localStorage.getItem(
        "devanta_token"
      );

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/posts/mine`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );


      if (response.status === 401) {
        localStorage.removeItem(
          "devanta_token"
        );

        localStorage.removeItem(
          "devanta_username"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }


      if (!response.ok) {
        throw new Error(
          `Failed to load your posts (${response.status})`
        );
      }


      const data =
        await response.json();

      const normalized =
        getPostsFromResponse(data)
          .map(normalizePost)
          .filter((post) => post.slug);

      setPosts(normalized);
    } catch (err) {
      console.error(
        "Unable to load my posts:",
        err
      );

      setError(
        err?.message ||
          "Unable to load your posts."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadPosts();
  }, []);


  /* ===================================================
     DELETE
  =================================================== */

  async function deletePost(postId) {
    if (!postId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this article?"
      );

    if (!confirmed) {
      return;
    }

    const token =
      localStorage.getItem(
        "devanta_token"
      );

    if (!token) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    try {
      setDeletingId(postId);

      const response = await fetch(
        `${API_URL}/posts/${postId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (response.status === 401) {
        localStorage.removeItem(
          "devanta_token"
        );

        localStorage.removeItem(
          "devanta_username"
        );

        navigate("/login", {
          replace: true,
        });

        return;
      }


      if (!response.ok) {
        throw new Error(
          "Unable to delete article."
        );
      }


      setPosts((current) =>
        current.filter(
          (post) =>
            String(post.id) !==
            String(postId)
        )
      );
    } catch (err) {
      console.error(
        "Unable to delete post:",
        err
      );

      window.alert(
        err?.message ||
          "Unable to delete article."
      );
    } finally {
      setDeletingId(null);
    }
  }


  const publishedCount =
    posts.filter(
      (post) =>
        String(post.status).toLowerCase() ===
        "published"
    ).length;


  const draftCount =
    posts.filter(
      (post) =>
        String(post.status).toLowerCase() !==
        "published"
    ).length;


  return (
    <div className="dashboard-layout">

      <DevantaSidebar />

      <main className="dashboard-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="dashboard-header">

          <div className="dashboard-heading">

            <span className="dashboard-eyebrow">
              YOUR SPACE
            </span>

            <h1>
              My Posts
            </h1>

            <p>
              Create, manage and publish your
              developer stories.
            </p>

          </div>


          <Link
            to="/write"
            className="dashboard-create-button"
          >
            <Plus size={18} />
            Write article
          </Link>

        </header>


        {/* =================================================
            STATS
        ================================================= */}

        <section className="dashboard-stats">

          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon">
              <FileText size={20} />
            </div>

            <div>
              <span>
                Total articles
              </span>

              <strong>
                {posts.length}
              </strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon published">
              <ArrowRight size={20} />
            </div>

            <div>
              <span>
                Published
              </span>

              <strong>
                {publishedCount}
              </strong>
            </div>

          </div>


          <div className="dashboard-stat-card">

            <div className="dashboard-stat-icon drafts">
              <Edit3 size={20} />
            </div>

            <div>
              <span>
                Drafts
              </span>

              <strong>
                {draftCount}
              </strong>
            </div>

          </div>

        </section>


        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="dashboard-content">

          {!loading &&
            !error &&
            posts.length > 0 && (
              <div className="dashboard-list-header">

                <h2>
                  Your articles
                </h2>

                <span>
                  {posts.length}{" "}
                  {posts.length === 1
                    ? "article"
                    : "articles"}
                </span>

              </div>
            )}


          {/* LOADING */}

          {loading && (
            <div className="dashboard-state">

              <div className="dashboard-spinner" />

              <h3>
                Loading your posts...
              </h3>

              <p>
                Fetching your articles.
              </p>

            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="dashboard-state dashboard-error">

              <div className="dashboard-state-icon">
                !
              </div>

              <h3>
                Unable to load your posts
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={loadPosts}
              >
                Try again
              </button>

            </div>
          )}


          {/* EMPTY */}

          {!loading &&
            !error &&
            posts.length === 0 && (
              <div className="dashboard-state">

                <div className="dashboard-state-icon">
                  <FileText size={23} />
                </div>

                <h3>
                  You haven't written anything yet
                </h3>

                <p>
                  Start your first developer article
                  and share it with the Devanta community.
                </p>

                <Link
                  to="/write"
                  className="dashboard-empty-button"
                >
                  <Plus size={17} />
                  Write your first article
                </Link>

              </div>
            )}


          {/* =================================================
              POSTS
          ================================================= */}

          {!loading &&
            !error &&
            posts.length > 0 && (

              <div className="dashboard-post-list">

                {posts.map((post) => (

                  <article
                    className="dashboard-post-card"
                    key={post.id || post.slug}
                  >

                    {post.coverImage && (
                      <Link
                        to={`/post/${post.slug}`}
                        className="dashboard-cover"
                      >
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          loading="lazy"
                        />
                      </Link>
                    )}


                    <div className="dashboard-post-body">

                      <div className="dashboard-post-top">

                        <span
                          className={
                            String(post.status)
                              .toLowerCase() ===
                            "published"
                              ? "dashboard-status published"
                              : "dashboard-status draft"
                          }
                        >
                          {String(post.status)
                            .toLowerCase() ===
                          "published"
                            ? "Published"
                            : "Draft"}
                        </span>

                        <span className="dashboard-date">
                          <CalendarDays size={14} />
                          {formatDate(
                            post.createdAt
                          )}
                        </span>

                      </div>


                      <Link
                        to={
                          String(post.status)
                            .toLowerCase() ===
                          "published"
                            ? `/post/${post.slug}`
                            : `/editor/${post.id}`
                        }
                        className="dashboard-post-title"
                      >
                        {post.title}
                      </Link>


                      <p className="dashboard-post-excerpt">
                        {post.excerpt}
                      </p>


                      <div className="dashboard-post-meta">

                        <span>
                          <Heart size={16} />
                          {post.likes}
                        </span>

                        <span>
                          <MessageCircle size={16} />
                          {post.comments}
                        </span>

                      </div>


                      <div className="dashboard-post-actions">

                        <Link
                          to={`/editor/${post.id}`}
                          className="dashboard-edit-button"
                        >
                          <Edit3 size={16} />
                          Edit
                        </Link>


                        {String(post.status)
                          .toLowerCase() ===
                          "published" && (
                          <Link
                            to={`/post/${post.slug}`}
                            className="dashboard-read-button"
                          >
                            Read
                            <ArrowRight
                              size={16}
                            />
                          </Link>
                        )}


                        <button
                          type="button"
                          className="dashboard-delete-button"
                          onClick={() =>
                            deletePost(post.id)
                          }
                          disabled={
                            deletingId ===
                            post.id
                          }
                        >
                          <Trash2 size={16} />

                          {deletingId === post.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>

                      </div>

                    </div>

                  </article>

                ))}

              </div>

            )}

        </section>

      </main>

    </div>
  );
}
