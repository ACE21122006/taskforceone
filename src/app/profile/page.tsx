"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Settings, 
  CreditCard, 
  ShieldCheck, 
  MessageSquare, 
  LogOut, 
  ChevronRight, 
  ShieldAlert,
  ArrowLeftRight
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, logout, isMockMode, setMockMode } = useAppStore();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const loading = !user || !profile;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const toggleMockModeState = () => {
    setMockMode(!isMockMode);
  };

  if (loading || !profile) {
    return (
      <MobileContainer>
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#22C55E]" />
        </div>
      </MobileContainer>
    );
  }

  const menuItems = [
    { 
      label: "Edit Profile", 
      icon: Settings, 
      action: () => alert("Profile edits are locked in developer mode.") 
    },
    { 
      label: "Payout Methods", 
      icon: CreditCard, 
      action: () => router.push("/withdraw") 
    },
    { 
      label: "Security & Passwords", 
      icon: ShieldCheck, 
      action: () => alert("Security credentials managed by Supabase Auth.") 
    },
    { 
      label: "Customer Support", 
      icon: MessageSquare, 
      action: () => alert("Support Hotline: +255 712 345 678") 
    },
  ];

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-4 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="h-10 w-10 bg-[#111111] border border-[#262626] rounded-xl flex items-center justify-center cursor-pointer hover:border-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">Taskforce Zero Network</span>
            <h2 className="text-sm font-bold text-white leading-tight">My Profile</h2>
          </div>
        </div>

        {/* Profile Info Header */}
        <div className="flex flex-col items-center text-center p-5 bg-[#181818] border border-[#262626] rounded-2xl mb-5">
          <div className="h-16 w-16 rounded-full bg-[#111111] border border-[#262626] flex items-center justify-center text-2xl font-bold text-[#22C55E] mb-3">
            {profile.username.slice(0, 2).toUpperCase()}
          </div>
          <h3 className="text-sm font-bold text-white leading-tight">{profile.username}</h3>
          <span className="text-xs text-[#A1A1AA] mt-1">{profile.phone_number}</span>
          
          {profile.role === "admin" && (
            <span className="mt-2.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold rounded-full">
              System Admin
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-[#181818] border border-[#262626] rounded-2xl flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">Completed</span>
            <span className="text-sm font-bold text-white">{profile.tasks_completed}</span>
          </div>
          <div className="p-3 bg-[#181818] border border-[#262626] rounded-2xl flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">Success Rate</span>
            <span className="text-sm font-bold text-[#22C55E]">{profile.success_rate}%</span>
          </div>
          <div className="p-3 bg-[#181818] border border-[#262626] rounded-2xl flex flex-col items-center justify-center text-center gap-1">
            <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">Total Earned</span>
            <span className="text-sm font-bold text-white">{profile.total_earnings.toLocaleString()}</span>
          </div>
        </div>

        {/* Developer Sandbox Controls (very nice for demo) */}
        <div className="p-4 bg-[#111111] border border-[#262626] rounded-2xl flex flex-col gap-3 mb-6">
          <span className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider flex items-center gap-1">
            <ShieldAlert size={12} className="text-[#22C55E]" />
            <span>Developer Sandbox Options</span>
          </span>
          
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#A1A1AA]">Local Mock Mode (No costs)</span>
            <button
              onClick={toggleMockModeState}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                isMockMode 
                  ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]" 
                  : "bg-red-500/10 border-red-500 text-red-500"
              }`}
            >
              {isMockMode ? "Enabled" : "Disabled (Prod)"}
            </button>
          </div>

          <button
            onClick={() => {
              if (profile.role === "admin") {
                router.push("/admin");
              } else {
                // Switch role
                const adminProfile = {
                  id: "admin-1",
                  username: "Taskforce_Zero_Manager",
                  phone_number: "0788888888",
                  role: "admin" as const,
                  status: "active" as const,
                  tasks_completed: 0,
                  success_rate: 100,
                  total_earnings: 0,
                  created_at: new Date().toISOString()
                };
                useAppStore.setState({ profile: adminProfile, user: { id: adminProfile.id, phone: adminProfile.phone_number } });
                router.push("/admin");
              }
            }}
            className="w-full py-2.5 bg-[#262626] hover:bg-[#323232] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeftRight size={14} className="text-[#22C55E]" />
            <span>Switch to Admin Portal</span>
          </button>
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-2 mb-6">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="p-4 bg-[#181818] border border-[#262626] hover:border-[#A1A1AA]/30 rounded-2xl flex justify-between items-center text-left cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-8 w-8 rounded-xl bg-[#111111] text-[#A1A1AA] flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-semibold text-white">{item.label}</span>
                </div>
                <ChevronRight size={14} className="text-[#A1A1AA]" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-[#EF4444]/10 border border-[#EF4444]/20 hover:bg-[#EF4444]/20 text-[#EF4444] font-semibold rounded-2xl transition-all duration-200 text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
