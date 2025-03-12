import NextAuth  from "next-auth/next";
import { authOptions } from "./options";

 const handlers = NextAuth(authOptions);

 export {handlers as GET, handlers as POST}