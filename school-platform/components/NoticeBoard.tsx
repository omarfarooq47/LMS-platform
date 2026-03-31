"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Notice {
  _id: string;
  title: string;
  content: string;
  author?: { name: string };
  createdAt: string;
}

interface NoticeBoardProps {
  initialNotices: Notice[];
  isStaff: boolean;
}

export default function NoticeBoard({ initialNotices, isStaff }: NoticeBoardProps) {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      const newNotice: Notice = await res.json();
      setNotices((prev) => [newNotice, ...prev]);
      setTitle("");
      setContent("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Failed to post notice. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card rounded-3xl p-8 shadow-sm border border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-4">
          <span className="bg-amber-100 text-amber-600 p-3 rounded-xl shadow-inner">📌</span>
          Notice Board
        </h2>
        {isStaff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger
              render={
                <Button variant="default" size="sm" className="gap-1.5">
                  + Add Notice
                </Button>
              }
            />
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Post a New Notice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="notice-title">Title</Label>
                  <Input
                    id="notice-title"
                    placeholder="Notice title…"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="notice-content">Content</Label>
                  <Textarea
                    id="notice-content"
                    placeholder="Write the notice here…"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    required
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <DialogFooter showCloseButton>
                  <Button type="submit" variant="default" disabled={loading}>
                    {loading ? "Posting…" : "Post Notice"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* List */}
      <div className="space-y-5">
        {notices.length === 0 ? (
          <p className="text-muted-foreground text-center italic py-8 bg-muted rounded-2xl">
            No notices available at the moment.
          </p>
        ) : (
          notices.map((notice) => (
            <div
              key={notice._id}
              className="p-6 rounded-2xl bg-muted border border-border hover:shadow-md hover:bg-card transition-all"
            >
              <h3 className="font-bold text-xl text-foreground mb-2">{notice.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{notice.content}</p>
              <div className="text-xs font-semibold text-muted-foreground mt-5 flex justify-between items-center bg-muted/50 p-2 rounded-lg">
                <span className="text-indigo-600">By {notice.author?.name}</span>
                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
