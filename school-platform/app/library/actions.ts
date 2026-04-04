"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import { Book } from "@/lib/models";
import { revalidatePath } from "next/cache";

export async function addBook(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isApproved) return { error: "Unauthorized" };

  const title = (formData.get("title") as string)?.trim();
  const author = (formData.get("author") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!title || !author) return { error: "Title and author are required." };

  await connectToDatabase();
  await Book.create({ title, author, description, addedBy: session.user.id });
  revalidatePath("/library/my-books");
}

export async function updateBook(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isApproved) return { error: "Unauthorized" };

  const bookId = formData.get("bookId") as string;
  const title = (formData.get("title") as string)?.trim();
  const author = (formData.get("author") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!bookId || !title || !author) return { error: "Missing fields." };

  await connectToDatabase();
  const book = await Book.findById(bookId);
  if (!book) return { error: "Book not found." };
  if (book.addedBy.toString() !== session.user.id) return { error: "Not authorized." };
  if (book.status === "lended") return { error: "Cannot edit a lended book." };

  await Book.findByIdAndUpdate(bookId, { title, author, description });
  revalidatePath("/library/my-books");
}

export async function borrowBook(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isApproved) return { error: "Unauthorized" };

  const bookId = formData.get("bookId") as string;
  const borrowerPhone = (formData.get("borrowerPhone") as string)?.trim();
  const borrowerAddress = (formData.get("borrowerAddress") as string)?.trim();
  const borrowerIdNumber = (formData.get("borrowerIdNumber") as string)?.trim();
  const returnDateRaw = formData.get("returnDate") as string;

  if (!bookId || !borrowerPhone || !borrowerAddress || !borrowerIdNumber) {
    return { error: "All fields are required." };
  }

  await connectToDatabase();
  const book = await Book.findById(bookId);
  if (!book) return { error: "Book not found." };
  if (book.status !== "available") return { error: "Book is not available." };
  if (book.addedBy.toString() === session.user.id) return { error: "You cannot borrow your own book." };

  await Book.findByIdAndUpdate(bookId, {
    status: "lended",
    borrowedBy: session.user.id,
    borrowerPhone,
    borrowerAddress,
    borrowerIdNumber,
    borrowDate: new Date(),
    returnDate: returnDateRaw ? new Date(returnDateRaw) : null,
  });

  revalidatePath("/library/borrow");
  revalidatePath("/library/subscriptions");
}

export async function deleteBook(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isApproved) return { error: "Unauthorized" };

  const bookId = formData.get("bookId") as string;
  if (!bookId) return { error: "Missing book ID." };

  await connectToDatabase();
  const book = await Book.findById(bookId);
  if (!book) return { error: "Book not found." };
  if (book.addedBy.toString() !== session.user.id) return { error: "Not authorized." };
  if (book.status === "lended") return { error: "Cannot delete a book that is currently lended." };

  await Book.findByIdAndDelete(bookId);
  revalidatePath("/library/my-books");
}

export async function returnBook(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.isApproved) return { error: "Unauthorized" };

  const bookId = formData.get("bookId") as string;
  if (!bookId) return { error: "Missing book ID." };

  await connectToDatabase();
  const book = await Book.findById(bookId);
  if (!book) return { error: "Book not found." };

  const isOwner = book.addedBy.toString() === session.user.id;
  const isBorrower = book.borrowedBy?.toString() === session.user.id;
  if (!isOwner && !isBorrower) return { error: "Not authorized." };

  await Book.findByIdAndUpdate(bookId, {
    status: "available",
    borrowedBy: null,
    borrowerPhone: "",
    borrowerAddress: "",
    borrowerIdNumber: "",
    borrowDate: null,
    returnDate: null,
  });

  revalidatePath("/library/my-books");
  revalidatePath("/library/subscriptions");
  revalidatePath("/library/borrow");
}
