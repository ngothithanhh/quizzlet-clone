/**
 * API Client Configuration
 * Cấu hình kết nối với backend Quizzz (Spring Boot)
 */

// Backend base URL - thay đổi theo environment
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/quizzlet-clone";

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER_OTP: "/api/auth/register/otp",
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    REFRESH: "/api/auth/refresh",
    FORGOT_PASSWORD_OTP: "/api/auth/forgot-password/otp",
    FORGOT_PASSWORD_RESET: "/api/auth/forgot-password/reset",
    CHANGE_PASSWORD: "/api/auth/change-password",
  },

  // Study Sets
  STUDY_SETS: {
    CREATE: "/api/studysets",
    GET_MY: "/api/studysets/me",
    GET_ALL: "/api/studysets",
    GET_BY_ID: (id: string | number) => `/api/studysets/${id}`,
    UPDATE: (id: string | number) => `/api/studysets/${id}`,
    DELETE: (id: string | number) => `/api/studysets/${id}`,
  },

  // Flashcards
  FLASHCARDS: {
    CREATE: "/api/flashcards",
    UPDATE: (id: string | number) => `/api/flashcards/${id}`,
    DELETE: (id: string | number) => `/api/flashcards/${id}`,
    GET_BY_STUDY_SET: (studySetId: string | number) =>
      `/api/studysets/${studySetId}/flashcards`,
    IMPORT: (studySetId: string | number) =>
      `/api/studysets/${studySetId}/flashcards/import`,
    EXPORT: (studySetId: string | number) =>
      `/api/studysets/${studySetId}/flashcards/export`,
    CLONE: "/api/flashcards/clone",
    IMPORT_TEMPLATE: "/api/flashcards/import/template",
  },

  // Folders
  FOLDERS: {
    CREATE: "/api/folders",
    GET_MY: "/api/folders/me",
    UPDATE: (id: string | number) => `/api/folders/${id}`,
    DELETE: (id: string | number) => `/api/folders/${id}`,
    GET_STUDY_SETS: (id: string | number) => `/api/folders/${id}/studysets`,
  },

  // Favorites
  FAVORITES: {
    GET_MY: "/api/favorites/me",
    ADD: "/api/favorites",
    REMOVE: (id: string | number) => `/api/favorites/${id}`,
  },

  // Classrooms
  CLASSROOMS: {
    CREATE: "/api/classes",
    GET_BY_ID: (id: string | number) => `/api/classes/${id}`,
    GET_MY: "/api/classes/my",
    UPDATE: (id: string | number) => `/api/classes/${id}`,
    DELETE: (id: string | number) => `/api/classes/${id}`,
    JOIN: "/api/classes/join",
    LEAVE: (id: string | number) => `/api/classes/${id}/leave`,
    GET_MEMBERS: (id: string | number) => `/api/classes/${id}/members`,
    ADD_MEMBER: (id: string | number) => `/api/classes/${id}/members`,
    REMOVE_MEMBER: (id: string | number, userId: string | number) =>
      `/api/classes/${id}/members/${userId}`,
    UPDATE_MEMBER_ROLE: (id: string | number, userId: string | number) =>
      `/api/classes/${id}/members/${userId}/role`,
    REGENERATE_INVITE_CODE: (id: string | number) =>
      `/api/classes/${id}/invite-code`,
  },

  // Assignments
  ASSIGNMENTS: {
    CREATE: (classId: string | number) => `/api/classes/${classId}/assignments`,
    GET_BY_CLASS: (classId: string | number) =>
      `/api/classes/${classId}/assignments`,
    SUBMIT: (id: string | number) => `/api/classes/assignments/${id}/submit`,
    GET_MY_RESULT: (id: string | number) =>
      `/api/classes/assignments/${id}/my-result`,
    GET_SUBMISSIONS: (id: string | number) =>
      `/api/classes/assignments/${id}/submissions`,
  },

  // Study Sessions
  STUDY_SESSIONS: {
    CREATE: "/api/study-sessions",
    GET_MY: "/api/study-sessions/me",
    GET_BY_ID: (id: string | number) => `/api/study-sessions/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    GET_MY: "/api/notifications",
    MARK_AS_READ: (id: string | number) => `/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: "/api/notifications/read-all",
    GET_UNREAD_COUNT: "/api/notifications/unread-count",
  },

  // External APIs
  EXTERNAL: {
    UPLOAD_IMAGE: "/api/external/upload/image",
    UPLOAD_AUDIO: "/api/external/upload/audio",
    TTS: "/api/external/tts",
    TRANSLATE: "/api/external/translate",
    SPELL_CHECK: "/api/external/spellcheck",
    WIKIPEDIA: "/api/external/wikipedia",
  },

  // User
  USER: {
    GET_PROFILE: "/api/users/profile",
    UPDATE_PROFILE: "/api/users/profile",
  },
};

// HTTP Methods
export enum HTTP_METHOD {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

// Error codes
export enum ERROR_CODE {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  BAD_REQUEST = 400,
  INTERNAL_SERVER_ERROR = 500,
  NETWORK_ERROR = 0,
}

