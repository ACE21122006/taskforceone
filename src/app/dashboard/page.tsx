"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  Clock, 
  ChevronRight, 
  Plus, 
  ArrowUpRight, 
  ListCollapse, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Briefcase
} from "lucide-react";
import { 
  useAppStore, 
  getAvailableBalance, 
  getPendingBalance, 
  getLifetimeEarnings 
} from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";
import { DashboardSkeleton } from "@/components/skeleton-loaders";

export default function DashboardPage() {
  const router = useRouter();
  const { 
    user, 
    profile, 
    tasks, 
    submissions, 
    transactions, 
    initializeData 
  } = useAppStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
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

  if (loading || !profile || !user) {
    return (
      <MobileContainer>
        <DashboardSkeleton />
        <BottomNav />
      </MobileContainer>
    );
  }

  // Active / current task (first pending submission, or we mock an active task)
  const activeSubmission = submissions.find(
    (s) => s.user_id === user.id && s.status === "pending"
  );
  const activeTask = activeSubmission 
    ? tasks.find((t) => t.id === activeSubmission.task_id) 
    : null;

  // Wallet stats
  const availableBal = getAvailableBalance(profile, transactions);
  const pendingBal = getPendingBalance(profile, submissions, tasks);
  const lifetimeEar = getLifetimeEarnings(profile);

  // Recent activity (mix of submissions & withdrawals)
  const recentActivity = [
    ...submissions.filter(s => s.user_id === user.id).map(s => ({
      id: s.id,
      title: s.task_title || "Farming Task",
      amount: tasks.find(t => t.id === s.task_id)?.reward_tzs || 5000,
      type: "submission" as const,
      status: s.status,
      date: s.submission_date
    })),
    ...transactions.filter(t => t.user_id === user.id && t.type === "withdrawal").map(t => ({
      id: t.id,
      title: "Mobile Money Withdrawal",
      amount: Math.abs(t.amount_tzs),
      type: "withdrawal" as const,
      status: t.status === "completed" ? "approved" : t.status === "pending" ? "pending" : "rejected",
      date: t.created_at
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col gap-6 p-4">
        {/* Header section */}
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-3">
            {/* Avatar block */}
            <div className="h-10 w-10 rounded-full bg-[#181818] border border-[#262626] flex items-center justify-center text-sm font-bold text-[#22C55E]">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-[#A1A1AA]">Welcome back</span>
              <span className="text-sm font-semibold text-white">{profile.username}</span>
            </div>
          </div>

          <button
            onClick={() => router.push("/notifications")}
            className="h-9 px-3 bg-[#181818] hover:bg-[#22C55E]/10 border border-[#262626] text-xs font-semibold rounded-xl text-[#A1A1AA] hover:text-[#22C55E] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Inbox</span>
          </button>
        </div>

        {/* 1. Wallet Card */}
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-4 relative overflow-hidden">
          {/* Subtle design element */}
          <div className="absolute -right-6 -bottom-6 text-[#22C55E]/5 pointer-events-none">
            <TrendingUp size={120} strokeWidth={1} />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase">Available Balance</span>
            <div className="text-3xl font-bold tracking-tight text-white mt-1">
              {availableBal.toLocaleString()} <span className="text-xs text-[#22C55E] font-semibold">TZS</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-[#262626]/80 z-10">
            <div>
              <span className="text-[10px] text-[#A1A1AA]">Pending Review</span>
              <div className="text-sm font-semibold text-white mt-0.5">
                {pendingBal.toLocaleString()} TZS
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#A1A1AA]">Lifetime Earnings</span>
              <div className="text-sm font-semibold text-[#22C55E] mt-0.5">
                {lifetimeEar.toLocaleString()} TZS
              </div>
            </div>
          </div>
        </div>

        {/* 2. Current Task Card / Empty State */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase">Active Task</h3>
            {activeTask && (
              <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full font-medium">
                Pending Review
              </span>
            )}
          </div>

          {activeTask ? (
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-semibold text-white leading-tight max-w-[70%]">
                  {activeTask.title}
                </h4>
                <div className="text-xs font-semibold text-[#22C55E]">
                  +{activeTask.reward_tzs.toLocaleString()} TZS
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#A1A1AA] mt-1">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#22C55E]" />
                  <span>Est: {activeTask.est_completion_time}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} className="text-[#A1A1AA]" />
                  <span className="capitalize">{activeTask.difficulty}</span>
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-[#262626]/60 flex justify-between items-center">
                <span className="text-[10px] text-[#A1A1AA]">Submitted, waiting for admin approval</span>
                <button
                  onClick={() => router.push(`/tasks/${activeTask.id}`)}
                  className="py-1.5 px-3 bg-[#262626] hover:bg-[#323232] text-white text-xs font-medium rounded-xl transition-all cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626] border-dashed flex flex-col items-center text-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#111111] flex items-center justify-center text-[#A1A1AA] border border-[#262626]">
                <Plus size={16} />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-white">No active tasks</h4>
                <p className="text-[11px] text-[#A1A1AA] max-w-[200px]">
                  Browse available Delta Force farming tasks to start earning.
                </p>
              </div>
              <button
                onClick={() => router.push("/tasks")}
                className="py-2 px-4 mt-1 bg-[#22C55E] hover:bg-[#16A34A] text-[#0A0A0A] text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Find Tasks
              </button>
            </div>
          )}
        </div>

        {/* 3. Quick Actions */}
        <div>
          <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push("/tasks")}
              className="p-4 rounded-2xl bg-[#181818] border border-[#262626] hover:border-[#22C55E]/40 text-left flex flex-col justify-between h-24 transition-all duration-200 cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center group-hover:bg-[#22C55E] group-hover:text-black transition-all">
                <Plus size={16} />
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-white">Available Tasks</span>
                <ChevronRight size={14} className="text-[#A1A1AA]" />
              </div>
            </button>

            <button
              onClick={() => router.push("/tasks?tab=submissions")}
              className="p-4 rounded-2xl bg-[#181818] border border-[#262626] hover:border-[#22C55E]/40 text-left flex flex-col justify-between h-24 transition-all duration-200 cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-xl bg-[#A1A1AA]/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ListCollapse size={16} />
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-white">My Submissions</span>
                <ChevronRight size={14} className="text-[#A1A1AA]" />
              </div>
            </button>

            <button
              onClick={() => router.push("/wallet")}
              className="p-4 rounded-2xl bg-[#181818] border border-[#262626] hover:border-[#22C55E]/40 text-left flex flex-col justify-between h-24 transition-all duration-200 cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-black transition-all">
                <TrendingUp size={16} />
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-white">Wallet History</span>
                <ChevronRight size={14} className="text-[#A1A1AA]" />
              </div>
            </button>

            <button
              onClick={() => router.push("/withdraw")}
              className="p-4 rounded-2xl bg-[#181818] border border-[#262626] hover:border-[#22C55E]/40 text-left flex flex-col justify-between h-24 transition-all duration-200 cursor-pointer group"
            >
              <div className="h-8 w-8 rounded-xl bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center group-hover:bg-[#22C55E] group-hover:text-black transition-all">
                <ArrowUpRight size={16} />
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-white">Withdraw Funds</span>
                <ChevronRight size={14} className="text-[#A1A1AA]" />
              </div>
            </button>
          </div>
        </div>

        {/* 4. Recent Activity Feed */}
        <div>
          <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase mb-3">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="p-3 bg-[#181818] border border-[#262626] rounded-2xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                      activity.type === "withdrawal" 
                        ? "bg-red-500/10 text-[#EF4444]" 
                        : "bg-[#22C55E]/10 text-[#22C55E]"
                    }`}>
                      {activity.type === "withdrawal" ? <ArrowUpRight size={16} /> : <CheckCircle2 size={16} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-snug">{activity.title}</span>
                      <span className="text-[10px] text-[#A1A1AA]">
                        {new Date(activity.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold ${
                      activity.type === "withdrawal" ? "text-white" : "text-[#22C55E]"
                    }`}>
                      {activity.type === "withdrawal" ? "-" : "+"}
                      {activity.amount.toLocaleString()} TZS
                    </span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      activity.status === "approved" 
                        ? "text-[#22C55E] bg-[#22C55E]/10" 
                        : activity.status === "pending" 
                          ? "text-[#F59E0B] bg-[#F59E0B]/10" 
                          : "text-[#EF4444] bg-[#EF4444]/10"
                    }`}>
                      {activity.status === "approved" && <CheckCircle2 size={8} />}
                      {activity.status === "pending" && <AlertCircle size={8} />}
                      {activity.status === "rejected" && <XCircle size={8} />}
                      <span className="capitalize">{activity.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-[#181818] border border-[#262626] rounded-2xl text-center text-xs text-[#A1A1AA]">
              No recent activity found.
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
