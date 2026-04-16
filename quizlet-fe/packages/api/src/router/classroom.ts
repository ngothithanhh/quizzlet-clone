import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";

import { beDelete, beGet, bePost, bePut } from "../lib/beClient";
import { protectedProcedure, publicProcedure } from "../trpc";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClassMemberResponse {
  userId: number;
  username: string;
  email: string;
  avatarUrl?: string;
  role: "TEACHER" | "STUDENT" | "CREATOR" | "MEMBER";
  isCreator?: boolean;
  joinedAt?: string;
}

export interface AssignmentResponse {
  id: number;
  title: string;
  description?: string;
  studySetId?: number;
  studySetTitle?: string;
  classId?: number;
  className?: string;
  assignedById?: number;
  assignedByUsername?: string;
  dueDate?: string;
  createdAt?: string;
  questionsCount?: number;
  timeLimitMinutes?: number | null;
  allowReviewAnswers?: boolean;
  maxAttempts?: number | null;
}

export interface ClassroomResponse {
  id: number;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: number;
  ownerUsername?: string;
  memberCount?: number;
  members?: ClassMemberResponse[];
  assignments?: AssignmentResponse[];
  createdAt?: string;
  isCreator?: boolean;
  /** Role của user hiện tại: "TEACHER" | "STUDENT" | null */
  currentUserRole?: "TEACHER" | "STUDENT" | null;
}

export interface SubmissionResponse {
  id: number;
  assignmentId: number;
  assignmentTitle?: string;
  userId: number;
  username?: string;
  score: number;
  totalQuestions?: number;
  correctAnswers?: number;
  durationSeconds?: number;
  attemptNumber?: number;
  submittedAt?: string;
  completedAt?: string;
  status?: string;
  answersJson?: string;
  allowReviewAnswers?: boolean;
  answers?: Array<{ flashcardId: number; correct: boolean }>;
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const classroomRouter = {
  /** GET /api/classes/my */
  allMine: protectedProcedure.query(async ({ ctx }) => {
    const data = await beGet<ClassroomResponse[]>("/api/classes/my", ctx.token);
    return data ?? [];
  }),

  /** GET /api/classes/{id} */
  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return beGet<ClassroomResponse>(`/api/classes/${input.id}`, ctx.token);
    }),

  /** POST /api/classes */
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Backend returns: { classId: number, inviteCode: string }
      return bePost<{ classId: number; inviteCode: string }>("/api/classes", input, ctx.token);
    }),

  /** PUT /api/classes/{id} */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      return bePut<ClassroomResponse>(`/api/classes/${id}`, rest, ctx.token);
    }),

  /** DELETE /api/classes/{id} */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/classes/${input.id}`, ctx.token);
    }),

  /** POST /api/classes/join  { inviteCode } */
  join: protectedProcedure
    .input(z.object({ inviteCode: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      return bePost<ClassroomResponse>("/api/classes/join", { inviteCode: input.inviteCode }, ctx.token);
    }),

  /** POST /api/classes/{id}/leave */
  leave: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return bePost<void>(`/api/classes/${input.id}/leave`, undefined, ctx.token);
    }),

  /** POST /api/classes/{id}/invite-code */
  regenerateInviteCode: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return bePost<ClassroomResponse>(`/api/classes/${input.id}/invite-code`, undefined, ctx.token);
    }),

  /** GET /api/classes/{id}/members */
  members: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input, ctx }) => {
      const data = await beGet<ClassMemberResponse[]>(`/api/classes/${input.classId}/members`, ctx.token);
      return data ?? [];
    }),

  /** POST /api/classes/{id}/members  { userId } */
  addMember: protectedProcedure
    .input(z.object({ classId: z.number(), userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return bePost<void>(`/api/classes/${input.classId}/members`, { userId: input.userId }, ctx.token);
    }),

  /** DELETE /api/classes/{id}/members/{userId} */
  removeMember: protectedProcedure
    .input(z.object({ classId: z.number(), userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/classes/${input.classId}/members/${input.userId}`, ctx.token);
    }),

  /** PUT /api/classes/{id}/members/{userId}/role — only Creator */
  updateMemberRole: protectedProcedure
    .input(z.object({
      classId: z.number(),
      userId: z.number(),
      role: z.enum(["TEACHER", "STUDENT"]),
    }))
    .mutation(async ({ input, ctx }) => {
      return bePut<void>(
        `/api/classes/${input.classId}/members/${input.userId}/role?newRole=${input.role}`,
        {},
        ctx.token,
      );
    }),

  /** GET /api/classes/{id}/assignments */
  assignments: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input, ctx }) => {
      const data = await beGet<AssignmentResponse[]>(`/api/classes/${input.classId}/assignments`, ctx.token);
      return data ?? [];
    }),

  /** POST /api/classes/{id}/assignments */
  createAssignment: protectedProcedure
    .input(z.object({
      classId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      studySetId: z.number().optional(),
      dueDate: z.string().optional(),
      timeLimitMinutes: z.number().int().positive().optional(),
      allowReviewAnswers: z.boolean().optional(),
      maxAttempts: z.number().int().positive().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { classId, ...rest } = input;
      return bePost<AssignmentResponse>(`/api/classes/${classId}/assignments`, rest, ctx.token);
    }),

  /** PUT /api/classes/assignments/{id} */
  updateAssignment: protectedProcedure
    .input(z.object({
      assignmentId: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      studySetId: z.number().optional(),
      dueDate: z.string().optional(),
      timeLimitMinutes: z.number().int().positive().nullable().optional(),
      allowReviewAnswers: z.boolean().optional(),
      maxAttempts: z.number().int().positive().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { assignmentId, ...rest } = input;
      return bePut<AssignmentResponse>(`/api/classes/assignments/${assignmentId}`, rest, ctx.token);
    }),

  /** POST /api/classes/assignments/{id}/submit */
  submitAssignment: protectedProcedure
    .input(z.object({
      assignmentId: z.number(),
      score: z.number(),
      correctAnswers: z.number().optional(),
      totalQuestions: z.number().optional(),
      durationSeconds: z.number().optional(),
      answers: z.array(z.object({
        flashcardId: z.number(),
        term: z.string(),
        userAnswer: z.string(),
        correctAnswer: z.string(),
        isCorrect: z.boolean(),
      })).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { assignmentId, ...rest } = input;
      return bePost<{ message: string }>(`/api/classes/assignments/${assignmentId}/submit`, rest, ctx.token);
    }),

  /** GET /api/classes/assignments/{id} — assignment detail for student */
  assignmentById: protectedProcedure
    .input(z.object({ assignmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      return beGet<AssignmentResponse>(`/api/classes/assignments/${input.assignmentId}`, ctx.token);
    }),

  /** GET /api/classes/{id}/studysets */
  studySets: protectedProcedure
    .input(z.object({ classId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Need StudySetResponse type here, we can use any or fetch it from studySet router
      const data = await beGet<any[]>(`/api/classes/${input.classId}/studysets`, ctx.token);
      return data ?? [];
    }),

  /** POST /api/classes/{id}/studysets/{studySetId} */
  addStudySet: protectedProcedure
    .input(z.object({ classId: z.number(), studySetId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return bePost<void>(`/api/classes/${input.classId}/studysets/${input.studySetId}`, undefined, ctx.token);
    }),

  /** DELETE /api/classes/{id}/studysets/{studySetId} */
  removeStudySet: protectedProcedure
    .input(z.object({ classId: z.number(), studySetId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return beDelete(`/api/classes/${input.classId}/studysets/${input.studySetId}`, ctx.token);
    }),

  /** GET /api/classes/assignments/{id}/my-attempts — student's attempt history */
  myAttempts: protectedProcedure
    .input(z.object({ assignmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const data = await beGet<SubmissionResponse[]>(
        `/api/classes/assignments/${input.assignmentId}/my-attempts`,
        ctx.token,
      );
      return data ?? [];
    }),

  /** GET /api/classes/assignments/{id}/submissions  (teacher only) */
  submissions: protectedProcedure
    .input(z.object({ assignmentId: z.number() }))
    .query(async ({ input, ctx }) => {
      const data = await beGet<SubmissionResponse[]>(
        `/api/classes/assignments/${input.assignmentId}/submissions`,
        ctx.token,
      );
      return data ?? [];
    }),
} satisfies TRPCRouterRecord;
