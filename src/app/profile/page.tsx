"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Settings,
  CreditCard,
  ShieldCheck,
  Phone,
  LogOut,
  ChevronRight,
  X,
  Check,
  Eye,
  EyeOff,
  User,
  Lock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";

const SUPPORT_PHONE = "+255755835378";
const SUPPORT_DISPLAY = "+255 755 835 378";

// ── Inline modal sheet ────────────────────────────────────────────────
function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] bg-[#111111] border-t border-[#262626] rounded-t-3xl p-5 pb-8 shadow-2xl z-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-[#1c1c1c] border border-[#262626] flex items-center justify-center text-[#A1A1AA] hover:text-white cursor-pointer transition-colors"
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Feedback banner ───────────────────────────────────────────────────
function Banner({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 p-3.5 rounded-2xl text-xs font-semibold mb-4 ${
        type === "success"
          ? "bg-[#124715]/15 border border-[#124715]/30 text-[#22C55E]"
          : "bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444]"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 size={14} />
      ) : (
        <AlertCircle size={14} />
      )}
      {message}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, logout, updateProfile, changePassword } =
    useAppStore();

  // Sheet visibility
  const [sheet, setSheet] = useState<
    "edit" | "password" | "payout" | "support" | null
  >(null);

  // Edit profile form
  const [editUsername, setEditUsername] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editMsg, setEditMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password form
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!user) router.push("/");
  }, [user, router]);

  useEffect(() => {
    if (profile) {
      setEditUsername(profile.username);
      setEditPhone(profile.phone_number);
    }
  }, [profile]);

  const loading = !user || !profile;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const openSheet = (s: typeof sheet) => {
    setEditMsg(null);
    setPassMsg(null);
    setSheet(s);
  };

  // ── Save profile edits ─────────────────────────────────────────────
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMsg(null);
    if (!editUsername.trim() || editUsername.trim().length < 3) {
      setEditMsg({ type: "error", text: "Username must be at least 3 characters." });
      return;
    }
    const phoneRegex = /^(0[67]\d{8}|255\d{9})$/;
    if (!phoneRegex.test(editPhone.trim())) {
      setEditMsg({ type: "error", text: "Invalid phone. Use format: 07XXXXXXXX or 255XXXXXXXXX." });
      return;
    }
    setEditLoading(true);
    const res = await updateProfile({
      username: editUsername.trim(),
      phone_number: editPhone.trim(),
    });
    setEditLoading(false);
    setEditMsg({ type: res.success ? "success" : "error", text: res.message });
    if (res.success) setTimeout(() => setSheet(null), 1500);
  };

  // ── Change password ────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);
    if (newPass.length < 6) {
      setPassMsg({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setPassLoading(true);
    const res = await changePassword(newPass);
    setPassLoading(false);
    setPassMsg({ type: res.success ? "success" : "error", text: res.message });
    if (res.success) {
      setNewPass("");
      setConfirmPass("");
      setTimeout(() => setSheet(null), 1500);
    }
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#124715]" />
        </div>
        <BottomNav />
      </MobileContainer>
    );
  }

  const menuItems = [
    {
      label: "Edit Profile",
      sub: "Update username & phone",
      icon: User,
      action: () => openSheet("edit"),
    },
    {
      label: "Payout Methods",
      sub: "Manage withdrawal accounts",
      icon: CreditCard,
      action: () => router.push("/withdraw"),
    },
    {
      label: "Change Password",
      sub: "Update your login password",
      icon: Lock,
      action: () => openSheet("password"),
    },
    {
      label: "Customer Support",
      sub: SUPPORT_DISPLAY,
      icon: Phone,
      action: () => openSheet("support"),
    },
  ];

  return (
    <>
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
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">
                Taskforce Zero Network
              </span>
              <h2 className="text-sm font-bold text-white leading-tight">
                My Profile
              </h2>
            </div>
          </div>

          {/* Profile avatar card */}
          <div className="flex flex-col items-center text-center p-5 bg-[#181818] border border-[#262626] rounded-2xl mb-5">
            <div className="h-16 w-16 rounded-full bg-[#111111] border border-[#262626] flex items-center justify-center text-2xl font-bold text-[#124715] mb-3 select-none">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
            <h3 className="text-sm font-bold text-white leading-tight">
              {profile.username}
            </h3>
            <span className="text-xs text-[#A1A1AA] mt-1">
              {profile.phone_number}
            </span>
            {profile.role === "admin" && (
              <span className="mt-2.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold rounded-full">
                System Admin
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Completed", value: String(profile.tasks_completed) },
              {
                label: "Success Rate",
                value: `${profile.success_rate}%`,
                green: true,
              },
              {
                label: "Total Earned",
                value: profile.total_earnings.toLocaleString(),
              },
            ].map((s) => (
              <div
                key={s.label}
                className="p-3 bg-[#181818] border border-[#262626] rounded-2xl flex flex-col items-center justify-center text-center gap-1"
              >
                <span className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                  {s.label}
                </span>
                <span
                  className={`text-sm font-bold ${s.green ? "text-[#22C55E]" : "text-white"}`}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Menu */}
          <div className="flex flex-col gap-2 mb-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="p-4 bg-[#181818] border border-[#262626] hover:border-[#A1A1AA]/30 rounded-2xl flex justify-between items-center text-left cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-8 w-8 rounded-xl bg-[#111111] text-[#A1A1AA] flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">
                        {item.label}
                      </span>
                      <span className="text-[10px] text-[#A1A1AA]">
                        {item.sub}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#A1A1AA] shrink-0" />
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

      {/* ── Edit Profile Sheet ────────────────────────────────────── */}
      <Sheet
        open={sheet === "edit"}
        onClose={() => setSheet(null)}
        title="Edit Profile"
      >
        {editMsg && <Banner type={editMsg.type} message={editMsg.text} />}
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              />
              <input
                type="text"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                placeholder="e.g. Juma_Fighter"
                className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-3 pl-9 pr-4 text-xs font-semibold text-white placeholder:text-[#52525B] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              />
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-3 pl-9 pr-4 text-xs font-semibold text-white placeholder:text-[#52525B] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={editLoading}
            className="w-full py-3.5 bg-[#124715] disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-all text-xs flex items-center justify-center gap-2"
          >
            {editLoading ? (
              "Saving..."
            ) : (
              <>
                <Check size={14} /> Save Changes
              </>
            )}
          </button>
        </form>
      </Sheet>

      {/* ── Change Password Sheet ─────────────────────────────────── */}
      <Sheet
        open={sheet === "password"}
        onClose={() => setSheet(null)}
        title="Change Password"
      >
        {passMsg && <Banner type={passMsg.type} message={passMsg.text} />}
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
              New Password
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              />
              <input
                type={showPass ? "text" : "password"}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-3 pl-9 pr-10 text-xs font-semibold text-white placeholder:text-[#52525B] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white cursor-pointer"
              >
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              />
              <input
                type={showPass ? "text" : "password"}
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-[#0A0A0A] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-3 pl-9 pr-4 text-xs font-semibold text-white placeholder:text-[#52525B] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={passLoading}
            className="w-full py-3.5 bg-[#124715] disabled:opacity-50 text-white font-bold rounded-xl cursor-pointer transition-all text-xs flex items-center justify-center gap-2"
          >
            {passLoading ? (
              "Updating..."
            ) : (
              <>
                <ShieldCheck size={14} /> Update Password
              </>
            )}
          </button>
        </form>
      </Sheet>

      {/* ── Support Sheet ─────────────────────────────────────────── */}
      <Sheet
        open={sheet === "support"}
        onClose={() => setSheet(null)}
        title="Customer Support"
      >
        <div className="flex flex-col items-center text-center gap-4 py-2">
          <div className="h-14 w-14 rounded-2xl bg-[#124715]/10 border border-[#124715]/20 flex items-center justify-center">
            <Phone size={22} className="text-[#22C55E]" />
          </div>
          <div>
            <p className="text-xs text-[#A1A1AA] mb-1">
              Our support team is available to help you with any issues.
            </p>
            <p className="text-lg font-bold text-white tracking-tight font-mono">
              {SUPPORT_DISPLAY}
            </p>
          </div>
          <a
            href={`tel:${SUPPORT_PHONE}`}
            className="w-full py-3.5 bg-[#124715] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:opacity-80"
          >
            <Phone size={14} /> Call Support Now
          </a>
          <a
            href={`https://wa.me/${SUPPORT_PHONE.replace("+", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#111111] border border-[#262626] hover:border-[#A1A1AA]/30 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
          >
            WhatsApp Support
          </a>
        </div>
      </Sheet>
    </>
  );
}