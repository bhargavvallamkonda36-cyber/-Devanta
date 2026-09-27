import React, { useEffect, useMemo, useState } from "react";
import { Search, Users, RefreshCw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import DiscoverLayout from "../DiscoverLayout";

import "../styles/People.css";

const API_URL = "http://127.0.0.1:8000";

export default function People() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/users`);

      if (!response.ok) {
        throw new Error(
          `Failed to load people (${response.status})`
        );
      }

      const data = await response.json();

      let normalizedUsers = [];

      if (Array.isArray(data)) {
        normalizedUsers = data;
      } else if (Array.isArray(data.users)) {
        normalizedUsers = data.users;
      } else if (Array.isArray(data.items)) {
        normalizedUsers = data.items;
      } else if (Array.isArray(data.data)) {
        normalizedUsers = data.data;
      }

      setUsers(normalizedUsers);
    } catch (err) {
      console.error("People loading error:", err);
      setError(
        err.message || "Unable to load people."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const name =
        user?.name ||
        user?.full_name ||
        user?.username ||
        "";

      const username =
        user?.username || "";

      const bio =
        user?.bio ||
        user?.about ||
        "";

      return (
        name.toLowerCase().includes(query) ||
        username.toLowerCase().includes(query) ||
        bio.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const getUserName = (user) => {
    return (
      user?.name ||
      user?.full_name ||
      user?.username ||
      "Devanta User"
    );
  };

  const getUsername = (user) => {
    return (
      user?.username ||
      user?.name ||
      "developer"
    );
  };

  const getAvatar = (user) => {
    return (
      user?.avatar_url ||
      user?.avatarUrl ||
      user?.profile_image ||
      user?.profileImage ||
      null
    );
  };

  const getBio = (user) => {
    return (
      user?.bio ||
      user?.about ||
      user?.description ||
      "Developer and member of the Devanta community."
    );
  };

  const getInitial = (user) => {
    const name = getUserName(user);

    return (
      name.charAt(0).toUpperCase() || "D"
    );
  };

  const getUserId = (user) => {
    return (
      user?.id ||
      user?.user_id ||
      user?.userId
    );
  };

  return (
    <DiscoverLayout
      eyebrow="COMMUNITY"
      title="Meet the developers."
      subtitle="Discover developers, creators, and builders from the Devanta community."
    >
      <div className="people-page">

        {/* SEARCH */}
        <div className="people-search">
          <Search size={21} />

          <input
            type="text"
            placeholder="Search developers..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* TOOLBAR */}
        <div className="people-toolbar">

          <div className="people-count">
            <Users size={18} />

            <span>
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "developer"
                : "developers"}
            </span>
          </div>

          <button
            type="button"
            className="people-refresh"
            onClick={loadUsers}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "people-spin"
                  : ""
              }
            />

            <span>Refresh</span>
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="people-state people-error">
            <div className="people-state-icon">
              !
            </div>

            <h3>
              Unable to load people
            </h3>

            <p>{error}</p>

            <button
              type="button"
              onClick={loadUsers}
            >
              Try again
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && !error && (
          <div className="people-state">
            <div className="people-loader" />

            <h3>
              Loading developers...
            </h3>

            <p>
              Finding people in the Devanta
              community.
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          filteredUsers.length === 0 && (
            <div className="people-state">
              <div className="people-state-icon">
                <Users size={28} />
              </div>

              <h3>
                No developers found
              </h3>

              <p>
                Try searching with another
                name or username.
              </p>
            </div>
          )}

        {/* USERS */}
        {!loading &&
          !error &&
          filteredUsers.length > 0 && (
            <section className="people-section">

              <div className="people-grid">

                {filteredUsers.map(
                  (user, index) => {
                    const userId =
                      getUserId(user);

                    const name =
                      getUserName(user);

                    const username =
                      getUsername(user);

                    const avatar =
                      getAvatar(user);

                    const bio =
                      getBio(user);

                    const initial =
                      getInitial(user);

                    return (
                      <Link
                        key={
                          userId ||
                          `${username}-${index}`
                        }
                        to={
                          userId
                            ? `/profile/${userId}`
                            : "/profile"
                        }
                        className="person-card"
                      >

                        {/* AVATAR */}
                        <div className="person-avatar">

                          {avatar ? (
                            <img
                              src={avatar}
                              alt={name}
                              onError={(event) => {
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

                        {/* CONTENT */}
                        <div className="person-card-copy">

                          <h3>
                            {name}
                          </h3>

                          <span className="person-username">
                            @{username}
                          </span>

                          <p>
                            {bio}
                          </p>

                        </div>

                        {/* ARROW */}
                        <div className="person-card-arrow">
                          <ArrowRight
                            size={19}
                          />
                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            </section>
          )}

      </div>
    </DiscoverLayout>
  );
}
