import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  Eye,
  Image as ImageIcon,
  PenLine,
  Save,
  Send,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import DevantaSidebar from "../components/DevantaSidebar";
import { API_URL } from "../config";

import "../styles/Write.css";

function getArticleId(post) {
  return post?.id || post?.post_id;
}

function normalizePost(data) {
  if (data?.post) {
    return data.post;
  }

  return data;
}

export default function Write() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editing = Boolean(id);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [tags, setTags] =
    useState("");

  const [coverImage, setCoverImage] =
    useState("");

  const [articleStatus, setArticleStatus] =
    useState("draft");

  const [loading, setLoading] =
    useState(editing);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const username =
    localStorage.getItem(
      "devanta_username",
    ) || "Developer";

  useEffect(() => {
    if (!editing) return;

    let cancelled = false;

    async function loadArticle() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "devanta_token",
          );

        const response =
          await fetch(
            `${API_URL}/posts/mine`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

        if (!response.ok) {
          throw new Error(
            "Unable to load your article.",
          );
        }

        const data =
          await response.json();

        const posts = Array.isArray(
          data,
        )
          ? data
          : Array.isArray(data?.posts)
            ? data.posts
            : Array.isArray(data?.items)
              ? data.items
              : [];

        const post =
          posts.find(
            (item) =>
              String(
                getArticleId(item),
              ) === String(id),
          );

        if (!post) {
          throw new Error(
            "Article not found.",
          );
        }

        if (cancelled) return;

        setTitle(post.title || "");

        setContent(
          post.content || "",
        );

        const postTags =
          Array.isArray(post.tags)
            ? post.tags
                .map((tag) =>
                  typeof tag ===
                  "string"
                    ? tag
                    : tag?.name ||
                      tag?.slug ||
                      "",
                )
                .filter(Boolean)
            : [];

        setTags(
          postTags.join(", "),
        );

        setCoverImage(
          post.cover_image ||
            post.coverImage ||
            "",
        );

        setArticleStatus(
          post.status ===
            "published"
            ? "published"
            : "draft",
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              "Unable to load article.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      cancelled = true;
    };
  }, [editing, id]);

  function getTagArray() {
    return tags
      .split(",")
      .map((tag) =>
        tag.trim().replace(/^#/, ""),
      )
      .filter(Boolean)
      .slice(0, 10);
  }

  async function saveArticle(status) {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!title.trim()) {
        throw new Error(
          "Please enter an article title.",
        );
      }

      if (!content.trim()) {
        throw new Error(
          "Please enter article content.",
        );
      }

      const token =
        localStorage.getItem(
          "devanta_token",
        );

      if (!token) {
        navigate("/login");
        return;
      }

      const body = {
        title: title.trim(),
        content,
        tags: getTagArray(),
        coverImage:
          coverImage.trim() || null,
        status,
      };

      const url = editing
        ? `${API_URL}/posts/${id}`
        : `${API_URL}/posts`;

      const response =
        await fetch(url, {
          method: editing
            ? "PUT"
            : "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });

      if (!response.ok) {
        let message =
          "Unable to save article.";

        try {
          const data =
            await response.json();

          if (
            typeof data?.detail ===
            "string"
          ) {
            message = data.detail;
          } else if (
            Array.isArray(data?.detail)
          ) {
            message =
              data.detail
                .map(
                  (item) =>
                    item?.msg ||
                    "Invalid data",
                )
                .join(", ");
          }
        } catch {
          // ignore
        }

        throw new Error(message);
      }

      const data =
        await response.json();

      setArticleStatus(status);

      setSuccess(
        status === "published"
          ? "Article published successfully."
          : "Draft saved successfully.",
      );

      if (
        status === "published"
      ) {
        const saved =
          normalizePost(data);

        const slug =
          saved?.slug;

        setTimeout(() => {
          if (slug) {
            navigate(
              `/post/${slug}`,
            );
          } else {
            navigate("/dashboard");
          }
        }, 700);
      } else {
        setTimeout(() => {
          navigate("/dashboard");
        }, 700);
      }
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to save article.",
      );
    } finally {
      setSaving(false);
    }
  }

  function previewArticle() {
    if (!title.trim()) {
      setError(
        "Enter a title before previewing.",
      );

      return;
    }

    setError("");

    alert(
      `Preview:\n\n${title}\n\n${content}`,
    );
  }

  if (loading) {
    return (
      <div className="write-layout">
        <DevantaSidebar />

        <main className="write-main">
          <div className="write-loading">
            <div className="write-loader" />

            <h2>
              Loading editor...
            </h2>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="write-layout">
      <DevantaSidebar />

      <main className="write-main">
        <header className="write-top-header">
          <Link
            to="/dashboard"
            className="write-back"
          >
            <ArrowLeft size={18} />
            Dashboard
          </Link>

          <div className="write-header-center">
            <PenLine size={17} />
            {editing
              ? "Edit article"
              : "New article"}
          </div>

          <div className="write-header-user">
            <span>
              {username
                .charAt(0)
                .toUpperCase()}
            </span>

            <strong>
              {username}
            </strong>
          </div>
        </header>

        <section className="write-page">
          <div className="write-heading">
            <span>
              {editing
                ? "EDIT STORY"
                : "NEW STORY"}
            </span>

            <h1>
              {editing
                ? "Edit your article."
                : "Share your idea."}
            </h1>

            <p>
              Write, save, and publish your
              developer story on Devanta.
            </p>
          </div>

          {error && (
            <div className="write-alert write-error">
              <X size={17} />
              {error}
            </div>
          )}

          {success && (
            <div className="write-alert write-success">
              <Check size={17} />
              {success}
            </div>
          )}

          <div className="write-editor">
            <div className="write-editor-main">
              <input
                className="write-title-input"
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder="Article title..."
              />

              <textarea
                className="write-content-input"
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value,
                  )
                }
                placeholder="Start writing your story..."
              />
            </div>

            <aside className="write-sidebar">
              <div className="write-panel">
                <div className="write-panel-heading">
                  <ImageIcon size={18} />

                  <div>
                    <strong>
                      Cover image
                    </strong>

                    <span>
                      Optional
                    </span>
                  </div>
                </div>

                <input
                  value={coverImage}
                  onChange={(event) =>
                    setCoverImage(
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                />

                {coverImage && (
                  <img
                    className="write-cover-preview"
                    src={coverImage}
                    alt="Cover preview"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                )}
              </div>

              <div className="write-panel">
                <div className="write-panel-heading">
                  <PenLine size={18} />

                  <div>
                    <strong>
                      Topics
                    </strong>

                    <span>
                      Separate with commas
                    </span>
                  </div>
                </div>

                <input
                  value={tags}
                  onChange={(event) =>
                    setTags(
                      event.target.value,
                    )
                  }
                  placeholder="react, python, ai"
                />

                {getTagArray().length >
                  0 && (
                  <div className="write-tag-preview">
                    {getTagArray().map(
                      (tag) => (
                        <span key={tag}>
                          #{tag}
                        </span>
                      ),
                    )}
                  </div>
                )}
              </div>

              <div className="write-panel write-status-panel">
                <strong>
                  Publishing
                </strong>

                <label>
                  <input
                    type="radio"
                    checked={
                      articleStatus ===
                      "draft"
                    }
                    onChange={() =>
                      setArticleStatus(
                        "draft",
                      )
                    }
                  />

                  Draft
                </label>

                <label>
                  <input
                    type="radio"
                    checked={
                      articleStatus ===
                      "published"
                    }
                    onChange={() =>
                      setArticleStatus(
                        "published",
                      )
                    }
                  />

                  Published
                </label>
              </div>
            </aside>
          </div>

          <div className="write-actions">
            <button
              type="button"
              className="write-preview-button"
              onClick={previewArticle}
              disabled={saving}
            >
              <Eye size={17} />
              Preview
            </button>

            <div>
              <button
                type="button"
                className="write-save-button"
                onClick={() =>
                  saveArticle("draft")
                }
                disabled={saving}
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : "Save draft"}
              </button>

              <button
                type="button"
                className="write-publish-button"
                onClick={() =>
                  saveArticle(
                    "published",
                  )
                }
                disabled={saving}
              >
                <Send size={17} />

                {saving
                  ? "Publishing..."
                  : editing &&
                      articleStatus ===
                        "published"
                    ? "Update article"
                    : "Publish"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
