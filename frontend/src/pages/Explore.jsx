import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  Heart,
  MessageCircle,
  Search,
  Tag,
} from "lucide-react";

import { Link } from "react-router-dom";

import DevantaSidebar from "../components/DevantaSidebar";
import { API_URL } from "../config";

import "../styles/Explore.css";

const DEFAULT_TOPICS = [
  "ai",
  "react",
  "python",
  "software-development",
  "web-development",
  "programming",
  "git",
  "github",
  "api",
  "backend",
];

function normalizePosts(data) {
  if (Array.isArray(data)) return data;

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

function getAuthor(post) {
  return post?.author || post?.user || {};
}

function getAuthorName(post) {
  const author = getAuthor(post);

  return (
    author?.name ||
    author?.username ||
    post?.author_name ||
    post?.username ||
    "Devanta User"
  );
}

function getAvatar(post) {
  const author = getAuthor(post);

  return (
    author?.avatar_url ||
    author?.avatarUrl ||
    post?.avatar_url ||
    post?.author_avatar ||
    null
  );
}

function getInitial(name) {
  return (
    name?.trim()?.charAt(0)?.toUpperCase() ||
    "D"
  );
}

function formatDate(value) {
  if (!value) return "Recently";

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

function getTags(post) {
  if (!Array.isArray(post?.tags)) {
    return [];
  }

  return post.tags
    .map((tag) =>
      typeof tag === "string"
        ? tag
        : tag?.name || tag?.slug || "",
    )
    .filter(Boolean);
}

export default function Explore() {
  const [posts, setPosts] = useState([]);

  const [searchText, setSearchText] =
    useState("");

  const [submittedSearch, setSubmittedSearch] =
    useState("");

  const [activeTopic, setActiveTopic] =
    useState("");

  const [sort, setSort] =
    useState("latest");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadPosts(
    search = submittedSearch,
    topic = activeTopic,
  ) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (topic) {
        params.set("tag", topic);
      }

      const query = params.toString();

      const response = await fetch(
        `${API_URL}/posts${
          query ? `?${query}` : ""
        }`,
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load articles.",
        );
      }

      const data = await response.json();

      setPosts(normalizePosts(data));
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to load articles.",
      );

      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts("", "");
  }, []);

  useEffect(() => {
    if (!submittedSearch && !activeTopic) {
      return;
    }

    loadPosts(
      submittedSearch,
      activeTopic,
    );
  }, [activeTopic, submittedSearch]);

  const sortedPosts = useMemo(() => {
    const copy = [...posts];

    if (sort === "popular") {
      return copy.sort(
        (a, b) =>
          Number(
            b.likes_count ??
              b.like_count ??
              b.likes ??
              0,
          ) -
          Number(
            a.likes_count ??
              a.like_count ??
              a.likes ??
              0,
          ),
      );
    }

    if (sort === "oldest") {
      return copy.sort(
        (a, b) =>
          new Date(
            a.created_at ||
              a.createdAt ||
              0,
          ) -
          new Date(
            b.created_at ||
              b.createdAt ||
              0,
          ),
      );
    }

    return copy.sort(
      (a, b) =>
        new Date(
          b.created_at ||
            b.createdAt ||
            0,
        ) -
        new Date(
          a.created_at ||
            a.createdAt ||
            0,
        ),
    );
  }, [posts, sort]);

  return (
    <div className="explore-layout">
      <DevantaSidebar />

      <main className="explore-main">
        <header className="explore-top-header">
          <span className="explore-header-label">
            DEVANTA COMMUNITY
          </span>

          <div className="explore-header-actions">
            <Link
              to="/write"
              className="explore-header-write"
            >
              Write
            </Link>

            <Link
              to="/profile"
              className="explore-header-user"
            >
              <span>
                {(
                  localStorage.getItem(
                    "devanta_username",
                  ) || "D"
                )
                  .charAt(0)
                  .toUpperCase()}
              </span>

              <strong>
                {localStorage.getItem(
                  "devanta_username",
                ) || "Developer"}
              </strong>
            </Link>
          </div>
        </header>

        <section className="explore-page">
          <div className="explore-hero">
            <div>
              <span className="explore-eyebrow">
                DISCOVER
              </span>

              <h1>
                Explore developer
                stories & ideas.
              </h1>

              <p>
                Find tutorials, experiences,
                projects, and technical
                insights from the Devanta
                developer community.
              </p>
            </div>

            <Link
              to="/write"
              className="explore-hero-button"
            >
              Write
            </Link>
          </div>

          <div className="explore-content">
            <form
              className="explore-search-row"
              onSubmit={(event) => {
                event.preventDefault();

                setSubmittedSearch(
                  searchText,
                );
              }}
            >
              <div className="explore-search">
                <Search size={20} />

                <input
                  value={searchText}
                  onChange={(event) =>
                    setSearchText(
                      event.target.value,
                    )
                  }
                  placeholder="Search articles..."
                />
              </div>

              <button type="submit">
                Search
              </button>
            </form>

            <div className="explore-topics">
              <div className="explore-topic-label">
                <Tag size={18} />
                Topics
              </div>

              <button
                type="button"
                className={
                  activeTopic === ""
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setActiveTopic("")
                }
              >
                All
              </button>

              {DEFAULT_TOPICS.map(
                (topic) => (
                  <button
                    type="button"
                    key={topic}
                    className={
                      activeTopic === topic
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveTopic(
                        topic,
                      )
                    }
                  >
                    #{topic}
                  </button>
                ),
              )}
            </div>

            <div className="explore-section-heading">
              <div>
                <span>
                  DEVANTA COMMUNITY
                </span>

                <h2>
                  Discover articles
                </h2>
              </div>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value,
                  )
                }
              >
                <option value="latest">
                  Latest
                </option>

                <option value="popular">
                  Popular
                </option>

                <option value="oldest">
                  Oldest
                </option>
              </select>
            </div>

            {loading && (
              <div className="explore-state">
                <div className="explore-loader" />

                <h3>
                  Loading articles...
                </h3>

                <p>
                  Discovering the latest
                  stories.
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="explore-state">
                <div className="explore-state-icon">
                  !
                </div>

                <h3>
                  Unable to load articles
                </h3>

                <p>{error}</p>

                <button
                  onClick={() =>
                    loadPosts(
                      submittedSearch,
                      activeTopic,
                    )
                  }
                >
                  Try again
                </button>
              </div>
            )}

            {!loading &&
              !error &&
              sortedPosts.length === 0 && (
                <div className="explore-state">
                  <div className="explore-state-icon">
                    <Search size={26} />
                  </div>

                  <h3>
                    No articles found
                  </h3>

                  <p>
                    Try a different search
                    or topic.
                  </p>
                </div>
              )}

            {!loading &&
              !error &&
              sortedPosts.length > 0 && (
                <div className="explore-grid">
                  {sortedPosts.map(
                    (post) => {
                      const authorName =
                        getAuthorName(
                          post,
                        );

                      const avatar =
                        getAvatar(
                          post,
                        );

                      const tags =
                        getTags(post);

                      return (
                        <article
                          key={
                            post.id ||
                            post.slug
                          }
                          className="explore-card"
                        >
                          <Link
                            to={`/post/${post.slug}`}
                            className="explore-card-cover"
                          >
                            {post.cover_image ||
                            post.coverImage ? (
                              <img
                                src={
                                  post.cover_image ||
                                  post.coverImage
                                }
                                alt={
                                  post.title ||
                                  "Article"
                                }
                              />
                            ) : (
                              <div className="explore-card-placeholder">
                                D
                              </div>
                            )}
                          </Link>

                          <div className="explore-card-body">
                            <div className="explore-author">
                              <span className="explore-avatar">
                                {avatar ? (
                                  <img
                                    src={
                                      avatar
                                    }
                                    alt={
                                      authorName
                                    }
                                  />
                                ) : (
                                  getInitial(
                                    authorName,
                                  )
                                )}
                              </span>

                              <div>
                                <strong>
                                  {
                                    authorName
                                  }
                                </strong>

                                <span>
                                  <CalendarDays
                                    size={
                                      13
                                    }
                                  />

                                  {formatDate(
                                    post.created_at ||
                                      post.createdAt,
                                  )}
                                </span>
                              </div>
                            </div>

                            <Link
                              to={`/post/${post.slug}`}
                              className="explore-card-title"
                            >
                              {post.title ||
                                "Untitled article"}
                            </Link>

                            <p className="explore-card-excerpt">
                              {post.excerpt ||
                                "Read this developer story on Devanta."}
                            </p>

                            {tags.length >
                              0 && (
                              <div className="explore-card-tags">
                                {tags
                                  .slice(
                                    0,
                                    3,
                                  )
                                  .map(
                                    (
                                      tag,
                                      index,
                                    ) => (
                                      <span
                                        key={`${tag}-${index}`}
                                      >
                                        #
                                        {tag.replace(
                                          /^#/,
                                          "",
                                        )}
                                      </span>
                                    ),
                                  )}
                              </div>
                            )}

                            <div className="explore-card-footer">
                              <div>
                                <span>
                                  <Heart
                                    size={
                                      15
                                    }
                                  />

                                  {post.likes_count ??
                                    post.like_count ??
                                    post.likes ??
                                    0}
                                </span>

                                <span>
                                  <MessageCircle
                                    size={
                                      15
                                    }
                                  />

                                  {post.comments_count ??
                                    post.comment_count ??
                                    post.comments ??
                                    0}
                                </span>
                              </div>

                              <Link
                                to={`/post/${post.slug}`}
                                className="explore-read"
                              >
                                Read
                                <ArrowRight
                                  size={
                                    15
                                  }
                                />
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
          </div>
        </section>
      </main>
    </div>
  );
}
