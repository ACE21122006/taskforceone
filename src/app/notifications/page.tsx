"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, XCircle, Bell } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, notifications, markNotificationRead, initializeData } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    const loadData = async () => {
      await initializeData();
      setLoading(false);
    };
    loadData();
  }, [user, initializeData, router]);

  const userNotifications = notifications.filter(n => n.user_id === user?.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleRead = async (id: string) => {
    await markNotificationRead(id);
  };

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex flex-col gap-6 p-4">
          <div className="h-6 w-24 bg-[#1c1c1c] rounded-md animate-pulse" />
          <div className="h-16 w-full bg-[#1c1c1c] rounded-xl animate-pulse" />
          <div className="h-16 w-full bg-[#1c1c1c] rounded-xl animate-pulse" />
        </div>
        <BottomNav />
      </MobileContainer>
    );
  }

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
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">Inbox</span>
            <h2 className="text-sm font-bold text-white leading-tight">Notifications</h2>
          </div>
        </div>

        {/* Notifications list */}
        {userNotifications.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {userNotifications.map((notif) => {
              const isApproval = notif.type.includes("approved");
              const isRejection = notif.type.includes("rejected");
              
              return (
                <div
                  key={notif.id}
                  onClick={() => handleRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    notif.is_read 
                      ? "bg-[#111111] border-[#262626] opacity-70" 
                      : "bg-[#181818] border-[#262626] hover:border-[#22C55E]/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isApproval 
                        ? "bg-[#22C55E]/10 text-[#22C55E]" 
                        : isRejection 
                          ? "bg-[#EF4444]/10 text-[#EF4444]" 
                          : "bg-blue-500/10 text-blue-400"
                    }`}>
                      {isApproval && <CheckCircle2 size={16} />}
                      {isRejection && <XCircle size={16} />}
                      {!isApproval && !isRejection && <Bell size={16} />}
                    </div>

                    <div className="flex-1 flex flex-col gap-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-white leading-snug">
                          {notif.title}
                        </span>
                        
                        <span className="text-[9px] text-[#A1A1AA] shrink-0 font-medium mt-0.5">
                          {new Date(notif.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
                        {notif.message}
                      </p>
                      
                      {!notif.is_read && (
                        <span className="text-[9px] text-[#22C55E] font-bold mt-1.5 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" />
                          <span>Tap to mark read</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-8 bg-[#181818] border border-[#262626] border-dashed rounded-2xl mt-2 min-h-[220px]">
            <Bell size={28} className="text-[#A1A1AA]" />
            <span className="text-xs font-bold text-white">No notifications</span>
            <p className="text-[11px] text-[#A1A1AA] max-w-[200px]">
              You are all caught up. Account updates and task reviews will appear here.
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
