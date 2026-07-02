"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, ListTodo, Wallet, User, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { notifications } = useAppStore();
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navItems = [
    { label: "Home", icon: Home, path: "/dashboard" },
    { label: "Tasks", icon: ListTodo, path: "/tasks" },
    { label: "Wallet", icon: Wallet, path: "/wallet" },
    { label: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-50% translate-x-[-50%] w-full max-w-[430px] bg-[#111111] border-t border-[#262626] py-3 px-6 flex justify-between items-center z-50 rounded-t-2xl safe-bottom shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
        
        return (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="flex flex-col items-center gap-1.5 cursor-pointer relative group flex-1"
          >
            <div className={`p-1.5 rounded-xl transition-all duration-200 ${
              isActive 
                ? "text-[#22C55E] bg-[#22C55E]/10" 
                : "text-[#A1A1AA] hover:text-white"
            }`}>
              <Icon size={20} strokeWidth={2.2} />
            </div>
            <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${
              isActive ? "text-[#22C55E]" : "text-[#A1A1AA] group-hover:text-white"
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
      
      {/* Quick notification bubble overlay on Profile or separate float */}
      <button
        onClick={() => router.push("/notifications")}
        className="flex flex-col items-center gap-1.5 cursor-pointer relative group flex-1"
      >
        <div className={`p-1.5 rounded-xl transition-all duration-200 ${
          pathname === "/notifications"
            ? "text-[#22C55E] bg-[#22C55E]/10"
            : "text-[#A1A1AA] hover:text-white"
        }`}>
          <div className="relative">
            <Bell size={20} strokeWidth={2.2} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#EF4444] text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-[#111111]">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${
          pathname === "/notifications" ? "text-[#22C55E]" : "text-[#A1A1AA] group-hover:text-white"
        }`}>
          Inbox
        </span>
      </button>
    </nav>
  );
}
