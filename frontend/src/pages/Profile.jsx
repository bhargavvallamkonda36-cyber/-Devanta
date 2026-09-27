import React, {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  Heart,
  MessageCircle,
  PenLine,
  UserRound,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import DevantaSidebar from "../components/DevantaSidebar";

import { API_URL } from "../config";

import "../styles/Profile.css";


/* =====================================================
   HELPERS
===================================================== */

function getInitial(name) {
  return (
    name?.trim()?.charAt(0)?.toUpperCase() ||
    "D"
  );
}


function getName(user) {
  return (
    user?.name ||
    user?.username ||
    user?.full_name ||
    "Devanta User"
  );
}


function getAvatar(user) {
  return (
    user?.avatar_url ||
    user?.avatarUrl ||
    user?.profile_image ||
    user?.profileImage ||
    null
  );
}


function getBio(user) {
  return (
    user?.bio ||
    user?.about ||
    user?.description ||
    "Developer and member of the Devanta community."
  );
}

function handleUnauthorized(response, navigate) {
  if (response?.status === 401) {
    localStorage.removeItem("devanta_token");
    localStorage.removeItem("devanta_username");
    navigate("/login", { replace: true });
    return true;
  }
  return false;
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


function getLikes(post) {
  return Number(
    post?.likes_count ??
      post?.like_count ??
      post?.likes ??
      0
  );
}


function getComments(post) {
  return Number(
    post?.comments_count ??
      post?.comment_count ??
      post?.comments ??
      0
  );
}


/* =====================================================
   PROFILE
===================================================== */

export default function Profile() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  /* ===================================================
     LOAD PROFILE
  =================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem(
            "devanta_token"
          );

        /*
         * /profile
         * -> current logged-in user
         *
         * /profile/:id
         * -> selected user
         */

        if (!id && !token) {
          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }

        const url = id
          ? `${API_URL}/users/${id}`
          : `${API_URL}/users/me`;

        const headers = {
          Accept: "application/json",
        };

        if (token) {
          headers.Authorization =
            `Bearer ${token}`;
        }

        const response = await fetch(
          url,
          {
            method: "GET",
            headers,
          }
        );

        if (!response.ok) {
          if (response.status === 401 && !id) {
            localStorage.removeItem("devanta_token");
            localStorage.removeItem("devanta_username");
            navigate("/login", { replace: true });
            return;
          }

          let message =
            "Unable to load profile.";

          try {
            const data =
              await response.json();

            if (
              typeof data?.detail ===
              "string"
            ) {
              message = data.detail;
            }
          } catch {
            // Ignore invalid JSON
          }

          throw new Error(message);
        }

        const data =
          await response.json();

        if (cancelled) {
          return;
        }

        /*
         * Backend can return:
         *
         * {
         *   user: {...},
         *   posts: [...]
         * }
         *
         * or directly:
         *
         * {...}
         */

        const profileUser =
          data?.user || data;

        const profilePosts =
          Array.isArray(data?.posts)
            ? data.posts
            : [];

        setUser(profileUser);

        setPosts(profilePosts);

      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Profile loading error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load profile."
        );

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);


  /* ===================================================
     USER INFORMATION
  =================================================== */

  const username =
    getName(user);

  const loggedUsername =
    localStorage.getItem(
      "devanta_username"
    ) || username;

  const loggedInitial =
    getInitial(loggedUsername);


  /* ===================================================
     TOTALS
  =================================================== */

  const totalLikes =
    posts.reduce(
      (sum, post) =>
        sum + getLikes(post),
      0
    );

  const totalComments =
    posts.reduce(
      (sum, post) =>
        sum + getComments(post),
      0
    );


  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="profile-layout">

      {/* SIDEBAR */}

      <DevantaSidebar />


      {/* MAIN */}

      <main className="profile-main">

        {/* =============================================
            TOP HEADER
        ============================================= */}

        <header className="profile-top-header">

          <span className="profile-top-label">
            DEVANTA COMMUNITY
          </span>


          <div className="profile-top-actions">

            <Link
              to="/write"
              className="profile-top-write"
            >
              <PenLine size={17} />
              <span>Write</span>
            </Link>


            <Link
              to="/profile"
              className="profile-top-user"
            >
              <span className="profile-top-avatar">
                {loggedInitial}
              </span>

              <strong>
                {loggedUsername}
              </strong>
            </Link>

          </div>

        </header>


        {/* =============================================
            LOADING
        ============================================= */}

        {loading && (
          <section className="profile-state-section">

            <div className="profile-state">

              <div className="profile-loader" />

              <h2>
                Loading profile...
              </h2>

              <p>
                Fetching developer information.
              </p>

            </div>

          </section>
        )}


        {/* =============================================
            ERROR
        ============================================= */}

        {!loading && error && (
          <section className="profile-state-section">

            <div className="profile-state">

              <div className="profile-state-icon">
                <UserRound
                  size={28}
                />
              </div>

              <h2>
                Unable to load profile
              </h2>

              <p>
                {error}
              </p>

              <div className="profile-state-actions">

                <button
                  type="button"
                  className="profile-secondary-button"
                  onClick={() =>
                    navigate(-1)
                  }
                >
                  <ArrowLeft
                    size={17}
                  />

                  Back
                </button>


                <Link
                  to="/people"
                  className="profile-primary-button"
                >
                  Back to People
                </Link>

              </div>

            </div>

          </section>
        )}


        {/* =============================================
            PROFILE
        ============================================= */}

        {!loading &&
          !error &&
          user && (
            <section className="profile-page">

              {/* PROFILE HERO */}

              <div className="profile-hero">

                <div className="profile-cover" />


                <div className="profile-hero-content">

                  {/* AVATAR */}

                  <div className="profile-avatar">

                    {getAvatar(user) ? (
                      <img
                        src={getAvatar(user)}
                        alt={username}
                        onError={(event) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      getInitial(username)
                    )}

                  </div>


                  {/* INFORMATION */}

                  <div className="profile-main-info">

                    <div className="profile-name-row">

                      <div>

                        <span className="profile-eyebrow">
                          DEVELOPER PROFILE
                        </span>


                        <h1>
                          {username}
                        </h1>


                        {user?.username && (
                          <p className="profile-handle">
                            @{user.username}
                          </p>
                        )}

                      </div>


                      {!id && (
                        <Link
                          to="/settings"
                          className="profile-edit-button"
                        >
                          Edit profile
                        </Link>
                      )}

                    </div>


                    <p className="profile-bio">
                      {getBio(user)}
                    </p>


                    <div className="profile-meta">

                      <span>
                        <CalendarDays
                          size={15}
                        />

                        Devanta member
                      </span>


                      {user?.created_at && (
                        <span>
                          Joined{" "}
                          {formatDate(
                            user.created_at
                          )}
                        </span>
                      )}

                    </div>

                  </div>

                </div>

              </div>


              {/* =======================================
                  STATS
              ======================================= */}

              <div className="profile-stats">

                <div className="profile-stat">

                  <strong>
                    {posts.length}
                  </strong>

                  <span>
                    Articles
                  </span>

                </div>


                <div className="profile-stat">

                  <strong>
                    {totalLikes}
                  </strong>

                  <span>
                    Likes
                  </span>

                </div>


                <div className="profile-stat">

                  <strong>
                    {totalComments}
                  </strong>

                  <span>
                    Comments
                  </span>

                </div>

              </div>


              {/* =======================================
                  ARTICLES
              ======================================= */}

              <section className="profile-articles-section">

                <div className="profile-section-heading">

                  <div>

                    <span className="profile-section-eyebrow">
                      PUBLISHED WORK
                    </span>


                    <h2>
                      {id
                        ? `${username}'s articles`
                        : "Your articles"}
                    </h2>


                    <p>
                      Developer stories,
                      tutorials, projects,
                      and ideas published
                      on Devanta.
                    </p>

                  </div>


                  {!id && (
                    <Link
                      to="/write"
                      className="profile-write-button"
                    >
                      <PenLine
                        size={17}
                      />

                      Write article
                    </Link>
                  )}

                </div>


                {/* EMPTY */}

                {posts.length === 0 ? (
                  <div className="profile-empty">

                    <div className="profile-empty-icon">
                      <FileText
                        size={28}
                      />
                    </div>


                    <h3>
                      No published articles yet
                    </h3>


                    <p>
                      {id
                        ? "This developer has not published any articles yet."
                        : "Start writing and publish your first article on Devanta."}
                    </p>


                    {!id && (
                      <Link
                        to="/write"
                        className="profile-primary-button"
                      >
                        Start writing

                        <ArrowRight
                          size={17}
                        />
                      </Link>
                    )}

                  </div>
                ) : (

                  /* ARTICLES GRID */

                  <div className="profile-article-grid">

                    {posts.map(
                      (post) => {

                        const slug =
                          post?.slug;

                        const cover =
                          post?.cover_image ||
                          post?.coverImage ||
                          null;

                        const likes =
                          getLikes(post);

                        const comments =
                          getComments(post);

                        return (
                          <article
                            key={
                              post?.id ||
                              slug
                            }
                            className="profile-article-card"
                          >

                            {/* COVER */}

                            <Link
                              to={`/post/${slug}`}
                              className="profile-article-cover"
                            >

                              {cover ? (
                                <img
                                  src={cover}
                                  alt={
                                    post?.title ||
                                    "Devanta article"
                                  }
                                />
                              ) : (
                                <div className="profile-article-placeholder">
                                  D
                                </div>
                              )}

                            </Link>


                            {/* BODY */}

                            <div className="profile-article-body">

                              <div className="profile-article-date">

                                <CalendarDays
                                  size={14}
                                />

                                {formatDate(
                                  post?.created_at ||
                                  post?.createdAt
                                )}

                              </div>


                              <Link
                                to={`/post/${slug}`}
                                className="profile-article-title"
                              >
                                {post?.title ||
                                  "Untitled article"}
                              </Link>


                              <p className="profile-article-excerpt">
                                {post?.excerpt ||
                                  "Read this developer story on Devanta."}
                              </p>


                              <div className="profile-article-footer">

                                <div className="profile-article-stats">

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


                                <Link
                                  to={`/post/${slug}`}
                                  className="profile-read-button"
                                >
                                  Read

                                  <ArrowRight
                                    size={15}
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

              </section>

            </section>
          )}

      </main>

    </div>
  );
}
