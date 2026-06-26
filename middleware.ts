import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
    publicRoutes: ['/']
});

export const config = {
  // 🛠️ FIXED: Added the correct escape backslashes so Clerk ignores static assets perfectly
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};