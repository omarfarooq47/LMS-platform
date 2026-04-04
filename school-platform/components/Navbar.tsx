// @ts-nocheck
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, LogOut, ChevronDown, PlusCircle, CheckCircle, Sun, Moon, Monitor } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 text-foreground backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground text-xl">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <span>OakTree</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/news" className="hover:text-emerald-600 transition-colors">News</Link>
            <Link href="/courses" className="hover:text-emerald-600 transition-colors">Courses</Link>
            <Link href="/skills" className="hover:text-emerald-600 transition-colors">Skill Paths</Link>
            {session?.user?.isApproved && (
              <Link href="/library" className="hover:text-emerald-600 transition-colors">Library</Link>
            )}
            <Link href="/about" className="hover:text-emerald-600 transition-colors">About</Link>
            <Link href="/checkin" className="hover:text-emerald-600 transition-colors">CheckIn</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.isApproved && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-blue-300 bg-grey hover:bg-muted h-10 px-4 py-2 outline">
                    <PlusCircle className="h-4 w-4 text-indigo-600" /> Create <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-popover border-border shadow-md mt-2 p-1">
                    <DropdownMenuItem className="cursor-pointer p-0"><Link href="/course/create" className="w-full block px-2 py-1.5 focus:bg-muted outline-none rounded-sm">Create Course</Link></DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer p-0"><Link href="/news/create" className="w-full block px-2 py-1.5 focus:bg-muted outline-none rounded-sm">Create News</Link></DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer p-0"><Link href="/skills/create" className="w-full block px-2 py-1.5 focus:bg-muted outline-none rounded-sm">Create Skill Path</Link></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none border-none bg-transparent">
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-emerald-200 transition-transform hover:scale-105">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-900">{session.user?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover p-1">
                  <div className="flex flex-col px-3 py-2 text-sm border-b border-border mb-1 bg-muted">
                    <span className="font-semibold text-foreground truncate">{session.user?.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{session.user?.email}</span>
                  </div>
                  {session.user?.role === 'staff' && session.user?.isApproved && (
                    <DropdownMenuItem className="cursor-pointer p-0">
                      <Link href="/staff/approvals" className="w-full block px-2 py-1.5 focus:bg-muted outline-none rounded-sm">Staff Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 border-t border-border" />
                  <div className="px-2 py-1 text-xs text-muted-foreground font-medium uppercase tracking-wide">Theme</div>
                  <DropdownMenuItem className="cursor-pointer px-2 py-1.5 outline-none focus:bg-muted rounded-sm gap-2" onClick={() => setTheme("light")}>
                    <Sun className="h-4 w-4" /> Light {mounted && theme === "light" && <CheckCircle className="h-3.5 w-3.5 ml-auto text-emerald-500" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-2 py-1.5 outline-none focus:bg-muted rounded-sm gap-2" onClick={() => setTheme("dark")}>
                    <Moon className="h-4 w-4" /> Dark {mounted && theme === "dark" && <CheckCircle className="h-3.5 w-3.5 ml-auto text-emerald-500" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer px-2 py-1.5 outline-none focus:bg-muted rounded-sm gap-2" onClick={() => setTheme("system")}>
                    <Monitor className="h-4 w-4" /> System {mounted && theme === "system" && <CheckCircle className="h-3.5 w-3.5 ml-auto text-emerald-500" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 border-t border-border" />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer px-2 py-1.5 outline-none focus:bg-red-50 rounded-sm" onClick={() => signOut()}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={() => signIn()} className="bg-indigo-900 hover:bg-indigo-800 text-white shadow-md transition-all hover:shadow-lg">
              Sign In / Test Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
