import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Book } from "@/lib/models";
import { BorrowClient } from "@/components/library/BorrowClient";

export const revalidate = 0;

export default async function BorrowPage() {
  const session = await getServerSession(authOptions);
  await connectToDatabase();

  // Books available that were NOT added by this user
  const books = await Book.find({
    status: "available",
    addedBy: { $ne: session!.user.id },
  })
    .populate("addedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  const serialized = books.map((b) => ({
    _id: b._id.toString(),
    title: b.title,
    author: b.author,
    description: b.description ?? "",
    addedByName: (b.addedBy as any)?.name ?? "Unknown",
    createdAt: new Date(b.createdAt as Date).toISOString(),
  }));

  return <BorrowClient books={serialized} />;
}
