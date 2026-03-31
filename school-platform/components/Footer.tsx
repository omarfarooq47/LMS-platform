import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-xl mb-4">
            <BookOpen className="h-6 w-6 text-emerald-500" />
            <span>OakTree</span>
          </Link>
          <p className="text-sm text-slate-400">
            A modern, highly aesthetic educational platform designed for a superior learning experience.
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
            <li><Link href="/courses" className="hover:text-emerald-400 transition-colors">Courses</Link></li>
            <li><Link href="/news" className="hover:text-emerald-400 transition-colors">News</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4">Policies</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-emerald-400 transition-colors">Contact Info</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-700 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} OakTree Education. All rights reserved.
      </div>
    </footer>
  );
}
