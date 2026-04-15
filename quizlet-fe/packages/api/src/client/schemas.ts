/**
 * Zod Schemas for type-safe API validation
 * Matching backend DTOs
 */

import { z } from "zod";

// ===== Auth Schemas =====
export const LoginRequestSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export const RegisterRequestSchema = z.object({
  username: z.string().min(3, "Username phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  otpCode: z.string().min(4, "OTP phải có ít nhất 4 ký tự"),
});

export const ChangePasswordRequestSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().min(4),
  newPassword: z.string().min(6),
});

export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const RegisterResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  message: z.string(),
});

// ===== Study Set Schemas =====
export const StudySetRequestSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  description: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PRIVATE"),
});

export const StudySetResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  flashcards: z.array(z.any()).optional(),
  flashcardCount: z.number().optional(),
});

export const UpdateStudySetRequestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});

// ===== Flashcard Schemas =====
export const FlashcardRequestSchema = z.object({
  studySetId: z.number(),
  term: z.string().min(1, "Term không được để trống"),
  definition: z.string().min(1, "Definition không được để trống"),
  imageUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
});

export const FlashcardResponseSchema = z.object({
  id: z.number(),
  studySetId: z.number(),
  term: z.string(),
  definition: z.string(),
  imageUrl: z.string().nullable(),
  audioUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CloneFlashcardsRequestSchema = z.object({
  fromStudySetId: z.number(),
  toStudySetId: z.number(),
});

// ===== Folder Schemas =====
export const FolderRequestSchema = z.object({
  name: z.string().min(1, "Tên thư mục không được để trống"),
  description: z.string().optional(),
});

export const FolderResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  userId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// ===== Favorite Schemas =====
export const FavoriteRequestSchema = z.object({
  studySetId: z.number(),
});

export const FavoriteResponseSchema = z.object({
  id: z.number(),
  studySetId: z.number(),
  userId: z.number(),
  createdAt: z.string(),
});

// ===== Classroom Schemas =====
export const ClassroomRequestSchema = z.object({
  name: z.string().min(1, "Tên lớp không được để trống"),
  description: z.string().optional(),
  section: z.string().optional(),
});

export const ClassroomResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  section: z.string().nullable(),
  inviteCode: z.string(),
  teacherId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ClassMemberResponseSchema = z.object({
  userId: z.number(),
  classId: z.number(),
  role: z.enum(["TEACHER", "STUDENT"]),
  joinedAt: z.string(),
});

export const JoinClassroomRequestSchema = z.object({
  inviteCode: z.string().min(1, "Mã mời không được để trống"),
});

export const AddClassMemberRequestSchema = z.object({
  email: z.string().email(),
  role: z.enum(["TEACHER", "STUDENT"]).default("STUDENT"),
});

// ===== Assignment Schemas =====
export const AssignmentRequestSchema = z.object({
  classId: z.number(),
  title: z.string().min(1, "Tiêu đề bài kiểm tra không được để trống"),
  description: z.string().optional(),
  studySetId: z.number(),
  dueDate: z.string().datetime(),
  pointsPossible: z.number().positive().optional(),
});

export const AssignmentResponseSchema = z.object({
  id: z.number(),
  classId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  studySetId: z.number(),
  dueDate: z.string(),
  pointsPossible: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SubmitAssignmentRequestSchema = z.object({
  answers: z.record(z.union([z.string(), z.number()])),
  submittedAt: z.string().datetime().optional(),
});

export const SubmissionResponseSchema = z.object({
  id: z.number(),
  assignmentId: z.number(),
  userId: z.number(),
  score: z.number().nullable(),
  submittedAt: z.string(),
  createdAt: z.string(),
});

export const AssignmentResultResponseSchema = z.object({
  assignmentId: z.number(),
  userId: z.number(),
  score: z.number().nullable(),
  totalPoints: z.number().nullable(),
  submittedAt: z.string().nullable(),
  status: z.enum(["NOT_SUBMITTED", "SUBMITTED", "GRADED"]),
});

// ===== Study Session Schemas =====
export const StudySessionRequestSchema = z.object({
  studySetId: z.number(),
  mode: z.enum(["LEARN", "FLASHCARDS", "TEST"]),
});

export const StudySessionResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  studySetId: z.number(),
  mode: z.enum(["LEARN", "FLASHCARDS", "TEST"]),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  score: z.number().nullable(),
});

// ===== Notification Schemas =====
export const NotificationResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  type: z.enum([
    "ASSIGNMENT_CREATED",
    "ASSIGNMENT_OVERDUE",
    "CLASS_JOINED",
    "SUBMISSION_GRADED",
  ]),
  title: z.string(),
  message: z.string(),
  relatedId: z.number().nullable(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

// ===== External API Schemas =====
export const TranslateRequestSchema = z.object({
  text: z.string().min(1),
  source: z.string().default("en"),
  target: z.string().default("vi"),
});

export const TranslateResponseSchema = z.object({
  original: z.string(),
  translated: z.string(),
});

export const SpellCheckRequestSchema = z.object({
  text: z.string().min(1),
  language: z.string().default("en-US"),
});

export const SpellCheckResponseSchema = z.object({
  text: z.string(),
  errors: z.array(
    z.object({
      message: z.string(),
      offset: z.number(),
      length: z.number(),
      suggestions: z.array(z.string()),
    })
  ),
});

export const WikipediaResponseSchema = z.object({
  keyword: z.string(),
  summary: z.string(),
});

export const UploadResponseSchema = z.object({
  url: z.string(),
});

// Export types
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

export type StudySetRequest = z.infer<typeof StudySetRequestSchema>;
export type StudySetResponse = z.infer<typeof StudySetResponseSchema>;

export type FlashcardRequest = z.infer<typeof FlashcardRequestSchema>;
export type FlashcardResponse = z.infer<typeof FlashcardResponseSchema>;

export type FolderRequest = z.infer<typeof FolderRequestSchema>;
export type FolderResponse = z.infer<typeof FolderResponseSchema>;

export type ClassroomRequest = z.infer<typeof ClassroomRequestSchema>;
export type ClassroomResponse = z.infer<typeof ClassroomResponseSchema>;
export type ClassMemberResponse = z.infer<typeof ClassMemberResponseSchema>;

export type AssignmentRequest = z.infer<typeof AssignmentRequestSchema>;
export type AssignmentResponse = z.infer<typeof AssignmentResponseSchema>;
export type SubmitAssignmentRequest = z.infer<typeof SubmitAssignmentRequestSchema>;
export type SubmissionResponse = z.infer<typeof SubmissionResponseSchema>;

export type NotificationResponse = z.infer<typeof NotificationResponseSchema>;
export type TranslateResponse = z.infer<typeof TranslateResponseSchema>;
export type SpellCheckResponse = z.infer<typeof SpellCheckResponseSchema>;
export type WikipediaResponse = z.infer<typeof WikipediaResponseSchema>;

