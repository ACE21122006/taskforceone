"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Layers, 
  FileCheck, 
  ArrowDownToLine, 
  Coins, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Search, 
  ArrowLeft, 
  Play
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { 
    user, 
    profile, 
    tasks, 
    submissions, 
    transactions, 
    profiles,
    createTask, 
    deleteTask, 
    reviewSubmission, 
    reviewWithdrawal, 
    toggleUserStatus,
    initializeData 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "submissions" | "withdrawals" | "users">("overview");
  const [loading, setLoading] = useState(true);

  // Task creation states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskReward, setTaskReward] = useState("");
  const [taskDifficulty, setTaskDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskRequirements, setTaskRequirements] = useState("");
  const [taskSubmissionRules, setTaskSubmissionRules] = useState("");
  const [taskEstTime, setTaskEstTime] = useState("");
  const [taskSuccess, setTaskSuccess] = useState(false);

  // Submissions feedback states
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

  // Search states
  const [userQuery, setUserQuery] = useState("");

  useEffect(() => {
    // Check admin authorization
    if (!user || profile?.role !== "admin") {
      router.push("/");
      return;
    }
    const loadData = async () => {
      await initializeData();
      setLoading(false);
    };
    loadData();
  }, [user, profile, initializeData, router]);

  // Statistics Computations
  const stats = useMemo(() => {
    const totalUsers = profiles.filter(p => p.role === "gamer").length;
    const activeUsers = profiles.filter(p => p.role === "gamer" && p.status === "active").length;
    const pendingReviews = submissions.filter(s => s.status === "pending").length;
    const pendingWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "pending").length;
    
    const totalRewardsPaid = transactions
      .filter(t => t.type === "reward" && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount_tzs), 0);

    return { totalUsers, activeUsers, pendingReviews, pendingWithdrawals, totalRewardsPaid };
  }, [profiles, submissions, transactions]);

  // Pending Submissions
  const pendingSubmissionsList = useMemo(() => {
    return submissions.filter(s => s.status === "pending");
  }, [submissions]);

  // Pending Withdrawals
  const pendingWithdrawalsList = useMemo(() => {
    return transactions.filter(t => t.type === "withdrawal" && t.status === "pending");
  }, [transactions]);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    let result = profiles.filter(p => p.role === "gamer");
    if (userQuery.trim()) {
      const q = userQuery.toLowerCase();
      result = result.filter(p => p.username.toLowerCase().includes(q) || p.phone_number.includes(q));
    }
    return result;
  }, [profiles, userQuery]);

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !taskReward || !taskDeadline || !taskInstructions || !taskRequirements || !taskSubmissionRules || !taskEstTime) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await createTask({
        title: taskTitle,
        reward_tzs: Number(taskReward),
        difficulty: taskDifficulty,
        deadline: new Date(taskDeadline).toISOString(),
        instructions: taskInstructions,
        requirements: taskRequirements,
        submission_rules: taskSubmissionRules,
        est_completion_time: taskEstTime,
      });

      setTaskSuccess(true);
      // Reset
      setTaskTitle("");
      setTaskReward("");
      setTaskDeadline("");
      setTaskInstructions("");
      setTaskRequirements("");
      setTaskSubmissionRules("");
      setTaskEstTime("");
      setTimeout(() => setTaskSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      alert("Failed to create task.");
    }
  };

  // Review Submission Handler
  const handleReviewSubmission = async (id: string, status: "approved" | "rejected") => {
    const feedback = feedbackMap[id] || "";
    if (status === "rejected" && !feedback) {
      alert("Please enter a feedback message detailing the reason for rejection.");
      return;
    }

    try {
      await reviewSubmission(id, status, feedback);
      // Clear feedback
      setFeedbackMap(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update submission.");
    }
  };

  // Review Withdrawal Handler
  const handleReviewWithdrawal = async (id: string, status: "completed" | "rejected") => {
    try {
      await reviewWithdrawal(id, status);
    } catch (err) {
      console.error(err);
      alert("Failed to process withdrawal.");
    }
  };

  // Toggle user suspension
  const handleToggleUser = async (userId: string) => {
    try {
      await toggleUserStatus(userId);
    } catch (err) {
      console.error(err);
      alert("Failed to modify user status.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#22C55E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#111111] border-b border-[#262626] px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#181818] border border-[#262626] rounded-xl flex items-center justify-center font-bold text-red-500">
            DF
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">DF Earn Admin</h1>
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-semibold">
              Workforce Control Panel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              // Quick exit back to Gamer dashboard
              const gamerProfile = {
                id: "gamer-1",
                username: "Juma_Fighter",
                phone_number: "0712345678",
                role: "gamer" as const,
                status: "active" as const,
                tasks_completed: 18,
                success_rate: 94.4,
                total_earnings: 135000,
                created_at: new Date().toISOString()
              };
              useAppStore.setState({ profile: gamerProfile, user: { id: gamerProfile.id, phone: gamerProfile.phone_number } });
              router.push("/dashboard");
            }}
            className="py-2 px-4 bg-[#262626] hover:bg-[#323232] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-white"
          >
            <ArrowLeft size={14} />
            <span>Gamer View</span>
          </button>
        </div>
      </header>

      {/* Main Workspace layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 bg-[#111111] border-r border-[#262626] p-4 flex flex-col gap-1 shrink-0">
          {[
            { id: "overview", label: "Dashboard Summary", icon: Layers },
            { id: "tasks", label: "Delta Force Tasks", icon: Plus },
            { id: "submissions", label: "Review Proofs", icon: FileCheck, badge: stats.pendingReviews },
            { id: "withdrawals", label: "Review Withdrawals", icon: ArrowDownToLine, badge: stats.pendingWithdrawals },
            { id: "users", label: "Gamers Database", icon: Users }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as "overview" | "tasks" | "submissions" | "withdrawals" | "users")}
                className={`w-full py-3 px-4 rounded-xl flex justify-between items-center font-semibold text-xs transition-colors cursor-pointer text-left ${
                  isActive 
                    ? "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20" 
                    : "text-[#A1A1AA] hover:text-white hover:bg-[#181818]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#EF4444] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#0A0A0A]">
          {/* TAB 1: OVERVIEW SUMMARY */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold">Overview Statistics</h2>
              
              <div className="grid grid-cols-4 gap-6">
                {[
                  { label: "Total Registered Gamers", val: stats.totalUsers, icon: Users, color: "text-[#22C55E]" },
                  { label: "Active Gamers", val: stats.activeUsers, icon: Users, color: "text-green-400" },
                  { label: "Pending Reviews", val: stats.pendingReviews, icon: FileCheck, color: "text-amber-500" },
                  { label: "Pending Withdrawals", val: stats.pendingWithdrawals, icon: ArrowDownToLine, color: "text-red-400" }
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <div key={idx} className="p-6 rounded-2xl bg-[#181818] border border-[#262626] flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">{s.label}</span>
                        <span className="text-2xl font-bold mt-1 text-white">{s.val}</span>
                      </div>
                      <Icon className={s.color} size={28} />
                    </div>
                  );
                })}
              </div>

              {/* Total Rewards paid out card */}
              <div className="p-6 rounded-2xl bg-[#181818] border border-[#262626] max-w-md flex items-center justify-between mt-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Total Rewards Paid to Gamers
                  </span>
                  <span className="text-3xl font-bold mt-1 text-[#22C55E]">
                    {stats.totalRewardsPaid.toLocaleString()} TZS
                  </span>
                </div>
                <Coins className="text-[#22C55E]" size={36} />
              </div>
            </div>
          )}

          {/* TAB 2: TASKS MANAGEMENT */}
          {activeTab === "tasks" && (
            <div className="grid grid-cols-2 gap-8">
              {/* Create Task Form */}
              <div className="p-6 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-5">
                <h3 className="text-base font-bold text-white mb-2">Create New Task</h3>
                
                {taskSuccess && (
                  <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-xs font-semibold">
                    Task published successfully!
                  </div>
                )}

                <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Task Title</label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      placeholder="e.g. Farming valley weapons crates"
                      className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-3 text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Reward (TZS)</label>
                      <input
                        type="number"
                        value={taskReward}
                        onChange={(e) => setTaskReward(e.target.value)}
                        placeholder="e.g. 15000"
                        className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-3 text-xs font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Est Time</label>
                      <input
                        type="text"
                        value={taskEstTime}
                        onChange={(e) => setTaskEstTime(e.target.value)}
                        placeholder="e.g. 45 mins"
                        className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-3 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Difficulty</label>
                      <select
                        value={taskDifficulty}
                        onChange={(e) => setTaskDifficulty(e.target.value as "easy" | "medium" | "hard")}
                        className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-3 text-xs font-medium"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Deadline Date</label>
                      <input
                        type="date"
                        value={taskDeadline}
                        onChange={(e) => setTaskDeadline(e.target.value)}
                        className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-2.5 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Instructions</label>
                    <textarea
                      value={taskInstructions}
                      onChange={(e) => setTaskInstructions(e.target.value)}
                      placeholder="Detailed instructions for the gamer..."
                      rows={3}
                      className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-3 text-xs font-medium resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Requirements</label>
                    <textarea
                      value={taskRequirements}
                      onChange={(e) => setTaskRequirements(e.target.value)}
                      placeholder="Minimum level, map settings, loadout items..."
                      rows={2}
                      className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-3 text-xs font-medium resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Proof Guidelines</label>
                    <textarea
                      value={taskSubmissionRules}
                      onChange={(e) => setTaskSubmissionRules(e.target.value)}
                      placeholder="Screenshot requirement details..."
                      rows={2}
                      className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-3 text-xs font-medium resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-black font-semibold rounded-xl text-xs cursor-pointer transition-colors shadow-md mt-2"
                  >
                    Publish Task to Feed
                  </button>
                </form>
              </div>

              {/* Tasks List */}
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-bold text-white">Active Tasks</h3>
                <div className="flex flex-col gap-3">
                  {tasks.map(t => (
                    <div key={t.id} className="p-4 bg-[#181818] border border-[#262626] rounded-2xl flex justify-between items-center">
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        <span className="text-xs font-bold text-white">{t.title}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-[#A1A1AA] bg-[#262626] px-2 py-0.5 rounded font-bold capitalize">
                            {t.difficulty}
                          </span>
                          <span className="text-[10px] text-[#A1A1AA]">
                            {t.reward_tzs.toLocaleString()} TZS
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(t.id)}
                        className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUBMISSION REVIEW */}
          {activeTab === "submissions" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold">Pending Task Evidence Reviews</h2>
              
              {pendingSubmissionsList.length > 0 ? (
                <div className="grid grid-cols-2 gap-6">
                  {pendingSubmissionsList.map((sub) => (
                    <div key={sub.id} className="p-5 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-4">
                      {/* Gamer detail */}
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">{sub.task_title || "Farming Job"}</span>
                          <span className="text-[10px] text-[#A1A1AA] mt-0.5">
                            Gamer: {sub.username || "Unknown"} ({sub.phone_number})
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#22C55E]">
                          {sub.coins_earned.toLocaleString()} Coins
                        </span>
                      </div>

                      {/* Evidence Screenshot */}
                      {sub.screenshot_url && (
                        <div className="rounded-xl border border-[#262626] overflow-hidden bg-[#111111] h-44 relative group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={sub.screenshot_url} 
                            alt="Evidence proof" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/75 px-2 py-1 rounded text-[9px] font-bold text-white border border-[#262626]">
                            Screenshot Evidence
                          </div>
                        </div>
                      )}

                      {/* Video proof link */}
                      {sub.video_url && (
                        <div className="p-3 bg-[#111111] border border-[#262626] rounded-xl flex items-center justify-between text-xs">
                          <span className="text-[#A1A1AA]">Video Clip Uploaded</span>
                          <a 
                            href={sub.video_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[#22C55E] hover:underline flex items-center gap-1 font-bold"
                          >
                            <Play size={12} />
                            <span>Watch Clip</span>
                          </a>
                        </div>
                      )}

                      {/* Notes */}
                      {sub.notes && (
                        <div className="p-3 bg-[#111111] border border-[#262626] rounded-xl text-[11px] text-[#A1A1AA] leading-relaxed">
                          <span className="font-bold text-white block mb-1">Gamer Notes:</span>
                          {sub.notes}
                        </div>
                      )}

                      {/* Feedback input */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-[9px] font-bold text-[#A1A1AA] uppercase tracking-wider">
                          Reviewer Feedback (Required for rejection)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Screen shows wrong username"
                          value={feedbackMap[sub.id] || ""}
                          onChange={(e) => setFeedbackMap(prev => ({ ...prev, [sub.id]: e.target.value }))}
                          className="bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl p-3 text-xs"
                        />
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-3 mt-1 pt-3 border-t border-[#262626]/50">
                        <button
                          onClick={() => handleReviewSubmission(sub.id, "rejected")}
                          className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <X size={14} />
                          <span>Reject Evidence</span>
                        </button>
                        <button
                          onClick={() => handleReviewSubmission(sub.id, "approved")}
                          className="py-2.5 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Check size={14} />
                          <span>Approve & Pay</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-[#181818] border border-[#262626] border-dashed rounded-2xl text-center text-xs text-[#A1A1AA] max-w-md">
                  No pending task submissions to review.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WITHDRAWAL REVIEW */}
          {activeTab === "withdrawals" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-bold">Review Payout Requests</h2>
              
              {pendingWithdrawalsList.length > 0 ? (
                <div className="bg-[#181818] border border-[#262626] rounded-2xl overflow-hidden max-w-4xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#262626] bg-[#111111] text-[#A1A1AA] font-bold">
                        <th className="p-4">Gamer</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Request Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingWithdrawalsList.map((tx) => (
                        <tr key={tx.id} className="border-b border-[#262626]/60 hover:bg-[#111111]/30 transition-colors">
                          <td className="p-4 font-bold text-white">
                            {tx.username || "Unknown Gamer"}
                          </td>
                          <td className="p-4 text-[#A1A1AA] font-medium">
                            {tx.description}
                          </td>
                          <td className="p-4 text-white font-bold">
                            {Math.abs(tx.amount_tzs).toLocaleString()} TZS
                          </td>
                          <td className="p-4 text-[#A1A1AA]">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2.5">
                            <button
                              onClick={() => handleReviewWithdrawal(tx.id, "rejected")}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg cursor-pointer transition-colors"
                              title="Reject Payout"
                            >
                              <X size={14} />
                            </button>
                            <button
                              onClick={() => handleReviewWithdrawal(tx.id, "completed")}
                              className="p-2 bg-[#22C55E]/10 hover:bg-[#22C55E]/20 text-[#22C55E] rounded-lg cursor-pointer transition-colors"
                              title="Approve Payout"
                            >
                              <Check size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 bg-[#181818] border border-[#262626] border-dashed rounded-2xl text-center text-xs text-[#A1A1AA] max-w-md">
                  No pending mobile money withdrawal requests.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: USER DATABASE */}
          {activeTab === "users" && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Registered Gamers</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" size={14} />
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search gamers..."
                    className="w-full bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-xl py-2 pl-9 pr-3 text-xs"
                  />
                </div>
              </div>

              {filteredUsers.length > 0 ? (
                <div className="bg-[#181818] border border-[#262626] rounded-2xl overflow-hidden max-w-5xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#262626] bg-[#111111] text-[#A1A1AA] font-bold">
                        <th className="p-4">Username</th>
                        <th className="p-4">Phone Number</th>
                        <th className="p-4">Completed Jobs</th>
                        <th className="p-4">Success Rate</th>
                        <th className="p-4">Total Earnings</th>
                        <th className="p-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((userProfile) => (
                        <tr key={userProfile.id} className="border-b border-[#262626]/60 hover:bg-[#111111]/30 transition-colors">
                          <td className="p-4 font-bold text-white">{userProfile.username}</td>
                          <td className="p-4 text-[#A1A1AA] font-semibold">{userProfile.phone_number}</td>
                          <td className="p-4 text-white font-medium">{userProfile.tasks_completed}</td>
                          <td className="p-4 text-[#22C55E] font-bold">{userProfile.success_rate}%</td>
                          <td className="p-4 text-white font-bold">{userProfile.total_earnings.toLocaleString()} TZS</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleToggleUser(userProfile.id)}
                              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                userProfile.status === "active"
                                  ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                                  : "bg-[#22C55E]/10 border-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/20"
                              }`}
                            >
                              {userProfile.status === "active" ? "Suspend Gamer" : "Activate Gamer"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 bg-[#181818] border border-[#262626] border-dashed rounded-2xl text-center text-xs text-[#A1A1AA] max-w-md">
                  No gamers matched your search parameters.
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
