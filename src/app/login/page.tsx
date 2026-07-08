"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Phone } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { supabase, getFriendlyErrorMessage } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, profiles, isMockMode } = useAppStore();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!phoneNumber || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Tanzanian numbers: 07XXXXXXXX, 06XXXXXXXX (10 digits), or 255XXXXXXXXX (12 digits)
    const phoneRegex = /^(0[67]\d{8}|255\d{9})$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Invalid phone number. Format: 07XXXXXXXX, 06XXXXXXXX, or 255XXXXXXXXX.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    try {
      if (isMockMode) {
        // Find user in mockProfiles
        const matchedProfile = profiles.find(p => p.phone_number === phoneNumber);
        if (matchedProfile) {
          setAuth({ id: matchedProfile.id, phone: matchedProfile.phone_number }, matchedProfile);
          if (matchedProfile.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        } else {
          // Auto create a gamer user for easy evaluation
          const newMockProfile = {
            id: "gamer-" + Math.random().toString(36).substring(2, 9),
            username: "Gamer_" + phoneNumber.slice(-4),
            phone_number: phoneNumber,
            role: "gamer" as const,
            status: "active" as const,
            tasks_completed: 0,
            success_rate: 100,
            total_earnings: 0,
            created_at: new Date().toISOString()
          };
          setAuth({ id: newMockProfile.id, phone: newMockProfile.phone_number }, newMockProfile);
          router.push("/dashboard");
        }
      } else {
        // Real Supabase Auth (Sign in with virtual email to bypass phone OTP)
        const { data, error: authErr } = await supabase.auth.signInWithPassword({
          email: `${phoneNumber}@taskforcezero.com`,
          password: password,
        });

        if (authErr) {
          setError(getFriendlyErrorMessage(authErr));
        } else if (data.user) {
          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          setAuth(data.user, profileData);
          if (profileData?.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer showNav={false}>
      <div 
        className="flex-1 flex flex-col p-6 relative overflow-hidden bg-cover bg-center" 
        style={{ backgroundImage: "url('https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2507950/library_hero.jpg')" }}
      >
        {/* Dark vignette overlay for contrast and readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/40 z-0" />

        <div className="relative z-10 flex-1 flex flex-col">
          {/* Back button */}
          <button
            onClick={() => router.push("/")}
            className="h-10 w-10 bg-[#111111]/85 border border-[#262626] rounded-xl flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors self-start mb-6 text-white"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Welcome Back</h2>
            <p className="text-[#A1A1AA] text-xs">
              Sign in to start farming and tracking your real-money earnings.
            </p>
          </div>

          {/* Form wrapped in premium glassmorphism card */}
          <div className="flex-1 flex flex-col bg-[#111111]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl">
            <form onSubmit={handleLogin} className="flex-1 flex flex-col gap-4">
              {error && (
                <div className="p-4 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/25 text-[#EF4444] text-xs font-semibold backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Tanzanian Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full bg-[#18181B]/50 border border-[#262626] hover:border-[#A1A1AA]/30 focus:border-[#124715] focus:outline-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium transition-colors placeholder:text-[#52525B] text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setError("OTP/Password resets are simulated. Simply use a default phone/password to test.")}
                    className="text-xs text-[#124715] hover:text-[#124715] cursor-pointer font-semibold"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-[#18181B]/50 border border-[#262626] hover:border-[#A1A1AA]/30 focus:border-[#124715] focus:outline-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium transition-colors placeholder:text-[#52525B] text-white"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-6 bg-[#124715] hover:bg-[#124715] disabled:opacity-50 text-white font-semibold rounded-2xl cursor-pointer transition-all duration-200 text-sm shadow-[0_4px_20px_rgba(34,197,94,0.15)] flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "Login"}
              </button>

              <div className="text-center mt-auto pb-2">
                <span className="text-xs text-[#A1A1AA]">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/register")}
                    className="text-[#124715] hover:underline cursor-pointer font-semibold"
                  >
                    Register here
                  </button>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}