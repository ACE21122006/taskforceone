"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Clock, Award, ShieldAlert, CheckSquare, FileText, ChevronRight, Briefcase } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";
import { TaskDetailsSkeleton } from "@/components/skeleton-loaders";

export default function TaskDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const { tasks, user, initializeData } = useAppStore();
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

  const task = tasks.find(item => item.id === taskId);

  if (loading) {
    return (
      <MobileContainer>
        <TaskDetailsSkeleton />
        <BottomNav />
      </MobileContainer>
    );
  }

  if (!task) {
    return (
      <MobileContainer>
        <div className="flex-1 flex flex-col p-6 items-center justify-center text-center gap-4">
          <ShieldAlert size={40} className="text-[#EF4444]" />
          <h2 className="text-lg font-bold text-white">Task Not Found</h2>
          <p className="text-xs text-[#A1A1AA] max-w-[240px]">
            The Delta Force task you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/tasks")}
            className="py-2 px-4 bg-[#262626] hover:bg-[#323232] text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Back to Jobs
          </button>
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
            onClick={() => router.push("/tasks")}
            className="h-10 w-10 bg-[#111111] border border-[#262626] rounded-xl flex items-center justify-center cursor-pointer hover:border-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">Delta Force Task</span>
            <h2 className="text-sm font-bold text-white leading-tight">Job Details</h2>
          </div>
        </div>

        {/* Task Title & Reference Value Card */}
        <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-4 mb-5 relative overflow-hidden">
          <div className="flex justify-between items-start gap-3">
            <h3 className="text-base font-bold text-white leading-snug">
              {task.title}
            </h3>
            <div className="text-xs font-bold text-[#A1A1AA] bg-[#262626] px-3 py-1.5 rounded-xl shrink-0">
              Ref: {task.reward_tzs.toLocaleString()} TZS
            </div>
          </div>

          <div className="flex gap-4 text-xs text-[#A1A1AA] border-t border-[#262626]/80 pt-3">
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#22C55E]" />
              <span>Est: {task.est_completion_time}</span>
            </span>
            <span className="flex items-center gap-1.5 capitalize">
              <Briefcase size={14} className="text-[#A1A1AA]" />
              <span>{task.difficulty}</span>
            </span>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="flex flex-col gap-4">
          {/* Instructions */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#A1A1AA] border-b border-[#262626] pb-2 uppercase tracking-wide">
              <FileText size={14} className="text-[#22C55E]" />
              <span>Job Instructions</span>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed pt-1">
              {task.instructions}
            </p>
          </div>

          {/* Requirements */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#A1A1AA] border-b border-[#262626] pb-2 uppercase tracking-wide">
              <Award size={14} className="text-[#F59E0B]" />
              <span>Player Requirements</span>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed pt-1">
              {task.requirements}
            </p>
          </div>

          {/* Submission Rules */}
          <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#A1A1AA] border-b border-[#262626] pb-2 uppercase tracking-wide">
              <CheckSquare size={14} className="text-[#EF4444]" />
              <span>Proof Guidelines</span>
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed pt-1">
              {task.submission_rules}
            </p>
          </div>
        </div>

        {/* Bottom Action CTA */}
        <div className="mt-6">
          <button
            onClick={() => {
              const message = `Hey admin, I've farmed coins for "${task.title}". I'm transferring them to you.`;
              router.push(`/notifications?msg=${encodeURIComponent(message)}`);
            }}
            className="w-full py-4 bg-[#22C55E] hover:bg-[#16A34A] text-[#0A0A0A] font-bold rounded-2xl cursor-pointer transition-all duration-200 text-sm shadow-[0_4px_24px_rgba(34,197,94,0.2)] flex items-center justify-center gap-2"
          >
            <span>Deposit Farmed Coins</span>
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
