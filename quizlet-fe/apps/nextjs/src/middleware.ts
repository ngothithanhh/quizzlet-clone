// Middleware disabled - NextAuth uses Node.js crypto which is not supported in Edge Runtime
// Auth will be handled client-side only for now
// TODO: Re-enable when auth is configured for edge runtime

// export { auth as middleware } from "@acme/auth";

export const config = {
  matcher: [
    // Exclude all internal Next.js files and APIs
    "/((?!api|_next/static|_next/image|favicon.ico|_next).*)",
  ],
};

// Empty middleware - will be replaced with auth when edge-compatible
export default function middleware() {
  // Placeholder - auth disabled in edge runtime
}

