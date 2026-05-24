"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      nickname: form.get("nickname"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Credenziali non valide");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070A0D] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-[#C9A75F] text-3xl font-bold tracking-[0.3em] uppercase mb-1">
            LUXY
          </h1>
          <p className="text-[#A6A29A] text-xs tracking-[0.2em] uppercase">
            Experience — Gestionale
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#151A24] border border-[#2A3040] rounded-xl p-8 shadow-2xl">
          <h2 className="text-[#F4F0E6] text-lg font-semibold mb-6">Accedi</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                Nickname
              </label>
              <input
                name="nickname"
                type="text"
                required
                autoComplete="username"
                className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors"
                placeholder="Il tuo nickname"
              />
            </div>

            <div>
              <label className="block text-[#A6A29A] text-xs uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-[#10141C] border border-[#2A3040] rounded-lg px-4 py-2.5 text-[#F4F0E6] text-sm placeholder-[#A6A29A] focus:border-[#C9A75F] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-[#D95D5D] text-sm bg-[#D95D5D]/10 border border-[#D95D5D]/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A75F] hover:bg-[#E0C27A] disabled:opacity-50 disabled:cursor-not-allowed text-[#070A0D] font-semibold rounded-lg px-4 py-2.5 text-sm tracking-wide transition-colors mt-2"
            >
              {loading ? "Accesso in corso..." : "Accedi"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
