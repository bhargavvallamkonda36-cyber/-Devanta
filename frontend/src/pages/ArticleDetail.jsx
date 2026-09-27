import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  Heart,
  MessageCircle,
  PenLine,
  Send,
  Share2,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import DevantaSidebar from "../components/DevantaSidebar";
import { API_URL } from "../config";

import "../styles/ArticleDetail.css";

function formatDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
    "Devanta User"
  );
}

function getAvatar(post) {
  const author = getAuthor(post);

  return (
    author?.avatar_url ||
    author?.avatarUrl ||
    post?.avatar_url ||
    null
  );
}

function getInitial(name) {
  return (
    name?.charAt(0)?.toUpperCase() ||
    "D"
  );
}

function normalizeComments(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.comments)) {
    return data.comments;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [post, setPost] =
    useState(null);

  const [comments, setComments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [liked, setLiked] =
    useState(false);

  const [bookmarked, setBookmarked] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [commentText, setCommentText] =
    useState("");

  const [commentLoading, setCommentLoading] =
    useState(false);

  async function loadArticle() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/posts/${slug}`,
        );

      if (!response.ok) {
        throw new Error(
          "Article not found.",
        );
      }

      const data =
        await response.json();

      setPost(
        data?.post || data,
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to load article.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSocialData(postId) {
    const token =
      localStorage.getItem(
        "devanta_token",
      );

    try {
      const statusResponse =
        await fetch(
          `${API_URL}/social/posts/${postId}/status`,
          {
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {},
          },
        );

      if (statusResponse.ok) {
        const status =
          await statusResponse.json();

        setLiked(
          Boolean(
            status?.liked ??
              status?.is_liked ??
              status?.liked_by_me,
          ),
        );

        setBookmarked(
          Boolean(
            status?.bookmarked ??
              status?.is_bookmarked ??
              status?.bookmarked_by_me,
          ),
        );
      }
    } catch (err) {
      console.error(
        "Status error:",
        err,
      );
    }

    try {
      const commentsResponse =
        await fetch(
          `${API_URL}/social/posts/${postId}/comments`,
        );

      if (commentsResponse.ok) {
        const data =
          await commentsResponse.json();

        setComments(
          normalizeComments(data),
        );
      }
    } catch (err) {
      console.error(
        "Comments error:",
        err,
      );
    }
  }

  useEffect(() => {
    loadArticle();
  }, [slug]);

  useEffect(() => {
    if (post?.id) {
      loadSocialData(post.id);
    }
  }, [post?.id]);

  async function toggleLike() {
    const token =
      localStorage.getItem(
        "devanta_token",
      );

    if (!token) {
      navigate("/login");
      return;
    }

    if (actionLoading) return;

    try {
      setActionLoading(true);

      const method = liked
        ? "DELETE"
        : "POST";

      const response =
        await fetch(
          `${API_URL}/social/posts/${post.id}/like`,
          {
            method,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      if (!response.ok) {
        throw new Error(
          "Unable to update like.",
        );
      }

      setLiked(!liked);

      setPost((current) => {
        if (!current) return current;

        const currentLikes =
          Number(
            current.likes_count ??
              current.like_count ??
              current.likes ??
              0,
          );

        return {
          ...current,
          likes_count: Math.max(
            0,
            currentLikes +
              (liked ? -1 : 1),
          ),
        };
      });
    } catch (err) {
      alert(
        err?.message ||
          "Unable to update like.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function toggleBookmark() {
    const token =
      localStorage.getItem(
        "devanta_token",
      );

    if (!token) {
      navigate("/login");
      return;
    }

    if (actionLoading) return;

    try {
      setActionLoading(true);

      const method = bookmarked
        ? "DELETE"
        : "POST";

      const response =
        await fetch(
          `${API_URL}/social/posts/${post.id}/bookmark`,
          {
            method,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

      if (!response.ok) {
        throw new Error(
          "Unable to update bookmark.",
        );
      }

      setBookmarked(!bookmarked);
    } catch (err) {
      alert(
        err?.message ||
          "Unable to update bookmark.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function submitComment(event) {
    event.preventDefault();

    const token =
      localStorage.getItem(
        "devanta_token",
      );

    if (!token) {
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setCommentLoading(true);

      const response =
        await fetch(
          `${API_URL}/social/posts/${post.id}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content:
                commentText.trim(),
            }),
          },
        );

      if (!response.ok) {
        throw new Error(
          "Unable to post comment.",
        );
      }

      const data =
        await response.json();

      const newComment =
        data?.comment || data;

      if (newComment) {
        setComments((current) => [
          ...current,
          newComment,
        ]);
      } else {
        await loadSocialData(
          post.id,
        );
      }

      setCommentText("");
    } catch (err) {
      alert(
        err?.message ||
          "Unable to post comment.",
      );
    } finally {
      setCommentLoading(false);
    }
  }

  async function shareArticle() {
    const url =
      window.location.href;

    try {
      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          url,
        );

        alert(
          "Article link copied.",
        );
      } else {
        alert(url);
      }
    } catch {
      alert(url);
    }
  }

  if (loading) {
    return (
      <div className="article-layout">
        <DevantaSidebar />

        <main className="article-main">
          <div className="article-state">
            <div className="article-loader" />

            <h2>
              Loading article...
            </h2>

            <p>
              Please wait while the story
              loads.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="article-layout">
        <DevantaSidebar />

        <main className="article-main">
          <div className="article-state">
            <div className="article-state-icon">
              !
            </div>

            <h2>
              Unable to load article
            </h2>

            <p>
              {error ||
                "Article not found."}
            </p>

            <Link
              to="/explore"
              className="article-state-button"
            >
              <ArrowLeft size={17} />
              Back to Explore
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const authorName =
    getAuthorName(post);

  const avatar =
    getAvatar(post);

  const tags = Array.isArray(
    post.tags,
  )
    ? post.tags
        .map((tag) =>
          typeof tag === "string"
            ? tag
            : tag?.name ||
              tag?.slug ||
              "",
        )
        .filter(Boolean)
    : [];

  const likes =
    Number(
      post.likes_count ??
        post.like_count ??
        post.likes ??
        0,
    ) + (liked ? 0 : 0);

  return (
    <div className="article-layout">
      <DevantaSidebar />

      <main className="article-main">
        <header className="article-top-header">
          <Link
            to="/explore"
            className="article-back"
          >
            <ArrowLeft size={18} />
            Explore
          </Link>

          <div className="article-top-actions">
            <Link
              to="/write"
              className="article-write"
            >
              <PenLine size={17} />
              Write
            </Link>

            <Link
              to="/profile"
              className="article-user"
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
            </Link>
          </div>
        </header>

        <article className="article-page">
          <div className="article-header">
            <div className="article-eyebrow">
              DEVELOPER STORY
            </div>

            <h1>
              {post.title ||
                "Untitled article"}
            </h1>

            <p className="article-excerpt">
              {post.excerpt ||
                "A developer story published on Devanta."}
            </p>

            <div className="article-author-row">
              <div className="article-author-avatar">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={authorName}
                  />
                ) : (
                  getInitial(
                    authorName,
                  )
                )}
              </div>

              <div className="article-author-info">
                <strong>
                  {authorName}
                </strong>

                <span>
                  <CalendarDays
                    size={14}
                  />

                  {formatDate(
                    post.created_at ||
                      post.createdAt,
                  )}
                </span>
              </div>
            </div>
          </div>

          {(post.cover_image ||
            post.coverImage) && (
            <div className="article-cover">
              <img
                src={
                  post.cover_image ||
                  post.coverImage
                }
                alt={
                  post.title ||
                  "Article cover"
                }
              />
            </div>
          )}

          <div className="article-toolbar">
            <div className="article-toolbar-left">
              <button
                type="button"
                className={
                  liked
                    ? "article-action active"
                    : "article-action"
                }
                onClick={toggleLike}
                disabled={
                  actionLoading
                }
              >
                <Heart
                  size={18}
                  fill={
                    liked
                      ? "currentColor"
                      : "none"
                  }
                />

                {likes}
              </button>

              <span className="article-action-static">
                <MessageCircle
                  size={18}
                />

                {comments.length}
              </span>
            </div>

            <div className="article-toolbar-right">
              <button
                type="button"
                className={
                  bookmarked
                    ? "article-action active"
                    : "article-action"
                }
                onClick={
                  toggleBookmark
                }
                disabled={
                  actionLoading
                }
              >
                <Bookmark
                  size={18}
                  fill={
                    bookmarked
                      ? "currentColor"
                      : "none"
                  }
                />

                {bookmarked
                  ? "Saved"
                  : "Save"}
              </button>

              <button
                type="button"
                className="article-action"
                onClick={
                  shareArticle
                }
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {tags.length > 0 && (
            <div className="article-tags">
              {tags.map((tag, index) => (
                <Link
                  key={`${tag}-${index}`}
                  to={`/tag/${tag}`}
                >
                  #{tag.replace(
                    /^#/,
                    "",
                  )}
                </Link>
              ))}
            </div>
          )}

          <div className="article-body">
            {(post.content || "")
              .split("\n")
              .map(
                (paragraph, index) =>
                  paragraph.trim() ? (
                    <p
                      key={index}
                    >
                      {paragraph}
                    </p>
                  ) : (
                    <div
                      key={index}
                      className="article-spacer"
                    />
                  ),
              )}
          </div>

          <section className="article-comments">
            <div className="article-comments-heading">
              <div>
                <span>
                  COMMUNITY
                </span>

                <h2>
                  Comments
                </h2>
              </div>

              <span>
                {comments.length}
              </span>
            </div>

            <form
              className="article-comment-form"
              onSubmit={
                submitComment
              }
            >
              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(
                    event.target
                      .value,
                  )
                }
                placeholder="Share your thoughts..."
                rows={4}
              />

              <button
                type="submit"
                disabled={
                  commentLoading ||
                  !commentText.trim()
                }
              >
                <Send size={16} />

                {commentLoading
                  ? "Posting..."
                  : "Post comment"}
              </button>
            </form>

            {comments.length ===
              0 && (
              <div className="article-no-comments">
                <MessageCircle
                  size={25}
                />

                <h3>
                  No comments yet
                </h3>

                <p>
                  Be the first person to
                  start the conversation.
                </p>
              </div>
            )}

            {comments.length >
              0 && (
              <div className="article-comment-list">
                {comments.map(
                  (
                    comment,
                    index,
                  ) => {
                    const commentUser =
                      comment?.user ||
                      comment?.author ||
                      {};

                    const name =
                      commentUser?.name ||
                      commentUser?.username ||
                      comment?.username ||
                      "Devanta User";

                    return (
                      <div
                        key={
                          comment?.id ||
                          index
                        }
                        className="article-comment"
                      >
                        <div className="article-comment-avatar">
                          {getInitial(
                            name,
                          )}
                        </div>

                        <div className="article-comment-content">
                          <div className="article-comment-meta">
                            <strong>
                              {name}
                            </strong>

                            <span>
                              {formatDate(
                                comment?.created_at ||
                                  comment?.createdAt,
                              )}
                            </span>
                          </div>

                          <p>
                            {comment?.content ||
                              comment?.text ||
                              ""}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>
        </article>
      </main>
    </div>
  );
}
