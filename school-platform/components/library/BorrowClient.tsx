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
import { borrowBook } from "@/app/library/actions";
import { BookCopy, User, Calendar, Loader2 } from "lucide-react";

export type AvailableBook = {
  _id: string;
  title: string;
  author: string;
  description: string;
  addedByName: string;
  createdAt: string;
};

export function BorrowClient({ books }: { books: AvailableBook[] }) {
  const [selected, setSelected] = useState<AvailableBook | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openConfirm(book: AvailableBook) {
    setSelected(book);
    setConfirmOpen(true);
    setError(null);
  }

  function handleBorrow(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const fd = new FormData(e.currentTarget);
    fd.set("bookId", selected._id);
    setError(null);
    startTransition(async () => {
      const res = await borrowBook(fd);
      if (res?.error) {
        setError(res.error);
      } else {
        setConfirmOpen(false);
        setSelected(null);
      }
    });
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Borrow a Book</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Browse available books and borrow one from the community.
            </p>
          </div>
          <span className="bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full border border-border">
            {books.length} available
          </span>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <BookCopy className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold text-muted-foreground">No books available right now</p>
            <p className="text-sm text-muted-foreground mt-1">
              Check back later or add your own books in My Books.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="flex-1">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                    <BookCopy className="size-5" />
                  </div>
                  <h3 className="font-bold text-foreground text-base leading-tight mb-0.5">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">by {book.author}</p>
                  {book.description && (
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>
                  )}
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="size-3" />
                    <span>{book.addedByName}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => openConfirm(book)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  >
                    Borrow
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Borrow Modal */}
      <Dialog open={confirmOpen} onOpenChange={(open) => !open && setConfirmOpen(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Borrow</DialogTitle>
            <DialogDescription>
              You are borrowing <strong>{selected?.title}</strong> by {selected?.author}. Please provide your
              contact details to proceed.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBorrow} className="space-y-3 mt-1">
            <div className="space-y-1.5">
              <Label htmlFor="borrowerPhone">Phone Number</Label>
              <Input
                id="borrowerPhone"
                name="borrowerPhone"
                placeholder="+92 300 1234567"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="borrowerAddress">Address</Label>
              <Textarea
                id="borrowerAddress"
                name="borrowerAddress"
                placeholder="Your full address..."
                required
                disabled={isPending}
                className="min-h-18"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="borrowerIdNumber">ID Number</Label>
              <Input
                id="borrowerIdNumber"
                name="borrowerIdNumber"
                placeholder="e.g. 34201-123478-3"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="returnDate" className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                Expected Return Date
                <span className="text-muted-foreground font-normal text-xs">(optional)</span>
              </Label>
              <Input
                id="returnDate"
                name="returnDate"
                type="date"
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
                onClick={() => setConfirmOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Confirming…
                  </>
                ) : (
                  "Confirm Borrow"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
