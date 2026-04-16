"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Plus, Search, User, UserPlus } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";

interface AddMemberDialogProps {
  classId: number;
}

export default function AddMemberDialog({ classId }: AddMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchedQuery, setSearchedQuery] = useState("");
  const utils = api.useUtils();

  // Search users query
  const { data: results = [], isFetching } = api.user.search.useQuery(
    { query: searchedQuery },
    { enabled: searchedQuery.length > 0 },
  );

  // Existing members list to prevent re-adding
  const { data: members = [] } = api.classroom.members.useQuery({ classId });

  // Add member mutation
  const addMutation = api.classroom.addMember.useMutation({
    onSuccess: () => {
      void utils.classroom.members.invalidate({ classId });
      toast.success("Đã thêm thành viên!");
    },
    onError: (err) => toast.error(err.message ?? "Lỗi thêm thành viên"),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedQuery(query.trim());
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:border-indigo-800 dark:text-indigo-300 dark:bg-indigo-900/30">
          <UserPlus size={14} />
          Mời người
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <UserPlus size={20} className="text-indigo-600" />
            </div>
            <div>
              <DialogTitle>Mời thành viên</DialogTitle>
              <DialogDescription>
                Tìm kiếm theo Tên đăng nhập hoặc Email
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Nhập email hoặc tên..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              type="submit"
              disabled={!query.trim() || isFetching}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Tìm
            </Button>
          </form>

          {/* Results list */}
          <div className="min-h-[150px] max-h-60 overflow-y-auto border rounded-xl p-2 bg-gray-50/50 dark:bg-gray-900/30">
            {!searchedQuery ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 opacity-60">
                <Search size={28} className="mb-2" />
                <p className="text-xs">Gõ gì đó để tìm kiếm người học</p>
              </div>
            ) : isFetching ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-indigo-500" />
              </div>
            ) : results.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Không tìm thấy kết quả nào.
              </div>
            ) : (
              <div className="space-y-1.5">
                {results.map((u) => {
                  const isMember = members.some((m) => m.userId === u.id);
                  const isPending = addMutation.isPending && addMutation.variables?.userId === u.id;

                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={u.avatarUrl} alt={u.username} />
                          <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
                            {u.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {u.username}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate">
                            {u.email}
                          </span>
                        </div>
                      </div>

                      {isMember ? (
                        <div className="flex items-center gap-1 min-w-fit pr-2 text-xs text-green-600 dark:text-green-500 font-medium">
                          <CheckCircle2 size={14} /> Đoán tham gia
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addMutation.mutate({ classId, userId: u.id })}
                          disabled={isPending}
                          className="h-8 gap-1 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 bg-gray-50"
                        >
                          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                          Thêm
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
