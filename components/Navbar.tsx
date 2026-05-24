"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  return (
    <header className="border-b border-[#2A3040] bg-[#10141C] sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-[#C9A75F] text-xl font-bold tracking-widest uppercase select-none">
            LUXY
          </span>
          <span className="hidden sm:block text-[#A6A29A] text-xs tracking-[0.25em] uppercase mt-0.5">
            Experience
          </span>
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-[#A6A29A]">
            <User className="w-4 h-4" />
            <span>{user?.name}</span>
            {user?.role && (
              <span className="text-[#C9A75F] text-xs uppercase tracking-wider">
                {user.role}
              </span>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 text-sm text-[#A6A29A] hover:text-[#D95D5D] transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Esci</span>
          </button>
        </div>
      </div>
    </header>
  );
}
