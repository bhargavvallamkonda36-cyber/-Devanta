import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Hash,
  Heart,
  MessageCircle,
  Search,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import DiscoverLayout from "../DiscoverLayout";

import "../styles/TagPage.css";

const API_URL = "http://127.0.0.1:8000";

export default function TagPage() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const tagName = useMemo(() => {
    if (!slug) {
      return "Topic";
    }

    return decodeURIComponent(slug)
      .replace(/-/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }, [slug]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/posts?tag=${encodeURIComponent(
          slug || ""
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load articles (${response.status})`
        );
      }

      const data = await response.json();

      let normalizedPosts = [];

      if (Array.isArray(data)) {
        normalizedPosts = data;
      } else if (Array.isArray(data.posts)) {
        normalizedPosts = data.posts;
      } else if (Array.isArray(data.items)) {
        normalizedPosts = data.items;
      } else if (Array.isArray(data.data)) {
        normalizedPosts = data.data;
      }

      setPosts(normalizedPosts);
    } catch (err) {
      console.error(
        "Tag page loading error:",
        err
      );

      setError(
        err.message ||
          "Unable to load articles."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [slug]);

  const filteredPosts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return posts;
    }

    return posts.filter((post) => {
      const title =
        post?.title || "";

      const excerpt =
        post?.excerpt ||
        post?.description ||
        "";

      const content =
        post?.content || "";

      const author =
        post?.author?.name ||
        post?.author?.username ||
        post?.author_name ||
        post?.username ||
        "";

      return (
        title
          .toLowerCase()
          .includes(query) ||
        excerpt
          .toLowerCase()
          .includes(query) ||
        content
          .toLowerCase()
          .includes(query) ||
        author
          .toLowerCase()
          .includes(query)
      );
    });
  }, [posts, search]);

  const getAuthor = (post) => {
    return (
      post?.author ||
      post?.user ||
      {}
    );
  };

  const getAuthorName = (post) => {
    const author =
      getAuthor(post);

    return (
      author?.name ||
      author?.username ||
      post?.author_name ||
      post?.username ||
      "Devanta User"
    );
  };

  const getAuthorAvatar = (post) => {
    const author =
      getAuthor(post);

    return (
      author?.avatar_url ||
      author?.avatarUrl ||
      author?.profile_image ||
      author?.profileImage ||
      post?.avatar_url ||
      null
    );
  };

  const getAuthorInitial = (post) => {
    return (
      getAuthorName(post)
        .charAt(0)
        .toUpperCase() || "D"
    );
  };

  const getPostDate = (post) => {
    const date =
      post?.created_at ||
      post?.createdAt ||
      post?.published_at ||
      post?.updated_at;

    if (!date) {
      return "";
    }

    try {
      return new Date(date).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return "";
    }
  };

  const getLikes = (post) => {
    return (
      post?.likes_count ??
      post?.like_count ??
      post?.likes ??
      0
    );
  };

  const getComments = (post) => {
    return (
      post?.comments_count ??
      post?.comment_count ??
      post?.comments ??
      0
    );
  };

  const getTags = (post) => {
    if (!Array.isArray(post?.tags)) {
      return [];
    }

    return post.tags;
  };

  const getTagName = (tag) => {
    if (typeof tag === "string") {
      return tag;
    }

    return (
      tag?.name ||
      tag?.slug ||
      ""
    );
  };

  const getExcerpt = (post) => {
    if (post?.excerpt) {
      return post.excerpt;
    }

    if (post?.description) {
      return post.description;
    }

    if (post?.content) {
      const cleanContent =
        post.content
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();

      if (cleanContent.length > 180) {
        return `${cleanContent.slice(
          0,
          180
        )}...`;
      }

      return cleanContent;
    }

    return "Read this developer story on Devanta.";
  };

  const getCoverImage = (post) => {
    return (
      post?.cover_image ||
      post?.coverImage ||
      post?.image ||
      post?.cover_url ||
      null
    );
  };

  return (
    <DiscoverLayout
      eyebrow="TOPIC"
      title={`#${tagName}`}
      subtitle={`Discover developer articles, tutorials, and ideas about ${tagName}.`}
    >
      <div className="tag-page">

        {/* TOP ACTIONS */}
        <div className="tag-page-top">

          <button
            type="button"
            className="tag-back-button"
            onClick={() =>
              navigate("/tags")
            }
          >
            <ArrowLeft size={18} />
            <span>
              All topics
            </span>
          </button>

          <div className="tag-page-label">
            <Hash size={18} />
            <span>
              {posts.length}{" "}
              {posts.length === 1
                ? "article"
                : "articles"}
            </span>
          </div>

        </div>

        {/* SEARCH */}
        <div className="tag-search">
          <Search size={21} />

          <input
            type="text"
            placeholder={`Search #${tagName} articles...`}
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="tag-page-state tag-error">
            <div className="tag-state-icon">
              !
            </div>

            <h3>
              Unable to load articles
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadPosts}
            >
              Try again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && !error && (
          <div className="tag-page-state">
            <div className="tag-loader" />

            <h3>
              Loading articles...
            </h3>

            <p>
              Finding stories about #
              {tagName}.
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredPosts.length === 0 && (
            <div className="tag-page-state">

              <div className="tag-state-icon">
                <Hash size={28} />
              </div>

              <h3>
                No articles found
              </h3>

              <p>
                There are no articles matching
                this topic yet.
              </p>

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  Clear search
                </button>
              )}

            </div>
          )}

        {/* ARTICLES */}
        {!loading &&
          !error &&
          filteredPosts.length > 0 && (
            <div className="tag-articles">

              {filteredPosts.map(
                (post, index) => {
                  const slugValue =
                    post?.slug ||
                    post?.id ||
                    index;

                  const title =
                    post?.title ||
                    "Untitled article";

                  const authorName =
                    getAuthorName(post);

                  const avatar =
                    getAuthorAvatar(post);

                  const initial =
                    getAuthorInitial(post);

                  const cover =
                    getCoverImage(post);

                  const excerpt =
                    getExcerpt(post);

                  const date =
                    getPostDate(post);

                  const likes =
                    getLikes(post);

                  const comments =
                    getComments(post);

                  const tags =
                    getTags(post);

                  return (
                    <article
                      key={
                        post?.id ||
                        post?.slug ||
                        index
                      }
                      className="tag-article-card"
                    >

                      {/* COVER */}
                      {cover && (
                        <Link
                          to={`/post/${slugValue}`}
                          className="tag-article-cover"
                        >
                          <img
                            src={cover}
                            alt={title}
                            onError={(
                              event
                            ) => {
                              event.currentTarget.parentElement.style.display =
                                "none";
                            }}
                          />
                        </Link>
                      )}

                      <div className="tag-article-body">

                        {/* AUTHOR */}
                        <div className="tag-article-author">

                          <div className="tag-author-avatar">

                            {avatar ? (
                              <img
                                src={avatar}
                                alt={
                                  authorName
                                }
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <span>
                                {initial}
                              </span>
                            )}

                          </div>

                          <div className="tag-author-info">

                            <strong>
                              {authorName}
                            </strong>

                            {date && (
                              <span>
                                <Calendar
                                  size={14}
                                />
                                {date}
                              </span>
                            )}

                          </div>

                        </div>

                        {/* TITLE */}
                        <Link
                          to={`/post/${slugValue}`}
                          className="tag-article-title"
                        >
                          {title}
                        </Link>

                        {/* EXCERPT */}
                        <p className="tag-article-excerpt">
                          {excerpt}
                        </p>

                        {/* FOOTER */}
                        <div className="tag-article-footer">

                          <div className="tag-article-stats">

                            <span>
                              <Heart
                                size={15}
                              />
                              {likes}
                            </span>

                            <span>
                              <MessageCircle
                                size={15}
                              />
                              {comments}
                            </span>

                          </div>

                          <div className="tag-article-tags">

                            {tags
                              .slice(0, 4)
                              .map(
                                (
                                  tag,
                                  tagIndex
                                ) => {
                                  const name =
                                    getTagName(
                                      tag
                                    );

                                  if (
                                    !name
                                  ) {
                                    return null;
                                  }

                                  return (
                                    <span
                                      key={`${name}-${tagIndex}`}
                                      className="tag-pill"
                                    >
                                      #
                                      {name}
                                    </span>
                                  );
                                }
                              )}

                          </div>

                          <Link
                            to={`/post/${slugValue}`}
                            className="tag-read-more"
                          >
                            Read
                            <ArrowRight
                              size={16}
                            />
                          </Link>

                        </div>

                      </div>
                    </article>
                  );
                }
              )}

            </div>
          )}

      </div>
    </DiscoverLayout>
  );
}
