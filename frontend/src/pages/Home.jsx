import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Heart,
  MessageCircle,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

import DevantaSidebar from "../components/DevantaSidebar";
import { API_URL } from "../config";

import "../styles/Home.css";


/* =====================================================
   HELPERS
===================================================== */

function getInitial(value = "") {
  const text = String(value || "").trim();

  if (!text) {
    return "D";
  }

  return text.charAt(0).toUpperCase();
}


function normalizePost(post = {}) {
  const author =
    post.author ||
    post.user ||
    post.created_by ||
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

  const username =
    author.username ||
    post.username ||
    authorName;

  const avatar =
    author.avatar_url ||
    author.avatarUrl ||
    post.avatar_url ||
    post.avatarUrl ||
    null;

  const title =
    post.title ||
    "Untitled article";

  const slug =
    post.slug ||
    post.id ||
    "";

  const content =
    post.excerpt ||
    post.description ||
    post.content ||
    "";

  const tags =
    Array.isArray(post.tags)
      ? post.tags
      : [];

  return {
    ...post,

    id: post.id,
    slug: String(slug),

    title,

    content: String(content),

    excerpt: String(content),

    authorName,
    username,
    avatar,

    tags,

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
      post.publishedAt ||
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


function formatDate(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}


function truncateText(text, maxLength = 220) {
  const clean = String(text || "")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  return `${clean.slice(0, maxLength).trim()}...`;
}


/* =====================================================
   HOME
===================================================== */

export default function Home() {
  const [posts, setPosts] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* ===================================================
     LOAD POSTS
  =================================================== */

  async function loadPosts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/posts`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load posts (${response.status})`
        );
      }

      const data = await response.json();

      const normalized = getPostsFromResponse(data)
        .map(normalizePost)
        .filter((post) => post.slug);

      setPosts(normalized);
    } catch (err) {
      console.error("Unable to load home posts:", err);

      setError(
        err?.message ||
          "Unable to load articles."
      );

      setPosts([]);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadPosts();
  }, []);


  /* ===================================================
     SEARCH
  =================================================== */

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return posts;
    }

    return posts.filter((post) => {
      const searchable = [
        post.title,
        post.excerpt,
        post.authorName,
        post.username,
        ...(post.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [posts, search]);


  return (
    <div className="home-layout">

      <DevantaSidebar />

      <main className="home-main">

        {/* =================================================
            TOP HEADER
        ================================================= */}

        <header className="home-header">

          <div className="home-header-brand">
            <span>DEVANTA COMMUNITY</span>
          </div>

          <div className="home-header-actions">

            <Link
              to="/write"
              className="home-write-button"
            >
              Write
            </Link>

            <Link
              to="/profile"
              className="home-user"
            >
              <span className="home-user-avatar">
                {getInitial(
                  localStorage.getItem(
                    "devanta_username"
                  )
                )}
              </span>

              <strong>
                {localStorage.getItem(
                  "devanta_username"
                ) || "Developer"}
              </strong>
            </Link>

          </div>

        </header>


        {/* =================================================
            HERO
        ================================================= */}

        <section className="home-hero">

          <div className="home-hero-content">

            <span className="home-eyebrow">
              DEVELOPER COMMUNITY
            </span>

            <h1>
              Discover stories &amp; ideas.
            </h1>

            <p>
              Explore technical insights, tutorials,
              experiences, and ideas from the Devanta
              developer community.
            </p>

            <div className="home-hero-actions">

              <Link
                to="/explore"
                className="home-primary-button"
              >
                Explore articles
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/write"
                className="home-secondary-button"
              >
                Share your story
              </Link>

            </div>

          </div>

        </section>


        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="home-content">

          <div className="home-section-header">

            <div>
              <span className="home-section-eyebrow">
                LATEST
              </span>

              <h2>
                Fresh from the community
              </h2>
            </div>

            <Link
              to="/explore"
              className="home-see-all"
            >
              See all
              <ChevronRight size={17} />
            </Link>

          </div>


          {/* SEARCH */}

          <div className="home-search">

            <Search size={19} />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search articles..."
            />

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="home-state">
              <div className="home-spinner" />

              <h3>
                Loading articles...
              </h3>

              <p>
                Fetching the latest Devanta stories.
              </p>
            </div>
          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (
            <div className="home-state home-error">

              <div className="home-state-icon">
                !
              </div>

              <h3>
                Unable to load articles
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


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            filteredPosts.length === 0 && (
              <div className="home-state">

                <div className="home-state-icon">
                  <Search size={22} />
                </div>

                <h3>
                  No articles found
                </h3>

                <p>
                  Try a different search term.
                </p>

              </div>
            )}


          {/* =================================================
              POSTS
          ================================================= */}

          {!loading &&
            !error &&
            filteredPosts.length > 0 && (

              <div className="home-post-list">

                {filteredPosts.map((post) => (

                  <article
                    className="home-post-card"
                    key={post.id || post.slug}
                  >

                    {post.coverImage && (
                      <Link
                        to={`/post/${post.slug}`}
                        className="home-post-cover"
                      >
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          loading="lazy"
                        />
                      </Link>
                    )}


                    <div className="home-post-body">

                      <div className="home-author-row">

                        {post.avatar ? (
                          <img
                            src={post.avatar}
                            alt={post.authorName}
                            className="home-avatar"
                          />
                        ) : (
                          <span className="home-avatar home-avatar-fallback">
                            {getInitial(
                              post.authorName
                            )}
                          </span>
                        )}

                        <div className="home-author-info">

                          <strong>
                            {post.authorName}
                          </strong>

                          <span>
                            <CalendarDays size={13} />
                            {formatDate(
                              post.createdAt
                            )}
                          </span>

                        </div>

                      </div>


                      <Link
                        to={`/post/${post.slug}`}
                        className="home-post-title"
                      >
                        {post.title}
                      </Link>


                      <p className="home-post-excerpt">
                        {truncateText(
                          post.excerpt,
                          240
                        )}
                      </p>


                      {post.tags?.length > 0 && (
                        <div className="home-tags">

                          {post.tags
                            .slice(0, 6)
                            .map((tag, index) => {

                              const tagName =
                                typeof tag === "string"
                                  ? tag
                                  : tag?.name ||
                                    tag?.slug ||
                                    "";

                              return (
                                <span
                                  key={`${tagName}-${index}`}
                                >
                                  #
                                  {tagName.replace(
                                    /^#/,
                                    ""
                                  )}
                                </span>
                              );
                            })}

                        </div>
                      )}


                      <div className="home-post-footer">

                        <div className="home-post-stats">

                          <span>
                            <Heart size={17} />
                            {post.likes}
                          </span>

                          <span>
                            <MessageCircle size={17} />
                            {post.comments}
                          </span>

                        </div>

                        <Link
                          to={`/post/${post.slug}`}
                          className="home-read-button"
                        >
                          Read
                          <ArrowRight size={16} />
                        </Link>

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
