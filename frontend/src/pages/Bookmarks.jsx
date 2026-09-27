import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Heart,
  MessageCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import DevantaSidebar from "../components/DevantaSidebar";
import { API_URL } from "../App";

import "../styles/Bookmarks.css";


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

  const authorName =
    author.full_name ||
    author.fullName ||
    author.name ||
    author.username ||
    post.author_name ||
    post.authorName ||
    post.username ||
    "Devanta User";

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

    authorName,

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
  };
}


function getBookmarksFromResponse(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.bookmarks)) {
    return data.bookmarks;
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


function getBookmarkedPost(item) {
  return (
    item?.post ||
    item?.article ||
    item
  );
}


/* =====================================================
   BOOKMARKS
===================================================== */

export default function Bookmarks() {
  const navigate = useNavigate();

  const [bookmarks, setBookmarks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [removingId, setRemovingId] =
    useState(null);


  /* ===================================================
     LOAD
  =================================================== */

  async function loadBookmarks() {
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
        `${API_URL}/social/posts/bookmarks/mine`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );


      /* =================================================
         TOKEN EXPIRED
      ================================================= */

      if (response.status === 401) {
        localStorage.removeItem(
          "devanta_token"
        );

        localStorage.removeItem(
          "devanta_username"
        );

        navigate("/login", {
          replace: true,
          state: {
            message:
              "Your session expired. Please login again.",
          },
        });

        return;
      }


      if (!response.ok) {
        throw new Error(
          `Failed to load bookmarks (${response.status})`
        );
      }

      const data =
        await response.json();

      const items =
        getBookmarksFromResponse(data)
          .map(getBookmarkedPost)
          .filter(Boolean)
          .map(normalizePost)
          .filter((post) => post.slug);

      setBookmarks(items);
    } catch (err) {
      console.error(
        "Unable to load bookmarks:",
        err
      );

      setError(
        err?.message ||
          "Unable to load bookmarks."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadBookmarks();
  }, []);


  /* ===================================================
     REMOVE BOOKMARK
  =================================================== */

  async function removeBookmark(postId) {
    const token =
      localStorage.getItem(
        "devanta_token"
      );

    if (!token || !postId) {
      return;
    }

    try {
      setRemovingId(postId);

      const response = await fetch(
        `${API_URL}/social/posts/${postId}/bookmark`,
        {
          method: "DELETE",

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
          "Unable to remove bookmark."
        );
      }

      setBookmarks((current) =>
        current.filter(
          (post) =>
            String(post.id) !==
            String(postId)
        )
      );
    } catch (err) {
      console.error(
        "Unable to remove bookmark:",
        err
      );

      setError(
        err?.message ||
          "Unable to remove bookmark."
      );
    } finally {
      setRemovingId(null);
    }
  }


  return (
    <div className="bookmarks-layout">

      <DevantaSidebar />

      <main className="bookmarks-main">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="bookmarks-header">

          <div>
            <span className="bookmarks-eyebrow">
              YOUR LIBRARY
            </span>

            <h1>
              Bookmarks
            </h1>

            <p>
              Articles you saved to read later.
            </p>
          </div>

          <div className="bookmarks-header-actions">

            <button
              type="button"
              className="bookmarks-refresh"
              onClick={loadBookmarks}
              disabled={loading}
              title="Refresh bookmarks"
            >
              <RefreshCw
                size={18}
                className={
                  loading
                    ? "bookmark-refresh-spin"
                    : ""
                }
              />
            </button>

            <Link
              to="/explore"
              className="bookmarks-explore"
            >
              Explore
              <ArrowRight size={16} />
            </Link>

          </div>

        </header>


        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="bookmarks-content">

          {!loading &&
            !error &&
            bookmarks.length > 0 && (
              <div className="bookmarks-count">
                {bookmarks.length}{" "}
                {bookmarks.length === 1
                  ? "article"
                  : "articles"}
              </div>
            )}


          {/* LOADING */}

          {loading && (
            <div className="bookmarks-state">

              <div className="bookmarks-spinner" />

              <h3>
                Loading bookmarks...
              </h3>

              <p>
                Fetching your saved articles.
              </p>

            </div>
          )}


          {/* ERROR */}

          {!loading && error && (
            <div className="bookmarks-state bookmarks-error">

              <div className="bookmarks-state-icon">
                !
              </div>

              <h3>
                Unable to load bookmarks
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={loadBookmarks}
              >
                Try again
              </button>

            </div>
          )}


          {/* EMPTY */}

          {!loading &&
            !error &&
            bookmarks.length === 0 && (
              <div className="bookmarks-state">

                <div className="bookmarks-state-icon">
                  <Bookmark size={23} />
                </div>

                <h3>
                  No bookmarks yet
                </h3>

                <p>
                  Save interesting articles and
                  they will appear here.
                </p>

                <Link
                  to="/explore"
                  className="bookmarks-empty-button"
                >
                  Explore articles
                  <ArrowRight size={17} />
                </Link>

              </div>
            )}


          {/* POSTS */}

          {!loading &&
            !error &&
            bookmarks.length > 0 && (

              <div className="bookmarks-grid">

                {bookmarks.map((post) => (

                  <article
                    className="bookmark-card"
                    key={post.id || post.slug}
                  >

                    {post.coverImage && (
                      <Link
                        to={`/post/${post.slug}`}
                        className="bookmark-cover"
                      >
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          loading="lazy"
                        />
                      </Link>
                    )}


                    <div className="bookmark-body">

                      <div className="bookmark-author">

                        {post.avatar ? (
                          <img
                            src={post.avatar}
                            alt={post.authorName}
                          />
                        ) : (
                          <span>
                            {getInitial(
                              post.authorName
                            )}
                          </span>
                        )}

                        <div>
                          <strong>
                            {post.authorName}
                          </strong>

                          <small>
                            <CalendarDays
                              size={13}
                            />
                            {formatDate(
                              post.createdAt
                            )}
                          </small>
                        </div>

                      </div>


                      <Link
                        to={`/post/${post.slug}`}
                        className="bookmark-title"
                      >
                        {post.title}
                      </Link>


                      <p className="bookmark-excerpt">
                        {post.excerpt}
                      </p>


                      <div className="bookmark-footer">

                        <div className="bookmark-stats">

                          <span>
                            <Heart size={17} />
                            {post.likes}
                          </span>

                          <span>
                            <MessageCircle size={17} />
                            {post.comments}
                          </span>

                        </div>


                        <div className="bookmark-actions">

                          <button
                            type="button"
                            className="bookmark-remove"
                            onClick={() =>
                              removeBookmark(
                                post.id
                              )
                            }
                            disabled={
                              removingId ===
                              post.id
                            }
                          >
                            <Trash2 size={16} />

                            {removingId === post.id
                              ? "Removing..."
                              : "Remove"}
                          </button>

                          <Link
                            to={`/post/${post.slug}`}
                            className="bookmark-read"
                          >
                            Read
                            <ArrowRight size={16} />
                          </Link>

                        </div>

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
