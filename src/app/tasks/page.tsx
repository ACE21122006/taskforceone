"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Clock, ShieldAlert, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";
import { TaskFeedSkeleton } from "@/components/skeleton-loaders";

function TasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "submissions" ? "my-tasks" : "available";

  const { tasks, submissions, user, initializeData } = useAppStore();

  const [activeTab, setActiveTab] = useState<"available" | "my-tasks">(initialTab);
  const [myTasksTab, setMyTasksTab] = useState<"active" | "pending" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard" | "highest-reward">("all");
  
  const [loading, setLoading] = useState(true);
  const [now] = useState(() => Date.now());

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
    
    // Check if user has already submitted this task (for available list, we show tasks not yet pending/approved)
    const pendingOrApprovedTaskIds = submissions
      .filter(s => s.user_id === user?.id && (s.status === "pending" || s.status === "approved"))
      .map(s => s.task_id);
      
    result = result.filter(t => !pendingOrApprovedTaskIds.includes(t.id));

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
  }, [tasks, submissions, user, searchQuery, difficultyFilter]);

  // Filter gamer's submitted/active tasks
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(s => {
      if (s.user_id !== user?.id) return false;
      return s.status === myTasksTab;
    });
  }, [submissions, user, myTasksTab]);

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
        {/* Toggle between Available Tasks and My Tasks */}
        <div className="flex bg-[#111111] p-1 rounded-2xl border border-[#262626] mb-5">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 py-3 text-center text-xs font-semibold rounded-xl cursor-pointer transition-all duration-200 ${
              activeTab === "available" 
                ? "bg-[#22C55E] text-[#0A0A0A] shadow-md" 
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            Available Jobs
          </button>
          <button
            onClick={() => setActiveTab("my-tasks")}
            className={`flex-1 py-3 text-center text-xs font-semibold rounded-xl cursor-pointer transition-all duration-200 ${
              activeTab === "my-tasks" 
                ? "bg-[#22C55E] text-[#0A0A0A] shadow-md" 
                : "text-[#A1A1AA] hover:text-white"
            }`}
          >
            My Tasks
          </button>
        </div>

        {/* Tab 1: Available tasks feed */}
        {activeTab === "available" && (
          <div className="flex flex-col gap-4 flex-1">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farming jobs..."
                className="w-full bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-2xl py-3 pl-11 pr-4 text-xs font-medium transition-colors placeholder:text-[#52525B]"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4">
              {[
                { id: "all", label: "All" },
                { id: "easy", label: "Easy" },
                { id: "medium", label: "Medium" },
                { id: "hard", label: "Hard" },
                { id: "highest-reward", label: "Highest Reward" }
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
                  const deadlineDate = new Date(task.deadline);
                  const timeDiff = deadlineDate.getTime() - now;
                  const daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
                  
                  return (
                    <div
                      key={task.id}
                      className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-sm font-semibold text-white leading-snug">
                          {task.title}
                        </h4>
                        <div className="text-xs font-semibold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-xl shrink-0">
                          {task.reward_tzs.toLocaleString()} TZS
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
                        
                        <span className="text-[10px] text-[#A1A1AA]">
                          {daysRemaining > 0 ? `${daysRemaining}d left` : "Ends today"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#262626]/50">
                        <span className="text-[10px] text-[#A1A1AA]">Required Level: {task.requirements.split(".")[0]}</span>
                        <button
                          onClick={() => router.push(`/tasks/${task.id}`)}
                          className="py-2 px-4 bg-[#22C55E] hover:bg-[#16A34A] text-[#0A0A0A] text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-md"
                        >
                          <span>Accept Job</span>
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
        )}

        {/* Tab 2: My tasks review states */}
        {activeTab === "my-tasks" && (
          <div className="flex flex-col gap-4 flex-1">
            {/* Status pills */}
            <div className="flex bg-[#181818] p-1 rounded-2xl border border-[#262626]">
              {[
                { id: "pending", label: "Pending" },
                { id: "approved", label: "Approved" },
                { id: "rejected", label: "Rejected" }
              ].map((subTab) => (
                <button
                  key={subTab.id}
                  onClick={() => setMyTasksTab(subTab.id as "active" | "pending" | "approved" | "rejected")}
                  className={`flex-1 py-2 text-center text-[11px] font-semibold rounded-xl cursor-pointer transition-colors ${
                    myTasksTab === subTab.id 
                      ? "bg-[#262626] text-white" 
                      : "text-[#A1A1AA] hover:text-white"
                  }`}
                >
                  {subTab.label}
                </button>
              ))}
            </div>

            {/* Submissions list */}
            {filteredSubmissions.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredSubmissions.map((sub) => {
                  const task = tasks.find(t => t.id === sub.task_id);
                  
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <h4 className="text-sm font-semibold text-white leading-snug">
                          {sub.task_title || task?.title || "Farming Job"}
                        </h4>
                        <div className="text-xs font-semibold text-[#22C55E]">
                          {task ? task.reward_tzs.toLocaleString() : "5,000"} TZS
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#A1A1AA] mt-1 pt-3 border-t border-[#262626]/50">
                        <span className="flex items-center gap-1.5">
                          {sub.status === "approved" && <CheckCircle2 size={12} className="text-[#22C55E]" />}
                          {sub.status === "pending" && <Clock size={12} className="text-[#F59E0B]" />}
                          {sub.status === "rejected" && <XCircle size={12} className="text-[#EF4444]" />}
                          <span className="capitalize">Status: {sub.status}</span>
                        </span>
                        
                        <span>
                          {new Date(sub.submission_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Admin feedback if rejected */}
                      {sub.status === "rejected" && sub.admin_feedback && (
                        <div className="mt-2 p-3 bg-[#EF4444]/5 border border-[#EF4444]/20 rounded-xl text-[11px] text-[#EF4444]">
                          <span className="font-bold">Feedback:</span> {sub.admin_feedback}
                        </div>
                      )}
                      
                      {sub.status === "approved" && sub.admin_feedback && (
                        <div className="mt-2 p-3 bg-[#22C55E]/5 border border-[#22C55E]/20 rounded-xl text-[11px] text-[#22C55E]">
                          <span className="font-bold">Admin note:</span> {sub.admin_feedback}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-8 bg-[#181818] border border-[#262626] border-dashed rounded-2xl mt-2 min-h-[220px]">
                <Clock size={28} className="text-[#A1A1AA]" />
                <span className="text-xs font-bold text-white">No submissions found</span>
                <p className="text-[11px] text-[#A1A1AA] max-w-[200px]">
                  You don&apos;t have any tasks in the <span className="text-[#22C55E]">{myTasksTab}</span> tab.
                </p>
              </div>
            )}
          </div>
        )}
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
