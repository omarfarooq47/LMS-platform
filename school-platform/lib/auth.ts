import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/lib/mongodb";
import { User } from "@/lib/models";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: "Test Account",
      credentials: {
        email: { label: "Email (Any)", type: "email", placeholder: "staff@test.com" },
        password: { label: "Password (Any)", type: "password", placeholder: "anything" }
      },
      async authorize(credentials) {
        await connectToDatabase();
        if (!credentials?.email) return null;
        
        // Auto-create an approved staff user for testing
        let dbUser = await User.findOne({ email: credentials.email });
        if (!dbUser) {
          dbUser = await User.create({
            name: "Test User",
            email: credentials.email,
            image: `https://ui-avatars.com/api/?name=${credentials.email}&background=random`,
            isApproved: true,
            role: 'staff',
            parentPhone: '555-555-5555'
          });
        }
        
        return {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          image: dbUser.image,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        await connectToDatabase();
        let dbUser = await User.findOne({ email: user.email });
        
        if (!dbUser) {
          // Create new user initially unapproved without role
          dbUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            isApproved: false,
          });
          return '/onboarding';
        }

        // If user already exists but hasn't completed onboarding
        if (!dbUser.role) {
          return '/onboarding';
        }

        return true;
      }
      return true;
    },
    async session({ session }) {
      await connectToDatabase();
      if (session.user?.email) {
        const dbUser = await User.findOne({ email: session.user.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.role = dbUser.role;
          session.user.isApproved = dbUser.isApproved;
        }
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  }
};
