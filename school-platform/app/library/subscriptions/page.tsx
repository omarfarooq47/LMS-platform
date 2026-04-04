import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Book } from "@/lib/models";
import { SubscriptionsClient } from "@/components/library/SubscriptionsClient";

export const revalidate = 0;

export default async function SubscriptionsPage() {
  const session = await getServerSession(authOptions);
  await connectToDatabase();

  // Books I've borrowed
  const borrowed = await Book.find({
    borrowedBy: session!.user.id,
    status: "lended",
  })
    .populate("addedBy", "name")
    .lean();

  // Books I've lent (I added them, someone borrowed)
  const lended = await Book.find({
    addedBy: session!.user.id,
    status: "lended",
  })
    .populate("borrowedBy", "name")
    .lean();

  const serialize = (books: any[], perspective: "borrowed" | "lended") =>
    books.map((b) => ({
      _id: b._id.toString(),
      title: b.title,
      author: b.author,
      description: b.description ?? "",
      perspective,
      otherPartyName:
        perspective === "borrowed"
          ? (b.addedBy as any)?.name ?? "Unknown"
          : (b.borrowedBy as any)?.name ?? "Unknown",
      borrowerPhone: b.borrowerPhone ?? "",
      borrowerAddress: b.borrowerAddress ?? "",
      borrowerIdNumber: b.borrowerIdNumber ?? "",
      borrowDate: b.borrowDate ? new Date(b.borrowDate).toISOString() : null,
      returnDate: b.returnDate ? new Date(b.returnDate).toISOString() : null,
    }));

  const items = [
    ...serialize(borrowed, "borrowed"),
    ...serialize(lended, "lended"),
  ];

  return <SubscriptionsClient items={items} />;
}
