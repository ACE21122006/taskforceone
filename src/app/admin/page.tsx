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
  MessageSquare
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { 
    user, 
    profile, 
    tasks, 
    transactions, 
    profiles,
    messages,
    createTask, 
    deleteTask, 
    reviewWithdrawal, 
    toggleUserStatus,
    sendMessage,
    distributeMoney,
    initializeData 
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "comms" | "withdrawals" | "users">("overview");
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

  // Search states
  const [userQuery, setUserQuery] = useState("");

  // Comms and money distribution states
  const [selectedGamerId, setSelectedGamerId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState(false);
  const [distributeAmount, setDistributeAmount] = useState("");
  const [distributeDescription, setDistributeDescription] = useState("");

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
    
    // Number of unique gamer threads
    const pendingReviews = Array.from(new Set(messages.map(m => m.user_id))).length;
    
    const pendingWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "pending").length;
    
    const totalRewardsPaid = transactions
      .filter(t => (t.type === "reward" || t.type === "adjustment") && t.status === "completed")
      .reduce((sum, t) => sum + Number(t.amount_tzs), 0);

    return { totalUsers, activeUsers, pendingReviews, pendingWithdrawals, totalRewardsPaid };
  }, [profiles, messages, transactions]);

  // Group messages by user_id to find active threads
  const activeThreads = useMemo(() => {
    const uniqueUserIds = Array.from(new Set(messages.map(m => m.user_id)));
    return uniqueUserIds.map(userId => {
      const userProfile = profiles.find(p => p.id === userId);
      const threadMessages = messages.filter(m => m.user_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const lastMessage = threadMessages[0];
      
      return {
        userId,
        username: userProfile?.username || "Unknown Gamer",
        phone: userProfile?.phone_number || "No Phone",
        lastMessageText: lastMessage?.message || "",
        lastMessageTime: lastMessage?.created_at || "",
        hasScreenshot: !!lastMessage?.screenshot_url,
        coinsSent: lastMessage?.coins_sent
      };
    }).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  }, [messages, profiles]);

  const selectedGamerMessages = useMemo(() => {
    if (!selectedGamerId) return [];
    return messages.filter(m => m.user_id === selectedGamerId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [messages, selectedGamerId]);

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGamerId || !adminReplyText.trim()) return;
    try {
      await sendMessage(adminReplyText, undefined, undefined, selectedGamerId);
      setAdminReplyText("");
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  };

  const handleDistributeMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGamerId || !distributeAmount || !distributeDescription) {
      alert("Please fill in all fields");
      return;
    }
    try {
      await distributeMoney(selectedGamerId, Number(distributeAmount), distributeDescription);
      setIsDistributeModalOpen(false);
      setDistributeAmount("");
      setDistributeDescription("");
    } catch (err) {
      console.error(err);
      alert("Failed to distribute money");
    }
  };



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
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#124715]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-[#111111] border-b border-[#262626] px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#181818] border border-[#262626] rounded-xl flex items-center justify-center font-bold text-red-500">
            TFZ
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Taskforce Zero Admin</h1>
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
            { id: "comms", label: "Gamer Comms / Deposits", icon: MessageSquare, badge: activeThreads.length },
            { id: "withdrawals", label: "Review Withdrawals", icon: ArrowDownToLine, badge: stats.pendingWithdrawals },
            { id: "users", label: "Gamers Database", icon: Users }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as "overview" | "tasks" | "comms" | "withdrawals" | "users")}
                className={`w-full py-3 px-4 rounded-xl flex justify-between items-center font-semibold text-xs transition-colors cursor-pointer text-left ${
                  isActive 
                    ? "bg-[#124715]/15 text-[#124715] border border-[#124715]/20" 
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
                  { label: "Total Registered Gamers", val: stats.totalUsers, icon: Users, color: "text-[#124715]" },
                  { label: "Active Gamers", val: stats.activeUsers, icon: Users, color: "text-[#124715]" },
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
                  <span className="text-3xl font-bold mt-1 text-[#124715]">
                    {stats.totalRewardsPaid.toLocaleString()} TZS
                  </span>
                </div>
                <Coins className="text-[#124715]" size={36} />
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
                  <div className="p-4 rounded-xl bg-[#124715]/10 border border-[#124715]/20 text-[#124715] text-xs font-semibold">
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
                      className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-medium"
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
                        className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-medium"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Est Time</label>
                      <input
                        type="text"
                        value={taskEstTime}
                        onChange={(e) => setTaskEstTime(e.target.value)}
                        placeholder="e.g. 45 mins"
                        className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Difficulty</label>
                      <select
                        value={taskDifficulty}
                        onChange={(e) => setTaskDifficulty(e.target.value as "easy" | "medium" | "hard")}
                        className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-medium"
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
                        className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-2.5 text-xs font-medium"
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
                      className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-medium resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Requirements</label>
                    <textarea
                      value={taskRequirements}
                      onChange={(e) => setTaskRequirements(e.target.value)}
                      placeholder="Minimum level, map settings, loadout items..."
                      rows={2}
                      className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-medium resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Proof Guidelines</label>
                    <textarea
                      value={taskSubmissionRules}
                      onChange={(e) => setTaskSubmissionRules(e.target.value)}
                      placeholder="Screenshot requirement details..."
                      rows={2}
                      className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-medium resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#124715] hover:bg-[#124715] text-white font-semibold rounded-xl text-xs cursor-pointer transition-colors shadow-md mt-2"
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

          {/* TAB 3: GAMER COMMS CENTER */}
          {activeTab === "comms" && (
            <div className="h-[calc(100vh-140px)] flex border border-[#262626] rounded-2xl overflow-hidden bg-[#111111]">
              {/* Left Column: Thread list */}
              <div className="w-80 border-r border-[#262626] flex flex-col bg-[#111111] shrink-0">
                <div className="p-4 border-b border-[#262626]">
                  <h3 className="text-sm font-bold text-white">Active Gamer Threads</h3>
                  <p className="text-[10px] text-[#A1A1AA] mt-0.5">Select a gamer to view coin proofs and chat.</p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[#262626]/60 scrollbar-none">
                  {activeThreads.length > 0 ? (
                    activeThreads.map((thread) => {
                      const isSelected = selectedGamerId === thread.userId;
                      return (
                        <button
                          key={thread.userId}
                          onClick={() => setSelectedGamerId(thread.userId)}
                          className={`w-full p-4 flex flex-col gap-1.5 transition-colors text-left cursor-pointer ${
                            isSelected ? "bg-[#124715]/10" : "hover:bg-[#181818]"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white">{thread.username}</span>
                            <span className="text-[9px] text-[#A1A1AA]">
                              {thread.lastMessageTime ? new Date(thread.lastMessageTime).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit"
                              }) : ""}
                            </span>
                          </div>
                          <span className="text-[9px] text-[#A1A1AA] font-mono">{thread.phone}</span>
                          
                          {/* Last message preview */}
                          <div className="flex items-center gap-1.5 mt-1">
                            {thread.coinsSent && (
                              <span className="bg-yellow-500/15 text-yellow-500 text-[8px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                                <Coins size={8} />
                                <span>{thread.coinsSent.toLocaleString()}</span>
                              </span>
                            )}
                            {thread.hasScreenshot && (
                              <span className="bg-blue-500/15 text-blue-400 text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0">
                                Photo Proof
                              </span>
                            )}
                            <p className="text-[10px] text-[#A1A1AA] truncate flex-1">
                              {thread.lastMessageText}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-8 text-center text-xs text-[#A1A1AA]">
                      No chat threads found.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Chat body */}
              <div className="flex-1 flex flex-col bg-[#0A0A0A]">
                {selectedGamerId ? (
                  <>
                    {/* Selected Gamer Header */}
                    <div className="p-4 bg-[#111111] border-b border-[#262626] flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold text-white">
                          {profiles.find(p => p.id === selectedGamerId)?.username || "Unknown Gamer"}
                        </h3>
                        <span className="text-[10px] text-[#A1A1AA] font-mono">
                          Phone: {profiles.find(p => p.id === selectedGamerId)?.phone_number || "No Phone"}
                        </span>
                      </div>

                      {/* Pay Gamer Button */}
                      <button
                        onClick={() => {
                          setIsDistributeModalOpen(true);
                          setDistributeDescription(`Coin farming payout for ${profiles.find(p => p.id === selectedGamerId)?.username}`);
                        }}
                        className="py-2 px-4 bg-[#124715] hover:bg-[#124715] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-md animate-pulse"
                      >
                        <Coins size={14} />
                        <span>Distribute TZS Money</span>
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 max-h-[calc(100vh-280px)] scrollbar-none">
                      {selectedGamerMessages.map((msg) => {
                        const isAdmin = msg.sender_role === "admin";
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col max-w-[75%] ${
                              isAdmin ? "self-end items-end" : "self-start items-start"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-1 px-1">
                              <span className="text-[9px] text-[#A1A1AA] font-bold">
                                {isAdmin ? "You (Admin)" : msg.username || "Gamer"}
                              </span>
                              <span className="text-[8px] text-[#52525B]">
                                {new Date(msg.created_at).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>

                            <div
                              className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex flex-col gap-2 ${
                                isAdmin
                                  ? "bg-[#124715]/15 border-[#124715]/30 text-white rounded-tr-none"
                                  : "bg-[#18181B] border-[#262626] text-white rounded-tl-none"
                              }`}
                            >
                              {msg.coins_sent && (
                                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold px-2 py-1 rounded-xl text-[9px] w-fit">
                                  <Coins size={11} />
                                  <span>{msg.coins_sent.toLocaleString()} Coins Sent</span>
                                </div>
                              )}

                              {msg.screenshot_url && (
                                <div className="relative rounded-xl overflow-hidden border border-white/10 max-w-[280px] shadow-md mt-0.5">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={msg.screenshot_url}
                                    alt="Farming Proof"
                                    className="w-full h-auto object-cover max-h-[180px]"
                                  />
                                </div>
                              )}

                              {msg.message && <p className="font-medium">{msg.message}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reply Input Form */}
                    <form onSubmit={handleSendAdminReply} className="p-4 bg-[#111111] border-t border-[#262626] flex gap-3">
                      <input
                        type="text"
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder="Type reply to gamer..."
                        className="flex-1 bg-[#18181B] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-3 px-4 text-xs font-semibold placeholder:text-[#52525B]"
                      />
                      <button
                        type="submit"
                        className="py-3 px-6 bg-[#124715] hover:bg-[#124715] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-md flex items-center gap-1.5"
                      >
                        <span>Send Reply</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-8">
                    <MessageSquare size={36} className="text-[#262626]" />
                    <span className="text-sm font-bold text-[#52525B]">No Active Thread Selected</span>
                    <p className="text-xs text-[#52525B] max-w-[240px]">
                      Select a gamer chat from the left sidebar to view details, verify coin proofs, and distribute funds.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Distribute Money Modal/Popup */}
          {isDistributeModalOpen && selectedGamerId && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#181818] border border-[#262626] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button
                  onClick={() => setIsDistributeModalOpen(false)}
                  className="absolute top-4 right-4 text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  <X size={18} />
                </button>
                
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Coins className="text-[#124715]" size={18} />
                  <span>Distribute Money (TZS)</span>
                </h3>
                <p className="text-[11px] text-[#A1A1AA] mb-4">
                  Pay player <strong>{profiles.find(p => p.id === selectedGamerId)?.username}</strong> directly into their available wallet balance.
                </p>

                <form onSubmit={handleDistributeMoney} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">TZS Amount</label>
                    <input
                      type="number"
                      value={distributeAmount}
                      onChange={(e) => setDistributeAmount(e.target.value)}
                      placeholder="e.g. 15000"
                      className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-semibold text-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#A1A1AA] uppercase tracking-wider">Payment Description</label>
                    <input
                      type="text"
                      value={distributeDescription}
                      onChange={(e) => setDistributeDescription(e.target.value)}
                      placeholder="e.g. Completed Valley Run 100k coins payout"
                      className="bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl p-3 text-xs font-medium text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-2 bg-[#124715] hover:bg-[#124715] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-md"
                  >
                    Confirm & Credit Wallet
                  </button>
                </form>
              </div>
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
                              className="p-2 bg-[#124715]/10 hover:bg-[#124715]/20 text-[#124715] rounded-lg cursor-pointer transition-colors"
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
                    className="w-full bg-[#111111] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-2 pl-9 pr-3 text-xs"
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
                          <td className="p-4 text-[#124715] font-bold">{userProfile.success_rate}%</td>
                          <td className="p-4 text-white font-bold">{userProfile.total_earnings.toLocaleString()} TZS</td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedGamerId(userProfile.id);
                                setIsDistributeModalOpen(true);
                                setDistributeDescription(`Manual wallet distribution for ${userProfile.username}`);
                              }}
                              className="py-1.5 px-3 bg-[#124715]/10 hover:bg-[#124715]/20 text-[#124715] border border-[#124715]/25 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                            >
                              Pay Gamer
                            </button>
                            <button
                              onClick={() => handleToggleUser(userProfile.id)}
                              className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                userProfile.status === "active"
                                  ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                                  : "bg-[#124715]/10 border-[#124715]/20 text-[#124715] hover:bg-[#124715]/20"
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