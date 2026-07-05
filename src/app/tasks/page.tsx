"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, ShieldAlert, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";
import { TaskFeedSkeleton } from "@/components/skeleton-loaders";

function TasksContent() {
  const router = useRouter();
  const { tasks, user, initializeData } = useAppStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard" | "highest-reward">("all");
  
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

  // Filter available tasks
  const filteredTasks = useMemo(() => {
    let result = tasks.filter(t => t.status === "published");

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(query) || t.instructions.toLowerCase().includes(query));
    }

    if (difficultyFilter === "highest-reward") {
      result = [...result].sort((a, b) => b.reward_tzs - a.reward_tzs);
    } else if (difficultyFilter !== "all") {
      result = result.filter(t => t.difficulty === difficultyFilter);
    }

    return result;
  }, [tasks, searchQuery, difficultyFilter]);

  if (loading) {
    return (
      <MobileContainer>
        <TaskFeedSkeleton />
        <BottomNav />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-4">
        {/* Header Notice */}
        <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 p-4 rounded-2xl mb-5 text-[11px] text-[#A1A1AA] leading-relaxed">
          <span className="font-bold text-white block mb-0.5">ℹ️ COIN FARMING REFERENCE CATALOG</span>
          These jobs serve as reference guides for Delta Force coin values and instructions. <strong>Tasks do not pay out TZS directly.</strong> To earn money, farm coins in-game and transfer them to the admin, then upload your proof via the <span className="text-[#22C55E] font-semibold cursor-pointer underline" onClick={() => router.push("/notifications")}>Inbox</span> tab to receive manually processed payouts.
        </div>

        <div className="flex flex-col gap-4 flex-1">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog jobs..."
              className="w-full bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-2xl py-3.5 pl-11 pr-4 text-xs font-medium transition-colors placeholder:text-[#52525B]"
            />
          </div>

          {/* Filter buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
            {[
              { id: "all", label: "All" },
              { id: "easy", label: "Easy" },
              { id: "medium", label: "Medium" },
              { id: "hard", label: "Hard" },
              { id: "highest-reward", label: "Highest Value Reference" }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setDifficultyFilter(filter.id as "all" | "easy" | "medium" | "hard" | "highest-reward")}
                className={`py-2 px-3.5 text-xs font-semibold rounded-xl cursor-pointer transition-all shrink-0 border ${
                  difficultyFilter === filter.id
                    ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]"
                    : "bg-[#181818] border-[#262626] text-[#A1A1AA] hover:text-white hover:border-[#A1A1AA]/30"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Task list */}
          {filteredTasks.length > 0 ? (
            <div className="flex flex-col gap-3.5 mt-1">
              {filteredTasks.map((task) => {
                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <h4 className="text-sm font-semibold text-white leading-snug">
                        {task.title}
                      </h4>
                      <div className="text-xs font-semibold text-[#A1A1AA] bg-[#262626] px-2.5 py-1 rounded-xl shrink-0">
                        Ref: {task.reward_tzs.toLocaleString()} TZS
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        task.difficulty === "easy" 
                          ? "bg-[#22C55E]/10 text-[#22C55E]" 
                          : task.difficulty === "medium" 
                            ? "bg-[#F59E0B]/10 text-[#F59E0B]" 
                            : "bg-[#EF4444]/10 text-[#EF4444]"
                      }`}>
                        {task.difficulty}
                      </span>
                      
                      <span className="text-[10px] text-[#A1A1AA] flex items-center gap-1">
                        <Clock size={11} />
                        <span>Est: {task.est_completion_time}</span>
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#262626]/50">
                      <span className="text-[10px] text-[#A1A1AA]">Required Level: {task.requirements.split(".")[0]}</span>
                      <button
                        onClick={() => router.push(`/tasks/${task.id}`)}
                        className="py-2 px-4 bg-[#262626] hover:bg-[#323232] hover:text-white text-[#A1A1AA] text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors border border-[#262626]"
                      >
                        <span>View Details</span>
                        <ChevronRight size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-8 bg-[#181818] border border-[#262626] border-dashed rounded-2xl mt-2 min-h-[220px]">
              <ShieldAlert size={28} className="text-[#A1A1AA]" />
              <span className="text-xs font-bold text-white">No jobs available</span>
              <p className="text-[11px] text-[#A1A1AA] max-w-[200px]">
                Check back later or adjust filters for new Delta Force assignments.
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <MobileContainer>
        <TaskFeedSkeleton />
        <BottomNav />
      </MobileContainer>
    }>
      <TasksContent />
    </Suspense>
  );
}
