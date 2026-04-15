import { activityRouter } from "./router/activity";
import { authRouter } from "./router/auth";
import { classroomRouter } from "./router/classroom";
import { externalApiRouter } from "./router/externalApi";
import { favoriteRouter } from "./router/favorite";
import { flashcardRouter } from "./router/flashcard";
import { folderRouter } from "./router/folder";
import { notificationRouter } from "./router/notification";
import { starredFlashcardRouter } from "./router/starredFlashcard";
import { studySessionRouter } from "./router/studySession";
import { studySetRouter } from "./router/studySet";
import { userRouter } from "./router/user";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  studySet: studySetRouter,
  user: userRouter,
  folder: folderRouter,
  flashcard: flashcardRouter,
  favorite: favoriteRouter,
  favorite: favoriteRouter,
  starredFlashcard: starredFlashcardRouter,
  activity: activityRouter,
  classroom: classroomRouter,
  notification: notificationRouter,
  studySession: studySessionRouter,
  externalApi: externalApiRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
