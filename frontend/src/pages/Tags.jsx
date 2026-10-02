import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  Hash,
  RefreshCw,
  Search,
} from "lucide-react";

import { Link } from "react-router-dom";

import DiscoverLayout from "../DiscoverLayout";

import "../styles/Tags.css";

import { API_URL } from "../config";

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTags = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/tags`);

      if (!response.ok) {
        throw new Error(
          `Failed to load tags (${response.status})`
        );
      }

      const data = await response.json();

      let normalizedTags = [];

      if (Array.isArray(data)) {
        normalizedTags = data;
      } else if (Array.isArray(data.tags)) {
        normalizedTags = data.tags;
      } else if (Array.isArray(data.items)) {
        normalizedTags = data.items;
      } else if (Array.isArray(data.data)) {
        normalizedTags = data.data;
      }

      setTags(normalizedTags);
    } catch (err) {
      console.error("Tags loading error:", err);

      setError(
        err.message || "Unable to load topics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const filteredTags = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tags;
    }

    return tags.filter((tag) => {
      const name =
        typeof tag === "string"
          ? tag
          : tag?.name ||
            tag?.slug ||
            "";

      return name
        .toLowerCase()
        .includes(query);
    });
  }, [tags, search]);

  return (
    <DiscoverLayout
      eyebrow="TOPICS"
      title="Explore topics."
      subtitle="Find developer stories organized by the technologies and ideas you care about."
    >
      <div className="tags-page">

        {/* SEARCH */}
        <div className="tags-search-wrapper">
          <Search size={21} />

          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* TOOLBAR */}
        <div className="tags-toolbar">

          <div className="tags-count">
            <Hash size={18} />

            <span>
              {filteredTags.length}{" "}
              {filteredTags.length === 1
                ? "topic"
                : "topics"}
            </span>
          </div>

          <button
            type="button"
            className="tags-refresh"
            onClick={loadTags}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "tags-spin"
                  : ""
              }
            />

            <span>Refresh</span>
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="tags-state tags-error">

            <div className="tags-state-icon">
              !
            </div>

            <h3>
              Unable to load topics
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadTags}
            >
              Try again
            </button>

          </div>
        )}

        {/* LOADING */}
        {loading && !error && (
          <div className="tags-state">

            <div className="tags-loader" />

            <h3>
              Loading topics...
            </h3>

            <p>
              Finding topics from the
              Devanta community.
            </p>

          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredTags.length === 0 && (
            <div className="tags-state">

              <div className="tags-state-icon">
                <Hash size={28} />
              </div>

              <h3>
                No topics found
              </h3>

              <p>
                Try another search or create
                an article with some tags.
              </p>

            </div>
          )}

        {/* TAGS */}
        {!loading &&
          !error &&
          filteredTags.length > 0 && (
            <div className="tags-grid">

              {filteredTags.map(
                (tag, index) => {
                  const name =
                    typeof tag === "string"
                      ? tag
                      : tag?.name ||
                        tag?.slug ||
                        `topic-${index}`;

                  const slug =
                    typeof tag === "string"
                      ? tag
                          .toLowerCase()
                          .trim()
                          .replace(
                            /\s+/g,
                            "-"
                          )
                      : tag?.slug ||
                        tag?.name
                          ?.toLowerCase()
                          .trim()
                          .replace(
                            /\s+/g,
                            "-"
                          ) ||
                        `topic-${index}`;

                  const articleCount =
                    typeof tag === "object"
                      ? tag?.article_count ??
                        tag?.post_count ??
                        tag?.count ??
                        null
                      : null;

                  return (
                    <Link
                      key={`${slug}-${index}`}
                      to={`/tag/${slug}`}
                      className="tag-card"
                    >

                      <div className="tag-card-icon">
                        <Hash size={25} />
                      </div>

                      <div className="tag-card-content">

                        <h3>
                          #{name}
                        </h3>

                        {articleCount !==
                          null && (
                          <span>
                            {articleCount}{" "}
                            {articleCount === 1
                              ? "article"
                              : "articles"}
                          </span>
                        )}

                      </div>

                      <ArrowRight
                        className="tag-card-arrow"
                        size={20}
                      />

                    </Link>
                  );
                }
              )}

            </div>
          )}

      </div>
    </DiscoverLayout>
  );
}
