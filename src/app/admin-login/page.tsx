"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, KeyRound } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { supabase, getFriendlyErrorMessage } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, initializeData, profiles } = useAppStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username !== "admin" || password !== "taskforcezero@2026") {
      setError("Invalid admin credentials");
      return;
    }

    setError("");
    setLoading(true);

    const isMock = useAppStore.getState().isMockMode;
    const phone = "0788888888";
    const adminUsername = "Taskforce_Zero_Manager";
    const email = `${phone}@taskforcezero.com`;
    const authPassword = "password123";

    if (isMock) {
      const mockAdmin = profiles.find((p) => p.role === "admin") || {
        id: "admin-1",
        username: adminUsername,
        phone_number: phone,
        role: "admin",
        status: "active",
        tasks_completed: 0,
        success_rate: 100,
        total_earnings: 0,
        created_at: new Date().toISOString()
      };
      setAuth({ id: mockAdmin.id, phone: mockAdmin.phone_number }, mockAdmin);
      router.push("/admin");
      return;
    }

    try {
      // Real Supabase Auth Flow
      let authUser = null;

      // 1. Try to sign in
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: authPassword,
      });

      if (signInErr && (signInErr.message.includes("Invalid login credentials") || signInErr.message.includes("Email not confirmed"))) {
        console.log("Admin user not found in Supabase Auth, creating now...");
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password: authPassword,
          options: {
            data: {
              username: adminUsername,
              phone_number: phone,
              role: "admin",
            },
          },
        });

        if (signUpErr) throw signUpErr;
        authUser = signUpData.user;
      } else if (signInErr) {
        throw signInErr;
      } else {
        authUser = signInData.user;
      }

      if (authUser) {
        // Fetch or wait for profile trigger
        let profileData = null;
        let attempts = 0;
        while (!profileData && attempts < 5) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();
          if (prof) {
            profileData = prof;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
          attempts++;
        }

        // Fallback profile if trigger takes too long
        if (!profileData) {
          profileData = {
            id: authUser.id,
            username: adminUsername,
            phone_number: phone,
            role: "admin",
            status: "active",
            tasks_completed: 0,
            success_rate: 100,
            total_earnings: 0,
            created_at: new Date().toISOString()
          };
        }

        setAuth({ id: authUser.id, phone: phone }, profileData);
        await initializeData();
        router.push("/admin");
      }
    } catch (err) {
      console.error("Admin Login failed:", err);
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer showNav={false}>
      <div className="flex-1 flex flex-col justify-between p-6 pt-8 pb-12 select-none">
        <div>
          {/* Back button */}
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-[#A1A1AA] hover:text-white transition-colors text-xs font-semibold cursor-pointer mb-12"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>

          {/* Title */}
          <div className="flex flex-col items-center text-center mt-6 mb-8">
            <div className="h-14 w-14 bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden flex items-center justify-center shadow-lg mb-4">
              <img 
                src="/logo.jpg" 
                alt="Logo" 
                className="h-full w-full object-cover object-[center_68%]" 
              />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white mb-1">
              Secret Console Login
            </h1>
            <p className="text-[11px] text-[#A1A1AA] max-w-[200px]">
              Access is restricted to authorized personnel only.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-xs text-red-500 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider pl-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-3.5 px-4 text-xs font-semibold placeholder:text-[#52525B]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider pl-1">
                Security Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-3.5 px-4 text-xs font-semibold placeholder:text-[#52525B]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-[#124715] hover:opacity-90 disabled:opacity-50 text-white font-bold rounded-2xl cursor-pointer transition-all text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <ShieldCheck size={16} />
              <span>{loading ? "Authenticating..." : "Unlock Console"}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-[9px] text-[#52525B] font-mono">
            SECURE ACCESS PORTAL // TASKFORCE ZERO
          </p>
        </div>
      </div>
    </MobileContainer>
  );
}
