"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@acme/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@acme/ui/sheet";

import { useAuth } from "~/contexts/auth-context";
import { useFolderDialogContext } from "~/contexts/folder-dialog-context";

const MobileMenu = () => {
  const { isLoggedIn } = useAuth();
  const [, dispatch] = useFolderDialogContext();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden" size="icon">
          <Menu size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader className="items-center">
          <Image src="/logo.svg" alt="logo" width={110} height={24} />
        </SheetHeader>
        <div className="flex flex-col py-4">
          <Link href={isLoggedIn ? "/latest" : "/"}>
            <Button variant="ghost" className="w-full justify-start">
              Home
            </Button>
          </Link>
          <span className="p-4 text-sm font-medium">Create</span>
          <div className="flex flex-col">
            <Link href="/create-set">
              <Button variant="ghost" className="ml-4 w-full justify-start">
                Study set
              </Button>
            </Link>
            <Button
              onClick={() => dispatch({ type: "open" })}
              variant="ghost"
              className="ml-4 w-full justify-start"
            >
              Folder
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
