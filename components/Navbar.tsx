// @ts-nocheck
"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, LogOut, ChevronDown, PlusCircle, CheckCircle } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-slate-50/80 text-indigo-950 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-indigo-900 text-xl">
            <BookOpen className="h-6 w-6 text-emerald-600" />
            <span>OakTree</span>
          </Link>
          <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-700">
            <Link href="/news" className="hover:text-emerald-600 transition-colors">News</Link>
            <Link href="/courses" className="hover:text-emerald-600 transition-colors">Courses</Link>
            <Link href="/skills" className="hover:text-emerald-600 transition-colors">Skill Paths</Link>
            <Link href="/about" className="hover:text-emerald-600 transition-colors">About</Link>
            <Link href="/checkin" className="hover:text-emerald-600 transition-colors">CheckIn</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              {session.user?.isApproved && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-slate-200 bg-white hover:bg-slate-100 h-10 px-4 py-2 outline-none">
                    <PlusCircle className="h-4 w-4 text-indigo-600" /> Create <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-white border shadow-md mt-2">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href='/course/create'}>Create Course</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href='/news/create'}>Create News</DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href='/skills/create'}>Create Skill Path</DropdownMenuItem>
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
                <DropdownMenuContent align="end" className="w-48 bg-white">
                  <div className="flex flex-col px-3 py-2 text-sm border-b mb-1 bg-slate-50">
                    <span className="font-semibold text-indigo-900 truncate">{session.user?.name}</span>
                    <span className="text-xs text-slate-500 truncate">{session.user?.email}</span>
                  </div>
                  {session.user?.role === 'staff' && session.user?.isApproved && (
                    <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href='/staff/approvals'}>
                      Staff Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer" onClick={() => signOut()}>
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
