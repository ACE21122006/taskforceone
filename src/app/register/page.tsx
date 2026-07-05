"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Lock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth, isMockMode } = useAppStore();

  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username || !phoneNumber || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      setLoading(false);
      return;
    }

    // Verify format: Tanzanian numbers typically start with 07 or 06 (9-10 digits)
    const phoneRegex = /^(06|07|255)\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Invalid phone. Use Tanzanian format: 07XXXXXXXX or 06XXXXXXXX.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isMockMode) {
        // Create gamer user
        const newMockProfile = {
          id: "gamer-" + Math.random().toString(36).substring(2, 9),
          username: username,
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
      } else {
        // Real Supabase Auth Signup (using virtual email to bypass phone OTP)
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: `${phoneNumber}@taskforcezero.com`,
          password: password,
          options: {
            data: {
              username: username,
              phone_number: phoneNumber,
              role: "gamer"
            }
          }
        });

        if (signUpErr) {
          setError(signUpErr.message);
        } else if (data.user) {
          // Profile is created via Postgres trigger
          // Fetch the profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          setAuth(data.user, profileData);
          router.push("/dashboard");
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Registration failed. Try again.";
      setError(errMsg);
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
          {/* Back Button */}
          <button
            onClick={() => router.push("/")}
            className="h-10 w-10 bg-[#111111]/85 border border-[#262626] rounded-xl flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors self-start mb-6 text-white"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Title */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Create Account</h2>
            <p className="text-[#A1A1AA] text-xs">
              Join the Delta Force coin farming community in Tanzania.
            </p>
          </div>

          {/* Form wrapped in premium glassmorphism card */}
          <div className="flex-1 flex flex-col bg-[#111111]/70 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl overflow-y-auto max-h-[70vh] scrollbar-none">
            <form onSubmit={handleRegister} className="flex-1 flex flex-col gap-4">
              {error && (
                <div className="p-4 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/25 text-[#EF4444] text-xs font-semibold backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. Juma_Fighter"
                    className="w-full bg-[#18181B]/50 border border-[#262626] hover:border-[#A1A1AA]/30 focus:border-[#124715] focus:outline-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium transition-colors placeholder:text-[#52525B] text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Phone Number
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
                <label className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Password
                </label>
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

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-[#18181B]/50 border border-[#262626] hover:border-[#A1A1AA]/30 focus:border-[#124715] focus:outline-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium transition-colors placeholder:text-[#52525B] text-white"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-4 bg-[#124715] hover:bg-[#124715] disabled:opacity-50 text-white font-semibold rounded-2xl cursor-pointer transition-all duration-200 text-sm shadow-[0_4px_20px_rgba(34,197,94,0.15)] flex items-center justify-center gap-2"
              >
                {loading ? "Creating account..." : "Register"}
              </button>

              <div className="text-center mt-auto pb-2">
                <span className="text-xs text-[#A1A1AA]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="text-[#124715] hover:underline cursor-pointer font-semibold"
                  >
                    Sign In
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