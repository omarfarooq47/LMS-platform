import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LibrarySidebar } from "@/components/library/LibrarySidebar";

export const metadata = {
  title: "Library — OakTree",
  description: "Borrow and lend books in the OakTree community library.",
};

export default async function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.isApproved) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
          📚 Library
        </h1>
        <p className="text-muted-foreground mt-2 text-base">
          Borrow, lend, and manage books within the OakTree community.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <LibrarySidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
