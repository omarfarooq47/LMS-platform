"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { addBook, updateBook, returnBook, deleteBook } from "@/app/library/actions";
import { Library, Plus, Calendar, Phone, MapPin, IdCard, Loader2, RotateCcw, Trash2 } from "lucide-react";

export type MyBook = {
  _id: string;
  title: string;
  author: string;
  description: string;
  status: "available" | "lended";
  borrowedByName: string | null;
  borrowerPhone: string;
  borrowerAddress: string;
  borrowerIdNumber: string;
  borrowDate: string | null;
  returnDate: string | null;
  createdAt: string;
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MyBooksClient({ books: initialBooks }: { books: MyBook[] }) {
  const [books, setBooks] = useState<MyBook[]>(initialBooks);
  const [addOpen, setAddOpen] = useState(false);
  const [editBook, setEditBook] = useState<MyBook | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // ── Add Book ──────────────────────────────────────────────────
  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await addBook(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setAddOpen(false);
        // Refresh is handled by revalidatePath + RSC; force a window reload as fallback
        window.location.reload();
      }
    });
  }

  // ── Edit Book ──────────────────────────────────────────────────
  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editBook) return;
    const fd = new FormData(e.currentTarget);
    fd.set("bookId", editBook._id);
    setError(null);
    startTransition(async () => {
      const res = await updateBook(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setEditBook(null);
        window.location.reload();
      }
    });
  }

  // ── Return Book ──────────────────────────────────────────────────
  function handleReturn(book: MyBook) {
    const fd = new FormData();
    fd.set("bookId", book._id);
    setError(null);
    startTransition(async () => {
      const res = await returnBook(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        window.location.reload();
      }
    });
  }

  // ── Delete Book ──────────────────────────────────────────────────
  function handleDelete(book: MyBook) {
    const fd = new FormData();
    fd.set("bookId", book._id);
    setError(null);
    startTransition(async () => {
      const res = await deleteBook(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setEditBook(null);
        window.location.reload();
      }
    });
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Books</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Books you have added to the library.
            </p>
          </div>
          <Button
            size="default"
            onClick={() => { setAddOpen(true); setError(null); }}
            className="gap-2"
          >
            <Plus className="size-4" />
            Add Book
          </Button>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <Library className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold text-muted-foreground">No books added yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click <strong>Add Book</strong> to contribute to the library.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <div
                key={book._id}
                className={`bg-card border border-border rounded-2xl p-5 transition-all ${
                  book.status === "lended"
                    ? "opacity-60"
                    : "hover:shadow-md hover:border-primary/30 cursor-pointer"
                }`}
                onClick={() => {
                  if (book.status !== "lended") {
                    setEditBook(book);
                    setError(null);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={
                          book.status === "available"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                            : "bg-amber-100 text-amber-700 border-amber-200"
                        }
                      >
                        {book.status === "available" ? "Available" : "Lended"}
                      </Badge>
                    </div>
                    <p className="font-bold text-foreground text-base">{book.title}</p>
                    <p className="text-sm text-muted-foreground mb-1">by {book.author}</p>
                    {book.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{book.description}</p>
                    )}
                    {book.status === "lended" && book.borrowedByName && (
                      <p className="text-xs text-amber-600 font-medium mt-1">
                        Borrowed by {book.borrowedByName}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <div className="text-right space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Added {fmt(book.createdAt)}
                      </p>
                      {book.status === "lended" && (
                        <>
                          <p className="text-xs text-muted-foreground">
                            Borrowed {fmt(book.borrowDate)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Return {fmt(book.returnDate)}
                          </p>
                        </>
                      )}
                    </div>
                    {book.status === "lended" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        disabled={isPending}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReturn(book);
                        }}
                      >
                        {isPending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3" />
                        )}
                        Mark Returned
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      <Dialog open={addOpen} onOpenChange={(open) => !open && setAddOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add a Book</DialogTitle>
            <DialogDescription>
              Contribute a book to the OakTree community library.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAdd} className="space-y-3 mt-1">
            <div className="space-y-1.5">
              <Label htmlFor="add-title">Title</Label>
              <Input
                id="add-title"
                name="title"
                placeholder="Book title"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-author">Author</Label>
              <Input
                id="add-author"
                name="author"
                placeholder="Author name"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="add-description">
                Description
                <span className="text-muted-foreground font-normal text-xs ml-1">(optional)</span>
              </Label>
              <Textarea
                id="add-description"
                name="description"
                placeholder="A short description..."
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Add Book"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Book Modal */}
      <Dialog open={!!editBook} onOpenChange={(open) => !open && setEditBook(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>Update the details for this book.</DialogDescription>
          </DialogHeader>

          {editBook && (
            <form onSubmit={handleEdit} className="space-y-3 mt-1">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editBook.title}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-author">Author</Label>
                <Input
                  id="edit-author"
                  name="author"
                  defaultValue={editBook.author}
                  required
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editBook.description}
                  disabled={isPending}
                />
              </div>

              <div className="bg-muted/60 rounded-xl p-3 space-y-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Book Info
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3" /> Added {fmt(editBook.createdAt)}
                </p>
                {editBook.status === "lended" && (
                  <>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="size-3" /> {editBook.borrowerPhone || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="size-3" /> {editBook.borrowerAddress || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <IdCard className="size-3" />
                      <span className="font-mono">{editBook.borrowerIdNumber || "—"}</span>
                    </p>
                  </>
                )}
              </div>

              {error && (
                <p className="text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="destructive"
                  className="mr-auto"
                  onClick={() => handleDelete(editBook)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditBook(null)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
