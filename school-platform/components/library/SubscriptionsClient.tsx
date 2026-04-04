"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Calendar, Phone, MapPin, IdCard } from "lucide-react";

export type SubscriptionItem = {
  _id: string;
  title: string;
  author: string;
  description: string;
  perspective: "borrowed" | "lended";
  otherPartyName: string;
  borrowerPhone: string;
  borrowerAddress: string;
  borrowerIdNumber: string;
  borrowDate: string | null;
  returnDate: string | null;
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SubscriptionsClient({ items }: { items: SubscriptionItem[] }) {
  const [selected, setSelected] = useState<SubscriptionItem | null>(null);

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Current Subscriptions</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Books you are currently borrowing or have lent to others.
            </p>
          </div>
          <span className="bg-muted text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full border border-border">
            {items.length} active
          </span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-border bg-card">
            <BookMarked className="size-12 text-muted-foreground mx-auto mb-4 opacity-40" />
            <p className="text-lg font-semibold text-muted-foreground">No active subscriptions</p>
            <p className="text-sm text-muted-foreground mt-1">
              Borrow a book or lend one to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <button
                key={item._id}
                onClick={() => setSelected(item)}
                className="w-full text-left bg-card border border-border rounded-2xl p-5 hover:shadow-md hover:border-primary/40 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={item.perspective === "borrowed" ? "default" : "secondary"}
                        className={
                          item.perspective === "borrowed"
                            ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                            : "bg-emerald-100 text-emerald-700 border-emerald-200"
                        }
                      >
                        {item.perspective === "borrowed" ? "Borrowed" : "Lended"}
                      </Badge>
                    </div>
                    <p className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-muted-foreground">by {item.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.perspective === "borrowed"
                        ? `From: ${item.otherPartyName}`
                        : `To: ${item.otherPartyName}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Calendar className="size-3" />
                      <span>Borrowed: {fmt(item.borrowDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                      <Calendar className="size-3" />
                      <span>Return: {fmt(item.returnDate)}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{selected?.title}</DialogTitle>
            <DialogDescription>by {selected?.author}</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 mt-1">
              {selected.description && (
                <p className="text-sm text-muted-foreground bg-muted rounded-xl px-4 py-3 leading-relaxed">
                  {selected.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/60 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                  <Badge
                    className={
                      selected.perspective === "borrowed"
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                    }
                  >
                    {selected.perspective === "borrowed" ? "Borrowed" : "Lended"}
                  </Badge>
                </div>
                <div className="bg-muted/60 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    {selected.perspective === "borrowed" ? "Lent by" : "Borrowed by"}
                  </p>
                  <p className="text-sm font-semibold text-foreground">{selected.otherPartyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/60 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                    <Calendar className="size-3" /> Borrow Date
                  </p>
                  <p className="text-sm font-semibold text-foreground">{fmt(selected.borrowDate)}</p>
                </div>
                <div className="bg-muted/60 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                    <Calendar className="size-3" /> Return Date
                  </p>
                  <p className="text-sm font-semibold text-foreground">{fmt(selected.returnDate)}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                  Borrower Details
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{selected.borrowerPhone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{selected.borrowerAddress || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <IdCard className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-foreground font-mono">{selected.borrowerIdNumber || "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
