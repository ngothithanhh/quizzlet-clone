"use client";

import Link from "next/link";
import { BookMarked, BookOpen, Copy, Crown, Users } from "lucide-react";

import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";

interface ClassroomResponse {
  id: number;
  name?: string;
  description?: string;
  inviteCode: string;
  ownerId: number;
  memberCount?: number;
  assignments?: unknown[];
  isCreator?: boolean;
  currentUserRole?: "TEACHER" | "STUDENT" | null;
}

interface ClassCardProps {
  classroom: ClassroomResponse;
  onCopyCode?: (code: string) => void;
}

// Gradient palette based on class id
const GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-violet-500 to-fuchsia-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-600",
  "from-pink-500 to-purple-600",
];

export default function ClassCard({ classroom, onCopyCode }: ClassCardProps) {
  const displayName = (classroom.name ?? "").trim() || "Class";
  const initial = displayName.charAt(0).toUpperCase();
  const gradient = GRADIENTS[classroom.id % GRADIENTS.length];

  return (
    <div className="group relative flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:shadow-indigo-100/50 dark:hover:shadow-indigo-900/20 hover:-translate-y-1 transition-all duration-300">
      {/* Color Banner */}
      <div className={`h-24 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />

        {/* Class initial */}
        <div className="absolute bottom-3 left-4 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
          <span className="text-white text-xl font-black">{initial}</span>
        </div>

        {/* Role badge */}
        {(() => {
          if (classroom.isCreator) {
            return (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-100 bg-amber-900/40 backdrop-blur-sm border border-amber-400/30 px-2 py-0.5 rounded-full">
                  <Crown size={9} /> Chủ lớp
                </span>
              </div>
            );
          }
          if (classroom.currentUserRole === "TEACHER") {
            return (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-100 bg-blue-900/40 backdrop-blur-sm border border-blue-400/30 px-2 py-0.5 rounded-full">
                  <BookMarked size={9} /> Giáo viên
                </span>
              </div>
            );
          }
          return (
            <div className="absolute top-3 right-3">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-green-100 bg-green-900/40 backdrop-blur-sm border border-green-400/30 px-2 py-0.5 rounded-full">
                <Users size={9} /> Học sinh
              </span>
            </div>
          );
        })()}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {displayName}
        </h3>
        {classroom.description ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {classroom.description}
          </p>
        ) : (
          <div className="mb-3" />
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <Users size={11} className="text-indigo-400" />
            {classroom.memberCount ?? 0}
          </span>
          <span className="w-px h-3 bg-gray-200 dark:bg-gray-700" />
          <span className="flex items-center gap-1">
            <BookOpen size={11} className="text-purple-400" />
            Bài kiểm tra
          </span>
        </div>

        {/* Invite code row */}
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
          <code className="flex-1 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest truncate">
            {classroom.inviteCode}
          </code>
          <button
            onClick={(e) => { e.preventDefault(); onCopyCode?.(classroom.inviteCode); }}
            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-800/50 transition-colors text-indigo-400 hover:text-indigo-600"
            title="Sao chép mã mời"
          >
            <Copy size={11} />
          </button>
        </div>

        {/* CTA */}
        <Link
          href={`/classes/${classroom.id}`}
          className={`block text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${gradient} hover:opacity-90 active:scale-95 transition-all shadow-md`}
        >
          Vào lớp học →
        </Link>
      </div>
    </div>
  );
}
