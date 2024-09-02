import NextAuth from "next-auth"
import google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/db"
import { saltAndHashPassword } from "./app/crypt";
import Credentials from "next-auth/providers/credentials";
import { getUserFromDb } from "@/actions/actions";
import { redirect } from "next/navigation";
import { imageConfigDefault } from "next/dist/shared/lib/image-config";



 
export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },

   
   

    providers: [google, Credentials({
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        let user = null
 
        // logic to salt and hash password
        const pwHash = saltAndHashPassword(credentials.password)
 
        // logic to verify if the user exists
        user = await getUserFromDb(credentials.email, pwHash)
 
        if (!user) {
          // No user found, so this is their first attempt to login
          // meaning this is also the place you could do registration
          throw new Error("User not found.")
        }
        console.log("User in authorize:", user);
        

        // return user object with their profile data

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image
        };
    }})],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.name = user.name;
          token.email = user.email;
          token.role = user.role;
          token.image = user.image;
        }
        return token;
      },
      async session({ session, token }) {
        if (token) {
          session.user = {
            id: token.id,
            name: token.name,
            email: token.email,
            role: token.role,
            image: token.image,
          };
  
          // Fetch the patient record if the user is a patient
          if (token.role === "patient") {
            const patient = await db.patient.findUnique({
              where: { userId: token.id },
            });
  
            if (patient) {
              session.user.patientId = patient.id;
              session.user.telephone = patient.telephone;
            }
          }
        } else {
          console.error("Token is undefined in session callback");
        }
  
        return session;
      },
    },
    
    pages: {
      signIn: "/auth",
    },
    
   
     
})