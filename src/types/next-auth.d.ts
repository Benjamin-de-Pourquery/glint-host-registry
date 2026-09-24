import "next-auth";

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    passwordChangedAt?: number;
    sessionInvalidated?: boolean;
  }
}
