// @acme/auth đã được đơn giản hóa — NextAuth đã bị xóa.
// Auth được xử lý bởi Spring Boot BE với JWT.

export interface Session {
  user: {
    id: string;
    email: string;
    username: string;
    name?: string;
    image?: string;
    avatarUrl?: string;
  };
  accessToken: string;
}

export type { Session as NextAuthSession };
