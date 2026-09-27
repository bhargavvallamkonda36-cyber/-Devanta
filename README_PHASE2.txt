DEVANTA PHASE 2

Files included:

src/pages/ArticleDetail.jsx
src/styles/ArticleDetail.css
src/pages/Bookmarks.jsx
src/styles/Bookmarks.css
src/components/DevantaSidebar.jsx
src/components/DevantaSidebar.css
App.jsx

Backend social.py already matches the frontend routes and does not need to be replaced.

Social API used:
GET    /posts/{slug}/social
POST   /posts/{slug}/like
DELETE /posts/{slug}/like
POST   /posts/{slug}/bookmark
DELETE /posts/{slug}/bookmark
GET    /posts/{slug}/comments
POST   /posts/{slug}/comments
GET    /posts/bookmarks/mine

Important:
- Article detail is public.
- Like/bookmark/comment require JWT.
- Bookmarks page requires JWT.
- Article links use slug, not post ID.
