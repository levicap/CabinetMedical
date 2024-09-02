 declare module "next-auth" {
  interface User {
   role:string | null
  }
  interface Session {
   user: User & defaultSession["user"]
  }
}