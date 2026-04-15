"use client";

import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import { useAuth } from "~/contexts/auth-context";

const UserDropdown = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const displayName = user.username ?? user.name ?? user.email;
  const image = user.image ?? user.avatarUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex cursor-pointer items-center gap-2">
          <Avatar className="h-8 w-8">
            {image && (
              <AvatarImage src={image} alt={displayName} width={32} height={32} />
            )}
            <AvatarFallback>{displayName?.at(0) ?? "U"}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">
            {displayName}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="font-semibold">{displayName}</span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/users/${user.id}`}>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>
        <Link href="/settings#dark-mode">
          <DropdownMenuItem>Dark mode</DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => void logout()}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
