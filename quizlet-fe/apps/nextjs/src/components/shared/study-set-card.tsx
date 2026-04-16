import Link from "next/link";

import type { RouterOutputs } from "@acme/api";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { Card, CardContent } from "@acme/ui/card";

const StudySetCard = ({
  studySet,
}: {
  studySet: RouterOutputs["studySet"]["other"][number];
}) => {
  const { id, title, flashcardCount, user } = studySet;

  return (
    <Card className="group relative overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <Link
        href={`/study-sets/${id}`}
        className="absolute left-0 top-0 h-full w-full"
      ></Link>
      <CardContent className="relative p-6 z-10 flex flex-col h-full pointer-events-none">
        <h3 className="mb-3 text-lg font-bold text-card-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {title}
        </h3>
        <Badge variant="secondary" className="mb-4 w-fit bg-indigo-100/50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-none font-medium">
          {flashcardCount} Terms
        </Badge>
        <Link
          href={`/users/${user.id}`}
          className="mt-auto pt-6 inline-flex items-center hover:opacity-80 transition-opacity w-fit pointer-events-auto"
        >
          <Avatar className="mr-3 h-7 w-7 ring-2 ring-background shadow-sm">
            <AvatarImage src={user.image ?? undefined} alt="author avatar" />
            <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-400 to-purple-400 text-white font-semibold">U</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {user.name}
          </span>
        </Link>
      </CardContent>
    </Card>
  );
};

export default StudySetCard;
