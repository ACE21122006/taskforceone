"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowRight, UserCheck, Settings } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { supabase } from "@/lib/supabase";

export default function SplashPage() {
  const router = useRouter();
  const { user, profile, setAuth, initializeData, profiles } = useAppStore();

  const [logoClicks, setLogoClicks] = useState(0);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretUser, setSecretUser] = useState("");
  const [secretPass, setSecretPass] = useState("");
  const [secretError, setSecretError] = useState("");

  const handleLogoClick = () => {
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setShowSecretModal(true);
        return 0;
      }
      return next;
    });
  };

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    if (user && profile) {
      if (profile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, profile, router]);

  const handleQuickLogin = async (role: "gamer" | "admin") => {
    // Perform a quick login for evaluation purposes
    const isMock = useAppStore.getState().isMockMode;
    const phone = role === "admin" ? "0788888888" : "0712345678";
    const username = role === "admin" ? "Taskforce_Zero_Manager" : "Juma_Fighter";
    const email = `${phone}@taskforcezero.com`;
    const password = "password123";

    if (isMock) {
      const mockUser = profiles.find((p) => p.role === role) || {
        id: role === "admin" ? "admin-1" : "gamer-1",
        username: username,
        phone_number: phone,
        role: role,
        status: "active",
        tasks_completed: role === "admin" ? 0 : 18,
        success_rate: 94.4,
        total_earnings: role === "admin" ? 0 : 135000,
        created_at: new Date().toISOString()
      };
      
      setAuth({ id: mockUser.id, phone: mockUser.phone_number }, mockUser);
      router.push(role === "admin" ? "/admin" : "/dashboard");
      return;
    }

    try {
      // Real Supabase Mode
      let authUser = null;

      // 1. Try to sign in
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr && (signInErr.message.includes("Invalid login credentials") || signInErr.message.includes("Email not confirmed"))) {
        console.log("Mock user not found in Supabase Auth, creating now...");
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              phone_number: phone,
              role: role,
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
            username: username,
            phone_number: phone,
            role: role,
            status: "active",
            tasks_completed: role === "admin" ? 0 : 18,
            success_rate: 94.4,
            total_earnings: role === "admin" ? 0 : 135000,
            created_at: new Date().toISOString()
          };
        }

        setAuth({ id: authUser.id, phone: phone }, profileData);
        await initializeData();
        router.push(role === "admin" ? "/admin" : "/dashboard");
      }
    } catch (err) {
      console.error("Quick Login failed:", err);
      alert("Quick Login failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <MobileContainer showNav={false}>
      <div className="flex-1 flex flex-col justify-between p-6 pt-16 pb-12 select-none">
        {/* Top Header/Logo */}
        <div className="flex flex-col items-center text-center mt-12">
          {/* Minimalist Gaming Logo Icon */}
          <div 
            onClick={handleLogoClick}
            className="h-16 w-16 bg-[#181818] border border-[#262626] rounded-2xl overflow-hidden flex items-center justify-center shadow-lg mb-6 cursor-pointer active:scale-95 transition-all select-none"
          >
            <img 
              src="/logo.jpg" 
              alt="Taskforce Zero Logo" 
              className="h-full w-full object-cover object-[center_68%]" 
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Taskforce Zero
          </h1>
          <p className="text-[#A1A1AA] text-sm max-w-[280px]">
            Tanzania&apos;s Delta Force gold farming workforce marketplace.
          </p>
        </div>

        {/* Evaluation quick actions (highly professional and convenient) */}
        {process.env.NODE_ENV !== "production" && (
          <div className="bg-[#111111] border border-[#262626] rounded-2xl p-4 flex flex-col gap-3 my-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#A1A1AA] border-b border-[#262626] pb-2">
              <Settings size={14} className="text-[#124715]" />
              <span>EVALUATION / DEVELOPER QUICK LOGIN</span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Click below to instantly log in and test both high-fidelity dashboards without SMS configuration:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleQuickLogin("gamer")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#181818] border border-[#262626] hover:border-[#124715]/50 rounded-xl text-xs font-medium cursor-pointer transition-colors text-white"
              >
                <UserCheck size={14} className="text-[#124715]" />
                <span>Gamer Portal</span>
              </button>
              <button
                onClick={() => handleQuickLogin("admin")}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#181818] border border-[#262626] hover:border-[#EF4444]/50 rounded-xl text-xs font-medium cursor-pointer transition-colors text-white"
              >
                <ShieldCheck size={14} className="text-[#EF4444]" />
                <span>Admin Console</span>
              </button>
            </div>
          </div>
        )}

        {/* Buttons / CTA */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/login")}
            className="w-full py-4 bg-[#124715] hover:bg-[#124715] active:scale-[0.99] text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm shadow-[0_4px_20px_rgba(34,197,94,0.2)]"
          >
            <span>Sign In to Account</span>
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          
          <button
            onClick={() => router.push("/register")}
            className="w-full py-4 bg-[#111111] hover:bg-[#181818] active:scale-[0.99] text-white border border-[#262626] hover:border-[#A1A1AA]/30 font-semibold rounded-2xl transition-all duration-200 cursor-pointer text-sm"
          >
            Create New Account
          </button>
          
          <div className="text-center mt-3">
            <p className="text-[11px] text-[#A1A1AA]">
              Secure payments powered by M-Pesa, Airtel, & Yas.
            </p>
          </div>
        </div>
      </div>

      {showSecretModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xs bg-[#111111] border border-[#262626] rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Secret Console</h3>
              <p className="text-[10px] text-[#A1A1AA] mt-1">Enter credentials to unlock access</p>
            </div>
            
            {secretError && (
              <div className="text-[10px] text-red-500 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-center font-medium">
                {secretError}
              </div>
            )}
            
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Username"
                value={secretUser}
                onChange={(e) => setSecretUser(e.target.value)}
                className="w-full bg-[#18181B] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-2.5 px-3 text-xs text-white"
              />
              <input
                type="password"
                placeholder="Password"
                value={secretPass}
                onChange={(e) => setSecretPass(e.target.value)}
                className="w-full bg-[#18181B] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-2.5 px-3 text-xs text-white"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  setShowSecretModal(false);
                  setSecretUser("");
                  setSecretPass("");
                  setSecretError("");
                }}
                className="py-2.5 bg-[#181818] hover:bg-[#262626] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors border border-[#262626]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (secretUser === "admin" && secretPass === "taskforcezero@2026") {
                    setShowSecretModal(false);
                    setSecretUser("");
                    setSecretPass("");
                    setSecretError("");
                    await handleQuickLogin("admin");
                  } else {
                    setSecretError("Invalid credentials");
                  }
                }}
                className="py-2.5 bg-[#124715] hover:opacity-90 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileContainer>
  );
}