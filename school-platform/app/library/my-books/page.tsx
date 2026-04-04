import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Book } from "@/lib/models";
import { MyBooksClient } from "@/components/library/MyBooksClient";

export const revalidate = 0;

export default async function MyBooksPage() {
  const session = await getServerSession(authOptions);
  await connectToDatabase();

  const books = await Book.find({ addedBy: session!.user.id })
    .populate("borrowedBy", "name")
    .sort({ createdAt: -1 })
    .lean();

  const serialized = books.map((b) => ({
    _id: b._id.toString(),
    title: b.title,
    author: b.author,
    description: b.description ?? "",
    status: b.status as "available" | "lended",
    borrowedByName: (b.borrowedBy as any)?.name ?? null,
    borrowerPhone: b.borrowerPhone ?? "",
    borrowerAddress: b.borrowerAddress ?? "",
    borrowerIdNumber: b.borrowerIdNumber ?? "",
    borrowDate: b.borrowDate ? new Date(b.borrowDate as Date).toISOString() : null,
    returnDate: b.returnDate ? new Date(b.returnDate as Date).toISOString() : null,
    createdAt: new Date(b.createdAt as Date).toISOString(),
  }));

  return <MyBooksClient books={serialized} />;
}
