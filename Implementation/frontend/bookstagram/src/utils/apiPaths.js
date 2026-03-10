export const BASE_URL = "http://localhost:8000";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GOOGLE: "/api/auth/google",
    GET_PROFILE: "/api/auth/profile",
    UPDATE_PROFILE: "/api/auth/profile",
  },
  BOOKS: {
    CREATE_BOOK: "/api/books",
    GET_BOOKS: "/api/books",
    GET_BOOK_BY_ID: "/api/books",
    UPDATE_BOOK: "/api/books",
    DELETE_BOOK: "/api/books",
    UPDATE_COVER: "/api/books/cover",
  },
  AI: {
    GENERATE_OUTLINE: "/api/ai/generate-outline",
    GENERATE_CHAPTER_CONTENT: "/api/ai/generate-chapter-content",
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
  },
  STORIES: {
  GET_STORIES: "/api/stories",
  CREATE_STORY: "/api/stories",
}
};