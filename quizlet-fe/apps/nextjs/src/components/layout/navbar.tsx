"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@acme/ui/button";

import { useAuth } from "~/contexts/auth-context";
import CreateOptionsDropdown from "./create-options-dropdown";
import MobileMenu from "./mobile-menu";
import NotificationBell from "./notification-bell";
import SignInButton from "./sign-in-button";
import UserDropdown from "./user-dropdown";

const Navbar = () => {
  const { isLoggedIn, user } = useAuth();

  return (
    <div className="flex min-h-16 items-center justify-between border-b px-4">
      <div className="flex items-center">
        <MobileMenu />
        <Link
          href="/"
          className="hidden h-full px-2 leading-[4rem] md:flex md:items-center"
        >
          <Image src="/logo.svg" alt="logo" width={110} height={24} />
        </Link>
        <Link
          href={isLoggedIn ? "/latest" : "/"}
          className="mx-2 hidden md:inline"
        >
          <Button variant="link" className="text-foreground">
            Home
          </Button>
        </Link>
        {isLoggedIn && (
          <Link href="/classes" className="mx-1 hidden md:inline">
            <Button variant="link" className="text-foreground">
              Lớp học
            </Button>
          </Link>
        )}
        <CreateOptionsDropdown />
      </div>
      <div className="flex items-center gap-2">
        {isLoggedIn && user && <NotificationBell />}
        {isLoggedIn && user ? <UserDropdown /> : <SignInButton />}
      </div>
    </div>
  );
};

export default Navbar;
