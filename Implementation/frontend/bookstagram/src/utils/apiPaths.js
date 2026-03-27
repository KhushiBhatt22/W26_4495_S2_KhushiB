export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GOOGLE: "/api/auth/google",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },
  BOOKS: {
    CREATE_BOOK: "/api/books",
    GET_BOOKS: "/api/books", // own books only
    GET_ALL_PUBLIC: "/api/books/explore", // ALL books — for Explore page
    GET_BOOK_BY_ID: "/api/books", // owner only — for editor
    GET_BOOK_PUBLIC: "/api/books/public", // any user can read — for view page
    UPDATE_BOOK: "/api/books",
    DELETE_BOOK: "/api/books",
    UPDATE_COVER: "/api/books/cover",
  },
  AI: {
    GENERATE_OUTLINE: "/api/ai/generate-outline",
    GENERATE_CHAPTER_CONTENT: "/api/ai/generate-chapter-content",
    COMPLETE_CHAPTER_CONTENT: "/api/ai/complete-chapter-content",
    GENERATE_STORY_IMAGE: "/api/ai/generate-story-image",
    GENERATE_AVATAR: "/api/ai/generate-avatar",
  },
  EXPORT: {
    PDF: "/api/export",
    DOC: "/api/export",
  },
  SOCIAL: {
    GET_USER_PROFILE: "/api/social/profile",
    FOLLOW: "/api/social/follow",
    UNFOLLOW: "/api/social/follow",
    FOLLOW_STATUS: "/api/social/follow-status",
    LIKE: "/api/social/like",
    UNLIKE: "/api/social/like",
    SUGGESTED: "/api/social/suggested",
    FEED: "/api/social/feed",    // books from followed users only
    GET_FOLLOWERS: "/api/social/followers",  // Followers lists
    GET_FOLLOWING: "/api/social/following",  // Followning lists
  },
  STORIES: {
    GET_STORIES: "/api/story",
    CREATE_STORY: "/api/story",
  },

  THREADS: {
    GET_THREADS: "/api/threads",
    CREATE_THREAD: "/api/threads",
    LIKE_THREAD: "/api/threads", // + /:id/like
    ADD_COMMENT: "/api/threads", // + /:id/comment
    DELETE_THREAD: "/api/threads", // + /:id (DELETE)
    IMPROVE_THREAD: "/api/ai/improve-thread",
  },
  ANALYTICS: {
    DASHBOARD: "/api/analytics/dashboard",
  },
};
