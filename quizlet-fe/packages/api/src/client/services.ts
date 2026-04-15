/**
 * API Service Functions
 * Wrapper functions cho từng feature
 */

import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  setTokens,
  clearTokens,
} from "./http";
import { API_ENDPOINTS } from "./config";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  StudySetRequest,
  StudySetResponse,
  FlashcardRequest,
  FlashcardResponse,
  ClassroomRequest,
  ClassroomResponse,
  AssignmentRequest,
  AssignmentResponse,
  NotificationResponse,
  FolderRequest,
  FolderResponse,
  TranslateResponse,
  SpellCheckResponse,
  WikipediaResponse,
} from "./schemas";

// ===== Auth Services =====
export const authService = {
  async sendRegisterOtp(email: string) {
    const response = await apiPost<{ message: string }>(
      `${API_ENDPOINTS.AUTH.REGISTER_OTP}?email=${encodeURIComponent(email)}`
    );
    return response;
  },

  async register(data: RegisterRequest) {
    const response = await apiPost<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response;
  },

  async login(data: LoginRequest) {
    const response = await apiPost<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    if (response.success && response.data) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response;
  },

  async refreshToken(refreshToken: string) {
    const response = await apiPost<{ accessToken: string }>(
      `${API_ENDPOINTS.AUTH.REFRESH}?refreshToken=${encodeURIComponent(refreshToken)}`
    );
    if (response.success && response.data) {
      setTokens(response.data.accessToken);
    }
    return response;
  },

  async sendForgotPasswordOtp(email: string) {
    const response = await apiPost<{ message: string }>(
      `${API_ENDPOINTS.AUTH.FORGOT_PASSWORD_OTP}?email=${encodeURIComponent(email)}`
    );
    return response;
  },

  async resetPassword(email: string, otpCode: string, newPassword: string) {
    const response = await apiPost<{ message: string }>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD_RESET,
      { email, otpCode, newPassword }
    );
    return response;
  },

  async changePassword(oldPassword: string, newPassword: string) {
    const response = await apiPost<{ message: string }>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      { oldPassword, newPassword }
    );
    return response;
  },

  logout() {
    clearTokens();
  },
};

// ===== Study Set Services =====
export const studySetService = {
  async create(data: StudySetRequest) {
    return apiPost<StudySetResponse>(API_ENDPOINTS.STUDY_SETS.CREATE, data);
  },

  async getMyStudySets() {
    return apiGet<StudySetResponse[]>(API_ENDPOINTS.STUDY_SETS.GET_MY);
  },

  async getAll(keyword?: string) {
    const url = keyword
      ? `${API_ENDPOINTS.STUDY_SETS.GET_ALL}?keyword=${encodeURIComponent(keyword)}`
      : API_ENDPOINTS.STUDY_SETS.GET_ALL;
    return apiGet<StudySetResponse[]>(url);
  },

  async getById(id: number | string) {
    return apiGet<StudySetResponse>(API_ENDPOINTS.STUDY_SETS.GET_BY_ID(id));
  },

  async update(id: number | string, data: Partial<StudySetRequest>) {
    return apiPut<StudySetResponse>(
      API_ENDPOINTS.STUDY_SETS.UPDATE(id),
      data
    );
  },

  async delete(id: number | string) {
    return apiDelete(API_ENDPOINTS.STUDY_SETS.DELETE(id));
  },
};

// ===== Flashcard Services =====
export const flashcardService = {
  async create(data: FlashcardRequest) {
    return apiPost<FlashcardResponse>(API_ENDPOINTS.FLASHCARDS.CREATE, data);
  },

  async update(id: number | string, data: Partial<FlashcardRequest>) {
    return apiPut<FlashcardResponse>(
      API_ENDPOINTS.FLASHCARDS.UPDATE(id),
      data
    );
  },

  async delete(id: number | string) {
    return apiDelete(API_ENDPOINTS.FLASHCARDS.DELETE(id));
  },

  async getByStudySet(studySetId: number | string) {
    return apiGet<FlashcardResponse[]>(
      API_ENDPOINTS.FLASHCARDS.GET_BY_STUDY_SET(studySetId)
    );
  },

  async import(studySetId: number | string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<{ message: string }>(
      API_ENDPOINTS.FLASHCARDS.IMPORT(studySetId),
      formData
    );
  },

  async export(studySetId: number | string) {
    return apiGet<Blob>(
      API_ENDPOINTS.FLASHCARDS.EXPORT(studySetId)
    );
  },

  async clone(fromStudySetId: number, toStudySetId: number) {
    return apiPost<{ message: string }>(
      API_ENDPOINTS.FLASHCARDS.CLONE,
      { fromStudySetId, toStudySetId }
    );
  },

  async downloadTemplate() {
    return apiGet<Blob>(API_ENDPOINTS.FLASHCARDS.IMPORT_TEMPLATE);
  },
};

// ===== Folder Services =====
export const folderService = {
  async create(data: FolderRequest) {
    return apiPost<FolderResponse>(API_ENDPOINTS.FOLDERS.CREATE, data);
  },

  async getMyFolders() {
    return apiGet<FolderResponse[]>(API_ENDPOINTS.FOLDERS.GET_MY);
  },

  async update(id: number | string, data: Partial<FolderRequest>) {
    return apiPut<FolderResponse>(API_ENDPOINTS.FOLDERS.UPDATE(id), data);
  },

  async delete(id: number | string) {
    return apiDelete(API_ENDPOINTS.FOLDERS.DELETE(id));
  },

  async getStudySets(folderId: number | string) {
    return apiGet<StudySetResponse[]>(
      API_ENDPOINTS.FOLDERS.GET_STUDY_SETS(folderId)
    );
  },
};

// ===== Favorite Services =====
export const favoriteService = {
  async getMyFavorites() {
    return apiGet<Array<{ studySetId: number; studySet: StudySetResponse }>>(
      API_ENDPOINTS.FAVORITES.GET_MY
    );
  },

  async add(studySetId: number) {
    return apiPost<{ message: string }>(API_ENDPOINTS.FAVORITES.ADD, {
      studySetId,
    });
  },

  async remove(favoriteId: number | string) {
    return apiDelete(API_ENDPOINTS.FAVORITES.REMOVE(favoriteId));
  },
};

// ===== Classroom Services =====
export const classroomService = {
  async create(data: ClassroomRequest) {
    return apiPost<ClassroomResponse>(API_ENDPOINTS.CLASSROOMS.CREATE, data);
  },

  async getById(id: number | string) {
    return apiGet<ClassroomResponse>(API_ENDPOINTS.CLASSROOMS.GET_BY_ID(id));
  },

  async getMyClasses() {
    return apiGet<ClassroomResponse[]>(API_ENDPOINTS.CLASSROOMS.GET_MY);
  },

  async update(id: number | string, data: Partial<ClassroomRequest>) {
    return apiPut<ClassroomResponse>(
      API_ENDPOINTS.CLASSROOMS.UPDATE(id),
      data
    );
  },

  async delete(id: number | string) {
    return apiDelete(API_ENDPOINTS.CLASSROOMS.DELETE(id));
  },

  async join(inviteCode: string) {
    return apiPost<{ message: string }>(API_ENDPOINTS.CLASSROOMS.JOIN, {
      inviteCode,
    });
  },

  async leave(classId: number | string) {
    return apiPost<{ message: string }>(
      API_ENDPOINTS.CLASSROOMS.LEAVE(classId)
    );
  },

  async getMembers(classId: number | string) {
    return apiGet(API_ENDPOINTS.CLASSROOMS.GET_MEMBERS(classId));
  },

  async addMember(classId: number | string, email: string) {
    return apiPost<{ message: string }>(
      API_ENDPOINTS.CLASSROOMS.ADD_MEMBER(classId),
      { email }
    );
  },

  async removeMember(classId: number | string, userId: number | string) {
    return apiDelete(
      API_ENDPOINTS.CLASSROOMS.REMOVE_MEMBER(classId, userId)
    );
  },

  async updateMemberRole(
    classId: number | string,
    userId: number | string,
    newRole: "TEACHER" | "STUDENT"
  ) {
    return apiPut(
      `${API_ENDPOINTS.CLASSROOMS.UPDATE_MEMBER_ROLE(classId, userId)}?newRole=${newRole}`
    );
  },

  async regenerateInviteCode(classId: number | string) {
    return apiPost<{ inviteCode: string }>(
      API_ENDPOINTS.CLASSROOMS.REGENERATE_INVITE_CODE(classId)
    );
  },
};

// ===== Assignment Services =====
export const assignmentService = {
  async create(classId: number | string, data: AssignmentRequest) {
    return apiPost<AssignmentResponse>(
      API_ENDPOINTS.ASSIGNMENTS.CREATE(classId),
      data
    );
  },

  async getByClass(classId: number | string) {
    return apiGet<AssignmentResponse[]>(
      API_ENDPOINTS.ASSIGNMENTS.GET_BY_CLASS(classId)
    );
  },

  async submit(assignmentId: number | string, answers: Record<string, any>) {
    return apiPost<{ message: string }>(
      API_ENDPOINTS.ASSIGNMENTS.SUBMIT(assignmentId),
      { answers }
    );
  },

  async getMyResult(assignmentId: number | string) {
    return apiGet(API_ENDPOINTS.ASSIGNMENTS.GET_MY_RESULT(assignmentId));
  },

  async getSubmissions(assignmentId: number | string) {
    return apiGet(API_ENDPOINTS.ASSIGNMENTS.GET_SUBMISSIONS(assignmentId));
  },
};

// ===== Notification Services =====
export const notificationService = {
  async getMyNotifications() {
    return apiGet<NotificationResponse[]>(API_ENDPOINTS.NOTIFICATIONS.GET_MY);
  },

  async markAsRead(id: number | string) {
    return apiPut(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id));
  },

  async markAllAsRead() {
    return apiPut(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
  },

  async getUnreadCount() {
    return apiGet<{ count: number }>(
      API_ENDPOINTS.NOTIFICATIONS.GET_UNREAD_COUNT
    );
  },
};

// ===== External API Services =====
export const externalService = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<{ url: string }>(
      API_ENDPOINTS.EXTERNAL.UPLOAD_IMAGE,
      formData
    );
  },

  async uploadAudio(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<{ url: string }>(
      API_ENDPOINTS.EXTERNAL.UPLOAD_AUDIO,
      formData
    );
  },

  async getTts(text: string, lang: string = "en-US") {
    const url = `${API_ENDPOINTS.EXTERNAL.TTS}?text=${encodeURIComponent(text)}&lang=${lang}`;
    return apiGet<Blob>(url);
  },

  async translate(
    text: string,
    source: string = "en",
    target: string = "vi"
  ) {
    const url = `${API_ENDPOINTS.EXTERNAL.TRANSLATE}?text=${encodeURIComponent(text)}&source=${source}&target=${target}`;
    return apiGet<TranslateResponse>(url);
  },

  async spellCheck(text: string, language: string = "en-US") {
    return apiPost<SpellCheckResponse>(API_ENDPOINTS.EXTERNAL.SPELL_CHECK, {
      text,
      language,
    });
  },

  async getWikipediaSummary(keyword: string, lang: string = "en") {
    const url = `${API_ENDPOINTS.EXTERNAL.WIKIPEDIA}?keyword=${encodeURIComponent(keyword)}&lang=${lang}`;
    return apiGet<WikipediaResponse>(url);
  },
};

// Export all services
export default {
  auth: authService,
  studySets: studySetService,
  flashcards: flashcardService,
  folders: folderService,
  favorites: favoriteService,
  classrooms: classroomService,
  assignments: assignmentService,
  notifications: notificationService,
  external: externalService,
};

