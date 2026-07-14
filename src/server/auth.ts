import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        if (!user.isApproved) {
          throw new Error("حسابك قيد المراجعة حالياً من قبل الإدارة");
        }

        if (user.role === "driver") {
          const driver = await prisma.driver.findUnique({ where: { userId: user.id } });
          if (driver) {
            if (driver.subscriptionStatus === "inactive" || driver.subscriptionStatus === "expired") {
              throw new Error("انتهت صلاحية اشتراكك الشهري. يرجى زيارة المكتب لتجديد الاشتراك وتفعيل الحساب.");
            }
            if (driver.subscriptionStatus === "active" && driver.subscriptionExpiry) {
              if (new Date() > driver.subscriptionExpiry) {
                await prisma.driver.update({
                  where: { id: driver.id },
                  data: { subscriptionStatus: "expired", isAvailable: false },
                });
                throw new Error("انتهت صلاحية اشتراكك الشهري. يرجى زيارة المكتب لتجديد الاشتراك وتفعيل الحساب.");
              }
            }
          }
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
};
