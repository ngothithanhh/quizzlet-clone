import Link from "next/link";

import type { Session } from "@acme/auth";
import { signOut } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

const UserDropdown = ({ user }: { user: Session["user"] }) => {
  const { id, image, name, email } = user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar className="h-8 w-8">
            {image && (
              <AvatarImage
                src={image}
                alt={name ?? "user avatar"}
                width={32}
                height={32}
              />
            )}
            <AvatarFallback>{name?.at(0) ?? "U"}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium truncate max-w-[120px]">
            {name || email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="flex flex-col gap-1">
          <span className="font-semibold">{name || "User"}</span>
          <span className="text-xs text-gray-500">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={`/users/${id}`}>
          <DropdownMenuItem>Profile</DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>
        <Link href="/settings#dark-mode">
          <DropdownMenuItem>Dark mode</DropdownMenuItem>
        </Link>
        <form>
          <DropdownMenuItem asChild>
            <button
              className="w-full"
              formAction={async () => {
                "use server";
                await signOut();
              }}
            >
              Sign out
            </button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild></DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
