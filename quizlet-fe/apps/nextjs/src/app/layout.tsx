import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { cn } from "@acme/ui";
import { ThemeProvider } from "@acme/ui/theme";
import { Toaster } from "@acme/ui/toast";

import { TRPCReactProvider } from "~/trpc/react";

import "~/app/globals.css";

import { AuthProvider } from "~/contexts/auth-context";
import CreateActivity from "~/components/layout/create-activity";
import CreateFolderDialog from "~/components/layout/create-folder-dialog";
import Navbar from "~/components/layout/navbar";
import SignInDialog from "~/components/layout/sign-in-dialog";
import LoginDialog from "~/components/layout/login-dialog";
import LoginFormDialog from "~/components/layout/login-form-dialog";
import FolderDialogProvider from "~/contexts/folder-dialog-context";
import SignInDialogProvider from "~/contexts/sign-in-dialog-context";
import { LoginDialogProvider } from "~/contexts/login-dialog-context";
import WebSocketProvider from "~/components/shared/websocket-provider";
import { env } from "~/env";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.NODE_ENV === "production"
      ? "https://turbo.t3.gg"
      : "http://localhost:3000",
  ),
  title: "Quizzlet",
  description: "Quizzlet application",
  openGraph: {
    title: "Quizzlet",
    description: "Quizzlet application",
    url: "https://create-t3-turbo.vercel.app",
    siteName: "Quizzlet",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          GeistSans.variable,
          GeistMono.variable,
        )}
      >
        <AuthProvider>
          <SignInDialogProvider>
            <LoginDialogProvider>
              <FolderDialogProvider>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                  <TRPCReactProvider>
                    <Navbar />
                    <main className="min-h-[calc(100vh-65px)]">
                      {props.children}
                    </main>
                    <WebSocketProvider />
                    <Toaster richColors />
                    <CreateActivity />
                    <CreateFolderDialog />
                    <SignInDialog />
                    <LoginDialog>
                      <LoginFormDialog />
                    </LoginDialog>
                  </TRPCReactProvider>
                </ThemeProvider>
              </FolderDialogProvider>
            </LoginDialogProvider>
          </SignInDialogProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
