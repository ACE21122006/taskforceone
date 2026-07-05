import { create } from "zustand";
import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  username: string;
  phone_number: string;
  role: "gamer" | "admin";
  status: "active" | "suspended";
  tasks_completed: number;
  success_rate: number;
  total_earnings: number;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  reward_tzs: number;
  difficulty: "easy" | "medium" | "hard";
  deadline: string;
  instructions: string;
  requirements: string;
  submission_rules: string;
  status: "draft" | "published" | "closed";
  est_completion_time: string;
  created_by?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  task_id: string;
  user_id: string;
  screenshot_url?: string;
  video_url?: string;
  coins_earned: number;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  admin_feedback?: string;
  submission_date: string;
  reviewed_at?: string;
  // Joined fields for display
  task_title?: string;
  username?: string;
  phone_number?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount_tzs: number;
  type: "reward" | "withdrawal" | "adjustment";
  description: string;
  status: "pending" | "completed" | "rejected";
  created_at: string;
  username?: string;
}

export interface PayoutMethod {
  id: string;
  user_id: string;
  method: "mpesa" | "airtel_money" | "mixx_by_yas";
  phone_number: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  type: "task_approved" | "task_rejected" | "new_task" | "withdrawal_approved" | "withdrawal_rejected";
  created_at: string;
}

interface SupabaseSubmissionJoin {
  id: string;
  task_id: string;
  user_id: string;
  screenshot_url?: string;
  video_url?: string;
  coins_earned: number;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  admin_feedback?: string;
  submission_date: string;
  reviewed_at?: string;
  tasks: { title: string } | null;
  profiles: { username: string; phone_number: string } | null;
}

interface SupabaseTransactionJoin {
  id: string;
  user_id: string;
  amount_tzs: number;
  type: "reward" | "withdrawal" | "adjustment";
  description: string;
  status: "pending" | "completed" | "rejected";
  created_at: string;
  profiles: { username: string } | null;
}

export interface Message {
  id: string;
  user_id: string;
  sender_role: "gamer" | "admin";
  message: string;
  screenshot_url?: string;
  coins_sent?: number;
  created_at: string;
  username?: string;
}

interface SupabaseMessageJoin {
  id: string;
  user_id: string;
  sender_role: "gamer" | "admin";
  message: string;
  screenshot_url?: string;
  coins_sent?: number;
  created_at: string;
  profiles: { username: string } | null;
}

interface AppState {
  // Config
  isMockMode: boolean;
  setMockMode: (val: boolean) => void;
  
  // Auth state
  user: { id: string; phone?: string } | null;
  profile: UserProfile | null;
  setAuth: (user: { id: string; phone?: string } | null, profile: UserProfile | null) => void;
  logout: () => Promise<void>;
  
  // Core lists
  profiles: UserProfile[];
  tasks: Task[];
  submissions: Submission[];
  transactions: Transaction[];
  payoutMethods: PayoutMethod[];
  notifications: AppNotification[];
  messages: Message[];
  
  // Fetching triggers
  initializeData: () => Promise<void>;
  
  // Gamer actions
  acceptTask: (taskId: string) => Promise<void>;
  submitTaskProof: (
    taskId: string, 
    coins: number, 
    notes: string, 
    screenshot?: string, 
    video?: string
  ) => Promise<void>;
  requestWithdrawal: (method: "mpesa" | "airtel_money" | "mixx_by_yas", phone: string, amount: number) => Promise<{ success: boolean; message: string }>;
  markNotificationRead: (id: string) => Promise<void>;
  sendMessage: (message: string, screenshotUrl?: string, coinsSent?: number, targetUserId?: string) => Promise<void>;
  distributeMoney: (userId: string, amount: number, description: string) => Promise<void>;
  
  // Admin actions
  createTask: (task: Omit<Task, "id" | "created_at" | "status">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reviewSubmission: (id: string, status: "approved" | "rejected", feedback?: string) => Promise<void>;
  reviewWithdrawal: (id: string, status: "completed" | "rejected") => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
}

// Initial Mock Data
const initialMockProfiles: UserProfile[] = [
  {
    id: "gamer-1",
    username: "Juma_Fighter",
    phone_number: "0712345678",
    role: "gamer",
    status: "active",
    tasks_completed: 18,
    success_rate: 94.4,
    total_earnings: 135000,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "admin-1",
    username: "Taskforce_Zero_Manager",
    phone_number: "0788888888",
    role: "admin",
    status: "active",
    tasks_completed: 0,
    success_rate: 100,
    total_earnings: 0,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const initialMockTasks: Task[] = [
  {
    id: "task-1",
    title: "Chemical Plant Raid - Electronic Farm",
    reward_tzs: 7500,
    difficulty: "easy",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    instructions: "Infiltrate the Chemical Plant map. Raid the server room on the 2nd floor, collect at least 3 high-value CPU chips, and extract successfully. Make sure to loot safely.",
    requirements: "Character level 10+, Valley map unlocked.",
    submission_rules: "Upload a screenshot of the Extraction Summary Screen. The screenshot must clearly display your in-game username and the items successfully extracted.",
    status: "published",
    est_completion_time: "20 mins",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-2",
    title: "Valley Map - T3 Weapon Crate Extraction",
    reward_tzs: 18000,
    difficulty: "medium",
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    instructions: "Locate and open at least 2 Tier-3 military weapon boxes in the radar station on the Valley map. Extract with the contents successfully.",
    requirements: "Valley map unlocked. Loadout value > 50k coins.",
    submission_rules: "Provide a screenshot of the end-of-match loot summary and a brief video clip showing the radar station loot container opening.",
    status: "published",
    est_completion_time: "45 mins",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "task-3",
    title: "Space Station - Elite Extraction Challenge",
    reward_tzs: 50000,
    difficulty: "hard",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    instructions: "Defend the Space Station main console from Elite NPC waves. Extract with the Core Container. Requires extreme tactical cooperation or top-tier gear.",
    requirements: "Character level 25+. Tier 5 armor and weapon.",
    submission_rules: "Full video upload of the extraction or consecutive screenshots showing the entire console defense event and match summary.",
    status: "published",
    est_completion_time: "60 mins",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

const initialMockSubmissions: Submission[] = [
  {
    id: "sub-1",
    task_id: "task-1",
    user_id: "gamer-1",
    screenshot_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
    coins_earned: 15000,
    notes: "Easy run, got 4 CPU chips and extracted safely within 15 minutes.",
    status: "approved",
    admin_feedback: "Well done! Clean screenshot.",
    submission_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    task_title: "Chemical Plant Raid - Electronic Farm",
    username: "Juma_Fighter",
    phone_number: "0712345678"
  }
];

const initialMockTransactions: Transaction[] = [
  {
    id: "tx-1",
    user_id: "gamer-1",
    amount_tzs: 7500,
    type: "reward",
    description: "Reward for Chemical Plant Raid - Electronic Farm",
    status: "completed",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    username: "Juma_Fighter"
  },
  {
    id: "tx-2",
    user_id: "gamer-1",
    amount_tzs: -5000,
    type: "withdrawal",
    description: "M-Pesa withdrawal request",
    status: "completed",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    username: "Juma_Fighter"
  }
];

const initialMockNotifications: AppNotification[] = [
  {
    id: "notif-1",
    user_id: "gamer-1",
    title: "Task Approved",
    message: "Your proof of completion for 'Chemical Plant Raid' has been approved. 7,500 TZS added to wallet.",
    is_read: false,
    type: "task_approved",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "notif-2",
    user_id: "gamer-1",
    title: "Withdrawal Approved",
    message: "Your withdrawal of 5,000 TZS to M-Pesa has been approved and processed.",
    is_read: true,
    type: "withdrawal_approved",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  }
];

const initialMockMessages: Message[] = [
  {
    id: "msg-1",
    user_id: "gamer-1",
    sender_role: "gamer",
    message: "Hey admin, I've completed the Chemical Plant Raid and farmed 150,000 Delta Force Coins. I am transferring them to you now.",
    screenshot_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
    coins_sent: 150000,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    username: "Juma_Fighter"
  },
  {
    id: "msg-2",
    user_id: "gamer-1",
    sender_role: "admin",
    message: "Got it, Juma! I verified the transaction on the in-game account. I have credited your wallet with 15,000 TZS.",
    created_at: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    username: "Taskforce_Zero_Manager"
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  isMockMode: true,
  setMockMode: (val) => set({ isMockMode: val }),
  
  user: null,
  profile: null,
  
  profiles: initialMockProfiles,
  tasks: initialMockTasks,
  submissions: initialMockSubmissions,
  transactions: initialMockTransactions,
  payoutMethods: [],
  notifications: initialMockNotifications,
  messages: initialMockMessages,
  
  setAuth: (user, profile) => set({ user, profile }),
  
  logout: async () => {
    const { isMockMode } = get();
    if (!isMockMode) {
      await supabase.auth.signOut();
    }
    set({ user: null, profile: null });
  },
  
  initializeData: async () => {
    const { isMockMode } = get();
    if (isMockMode) {
      // Data already initialized with mock data
      return;
    }
    
    try {
      // Fetch profiles
      const { data: profiles } = await supabase.from("profiles").select("*");
      // Fetch tasks
      const { data: tasks } = await supabase.from("tasks").select("*");
      // Fetch submissions
      const { data: submissions } = await supabase.from("submissions").select(`
        *,
        tasks (title),
        profiles (username, phone_number)
      `);
      // Fetch transactions
      const { data: transactions } = await supabase.from("transactions").select(`
        *,
        profiles (username)
      `);
      // Fetch payout methods
      const { data: payoutMethods } = await supabase.from("payout_methods").select("*");
      // Fetch notifications
      const { data: notifications } = await supabase.from("notifications").select("*");
      // Fetch messages
      const { data: messages } = await supabase.from("messages").select(`
        *,
        profiles (username)
      `);
      
      set({
        profiles: profiles || [],
        tasks: tasks || [],
        submissions: (submissions || []).map((s: SupabaseSubmissionJoin) => ({
          ...s,
          task_title: s.tasks?.title,
          username: s.profiles?.username,
          phone_number: s.profiles?.phone_number
        })),
        transactions: (transactions || []).map((t: SupabaseTransactionJoin) => ({
          ...t,
          username: t.profiles?.username
        })),
        payoutMethods: payoutMethods || [],
        notifications: notifications || [],
        messages: (messages || []).map((m: SupabaseMessageJoin) => ({
          ...m,
          username: m.profiles?.username
        }))
      });
    } catch (err) {
      console.error("Error initializing Supabase data:", err);
    }
  },
  
  acceptTask: async () => {
    const { user } = get();
    if (!user) return;
    
    // For demo flow, accept task moves it to a active state for the user
    // In our database structure, accepting a task means we can track active tasks in My Tasks view
    // Or we create a submission in 'draft' or 'pending' state
  },
  
  submitTaskProof: async (taskId, coins, notes, screenshot, video) => {
    const { isMockMode, user, tasks, submissions, initializeData } = get();
    if (!user) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (isMockMode) {
      const newSubmission: Submission = {
        id: "sub-" + Math.random().toString(36).substring(2, 9),
        task_id: taskId,
        user_id: user.id,
        coins_earned: coins,
        notes: notes,
        screenshot_url: screenshot || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
        video_url: video,
        status: "pending",
        submission_date: new Date().toISOString(),
        task_title: task.title,
        username: get().profile?.username || "You",
        phone_number: get().profile?.phone_number || "0712345678"
      };
      
      set({
        submissions: [newSubmission, ...submissions]
      });
    } else {
      const { error } = await supabase.from("submissions").insert({
        task_id: taskId,
        user_id: user.id,
        coins_earned: coins,
        notes: notes,
        screenshot_url: screenshot,
        video_url: video,
        status: "pending"
      });
      if (error) throw error;
      await initializeData();
    }
  },
  
  requestWithdrawal: async (method, phone, amount) => {
    const { isMockMode, user, profile, transactions, initializeData } = get();
    if (!user || !profile) return { success: false, message: "User not authenticated" };
    
    if (profile.total_earnings - (profile.tasks_completed * 10) < amount && getAvailableBalance(profile, transactions) < amount) {
      return { success: false, message: "Insufficient balance" };
    }
    
    if (isMockMode) {
      // Add transaction
      const newTx: Transaction = {
        id: "tx-" + Math.random().toString(36).substring(2, 9),
        user_id: user.id,
        amount_tzs: -amount,
        type: "withdrawal",
        description: `${method.toUpperCase().replace("_", " ")} withdrawal request to ${phone}`,
        status: "pending",
        created_at: new Date().toISOString(),
        username: profile.username
      };
      
      set({
        transactions: [newTx, ...transactions]
      });
      
      return { success: true, message: "Withdrawal request submitted successfully" };
    } else {
      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        amount_tzs: -amount,
        type: "withdrawal",
        description: `${method.toUpperCase().replace("_", " ")} withdrawal request to ${phone}`,
        status: "pending"
      });
      if (error) return { success: false, message: error.message };
      await initializeData();
      return { success: true, message: "Withdrawal request submitted successfully" };
    }
  },
  
  markNotificationRead: async (id) => {
    const { isMockMode, notifications, initializeData } = get();
    if (isMockMode) {
      set({
        notifications: notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
      });
    } else {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      await initializeData();
    }
  },
  
  sendMessage: async (messageText, screenshotUrl, coinsSent, targetUserId) => {
    const { isMockMode, user, profile, messages, initializeData } = get();
    if (!user) return;

    const senderRole = profile?.role || "gamer";
    const userId = senderRole === "admin" ? (targetUserId || "") : user.id;

    if (isMockMode) {
      const newMsg: Message = {
        id: "msg-" + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        sender_role: senderRole,
        message: messageText,
        screenshot_url: screenshotUrl,
        coins_sent: coinsSent,
        created_at: new Date().toISOString(),
        username: profile?.username || "System"
      };
      
      set({
        messages: [...messages, newMsg]
      });
    } else {
      const { error } = await supabase.from("messages").insert({
        user_id: userId,
        sender_role: senderRole,
        message: messageText,
        screenshot_url: screenshotUrl,
        coins_sent: coinsSent
      });
      if (error) throw error;
      await initializeData();
    }
  },

  distributeMoney: async (userId, amount, description) => {
    const { isMockMode, transactions, profiles, notifications, initializeData } = get();
    
    if (isMockMode) {
      const newTx: Transaction = {
        id: "tx-" + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        amount_tzs: amount,
        type: "adjustment",
        description: description,
        status: "completed",
        created_at: new Date().toISOString(),
        username: profiles.find(p => p.id === userId)?.username || "Gamer"
      };

      const updatedProfiles = profiles.map(p => {
        if (p.id === userId) {
          return {
            ...p,
            total_earnings: Number(p.total_earnings) + amount
          };
        }
        return p;
      });

      const newNotif: AppNotification = {
        id: "notif-" + Math.random().toString(36).substring(2, 9),
        user_id: userId,
        title: "Funds Distributed",
        message: `Admin has credited your wallet with ${amount.toLocaleString()} TZS. Description: ${description}`,
        is_read: false,
        type: "withdrawal_approved",
        created_at: new Date().toISOString()
      };

      const currentUserProfile = get().profile;
      let newCurrentProfile = currentUserProfile;
      if (currentUserProfile && currentUserProfile.id === userId) {
        newCurrentProfile = updatedProfiles.find(p => p.id === currentUserProfile.id) || currentUserProfile;
      }

      set({
        transactions: [newTx, ...transactions],
        profiles: updatedProfiles,
        notifications: [newNotif, ...notifications],
        profile: newCurrentProfile
      });
    } else {
      await supabase.from("transactions").insert({
        user_id: userId,
        amount_tzs: amount,
        type: "adjustment",
        description: description,
        status: "completed"
      });

      const targetProfile = profiles.find(p => p.id === userId);
      if (targetProfile) {
        await supabase.from("profiles").update({
          total_earnings: Number(targetProfile.total_earnings) + amount
        }).eq("id", userId);
      }

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Funds Distributed",
        message: `Admin has credited your wallet with ${amount.toLocaleString()} TZS. Description: ${description}`,
        type: "withdrawal_approved"
      });

      await initializeData();
    }
  },
  
  createTask: async (taskInput) => {
    const { isMockMode, tasks, initializeData } = get();
    if (isMockMode) {
      const newTask: Task = {
        ...taskInput,
        id: "task-" + Math.random().toString(36).substring(2, 9),
        status: "published",
        created_at: new Date().toISOString()
      };
      set({
        tasks: [newTask, ...tasks]
      });
    } else {
      await supabase.from("tasks").insert(taskInput);
      await initializeData();
    }
  },
  
  updateTask: async (id, updates) => {
    const { isMockMode, tasks, initializeData } = get();
    if (isMockMode) {
      set({
        tasks: tasks.map(t => t.id === id ? { ...t, ...updates } : t)
      });
    } else {
      await supabase.from("tasks").update(updates).eq("id", id);
      await initializeData();
    }
  },
  
  deleteTask: async (id) => {
    const { isMockMode, tasks, initializeData } = get();
    if (isMockMode) {
      set({
        tasks: tasks.filter(t => t.id !== id)
      });
    } else {
      await supabase.from("tasks").delete().eq("id", id);
      await initializeData();
    }
  },
  
  reviewSubmission: async (id, status, feedback) => {
    const { isMockMode, submissions, transactions, profiles, notifications, initializeData } = get();
    const submission = submissions.find(s => s.id === id);
    if (!submission) return;
    
    if (isMockMode) {
      // 1. Update submission state
      const updatedSubmissions = submissions.map(s => 
        s.id === id 
          ? { ...s, status, admin_feedback: feedback, reviewed_at: new Date().toISOString() } 
          : s
      );
      
      // 2. Add Transaction if Approved
      let updatedTransactions = [...transactions];
      let updatedProfiles = [...profiles];
      
      if (status === "approved") {
        const task = get().tasks.find(t => t.id === submission.task_id);
        const reward = task ? task.reward_tzs : 5000;
        
        const newTx: Transaction = {
          id: "tx-" + Math.random().toString(36).substring(2, 9),
          user_id: submission.user_id,
          amount_tzs: reward,
          type: "reward",
          description: `Reward for ${submission.task_title || "Farming Task"}`,
          status: "completed",
          created_at: new Date().toISOString(),
          username: submission.username
        };
        updatedTransactions = [newTx, ...transactions];
        
        // Update user stats
        updatedProfiles = profiles.map(p => {
          if (p.id === submission.user_id) {
            const prevTotal = p.success_rate > 0 ? p.tasks_completed / (p.success_rate / 100) : 0;
            const newTotal = Math.max(1, prevTotal + 1);
            const newRate = Number(((p.tasks_completed + 1) / newTotal * 100).toFixed(1));
            return {
              ...p,
              tasks_completed: p.tasks_completed + 1,
              total_earnings: p.total_earnings + reward,
              success_rate: isNaN(newRate) ? 100.00 : newRate
            };
          }
          return p;
        });
      } else if (status === "rejected") {
        updatedProfiles = profiles.map(p => {
          if (p.id === submission.user_id) {
            const prevTotal = p.success_rate > 0 ? p.tasks_completed / (p.success_rate / 100) : 0;
            const newTotal = Math.max(1, prevTotal + 1);
            const newRate = Number((p.tasks_completed / newTotal * 100).toFixed(1));
            return {
              ...p,
              success_rate: isNaN(newRate) ? 100.00 : newRate
            };
          }
          return p;
        });
      }
      
      // 3. Add Notification
      const newNotif: AppNotification = {
        id: "notif-" + Math.random().toString(36).substring(2, 9),
        user_id: submission.user_id,
        title: status === "approved" ? "Task Approved" : "Task Rejected",
        message: status === "approved" 
          ? `Your submission for '${submission.task_title}' was approved! Earnings added.` 
          : `Your submission for '${submission.task_title}' was rejected. Reason: ${feedback || "Incorrect proof."}`,
        is_read: false,
        type: status === "approved" ? "task_approved" : "task_rejected",
        created_at: new Date().toISOString()
      };
      
      // Sync auth profile if it's the current user
      const currentUserProfile = get().profile;
      let newCurrentProfile = currentUserProfile;
      if (currentUserProfile && currentUserProfile.id === submission.user_id) {
        newCurrentProfile = updatedProfiles.find(p => p.id === currentUserProfile.id) || currentUserProfile;
      }
      
      set({
        submissions: updatedSubmissions,
        transactions: updatedTransactions,
        profiles: updatedProfiles,
        notifications: [newNotif, ...notifications],
        profile: newCurrentProfile
      });
    } else {
      // Supabase transaction handling
      await supabase.from("submissions").update({ 
        status, 
        admin_feedback: feedback,
        reviewed_at: new Date().toISOString()
      }).eq("id", id);
      
      if (status === "approved") {
        const task = get().tasks.find(t => t.id === submission.task_id);
        const reward = task ? task.reward_tzs : 5000;
        
        // Add transaction
        await supabase.from("transactions").insert({
          user_id: submission.user_id,
          amount_tzs: reward,
          type: "reward",
          description: `Reward for ${submission.task_title || "Farming Task"}`,
          status: "completed"
        });
        
        // Update profile
        const targetProfile = profiles.find(p => p.id === submission.user_id);
        if (targetProfile) {
          await supabase.from("profiles").update({
            tasks_completed: targetProfile.tasks_completed + 1,
            total_earnings: targetProfile.total_earnings + reward
          }).eq("id", submission.user_id);
        }
      }
      
      // Add notification
      await supabase.from("notifications").insert({
        user_id: submission.user_id,
        title: status === "approved" ? "Task Approved" : "Task Rejected",
        message: status === "approved" 
          ? `Your submission for '${submission.task_title}' was approved! Earnings added.` 
          : `Your submission for '${submission.task_title}' was rejected. Reason: ${feedback || "Incorrect proof."}`,
        type: status === "approved" ? "task_approved" : "task_rejected"
      });
      
      await initializeData();
    }
  },
  
  reviewWithdrawal: async (id, status) => {
    const { isMockMode, transactions, notifications, initializeData } = get();
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    
    if (isMockMode) {
      const updatedTx = transactions.map(t => 
        t.id === id ? { ...t, status: status } : t
      );
      
      const newNotif: AppNotification = {
        id: "notif-" + Math.random().toString(36).substring(2, 9),
        user_id: tx.user_id,
        title: status === "completed" ? "Withdrawal Approved" : "Withdrawal Rejected",
        message: status === "completed"
          ? `Your withdrawal of ${Math.abs(tx.amount_tzs).toLocaleString()} TZS was processed successfully.`
          : `Your withdrawal of ${Math.abs(tx.amount_tzs).toLocaleString()} TZS was rejected. Funds returned.`,
        is_read: false,
        type: status === "completed" ? "withdrawal_approved" : "withdrawal_rejected",
        created_at: new Date().toISOString()
      };
      
      set({
        transactions: updatedTx,
        notifications: [newNotif, ...notifications]
      });
    } else {
      await supabase.from("transactions").update({ 
        status: status === "completed" ? "completed" : "rejected" 
      }).eq("id", id);
      
      await supabase.from("notifications").insert({
        user_id: tx.user_id,
        title: status === "completed" ? "Withdrawal Approved" : "Withdrawal Rejected",
        message: status === "completed"
          ? `Your withdrawal of ${Math.abs(tx.amount_tzs).toLocaleString()} TZS was processed successfully.`
          : `Your withdrawal of ${Math.abs(tx.amount_tzs).toLocaleString()} TZS was rejected.`,
        type: status === "completed" ? "withdrawal_approved" : "withdrawal_rejected"
      });
      
      await initializeData();
    }
  },
  
  toggleUserStatus: async (userId) => {
    const { isMockMode, profiles, initializeData } = get();
    const targetProfile = profiles.find(p => p.id === userId);
    if (!targetProfile) return;
    
    const newStatus = targetProfile.status === "active" ? "suspended" : "active";
    
    if (isMockMode) {
      set({
        profiles: profiles.map(p => p.id === userId ? { ...p, status: newStatus } : p)
      });
    } else {
      await supabase.from("profiles").update({ status: newStatus }).eq("id", userId);
      await initializeData();
    }
  }
}));

// Utility Helpers for Balance calculations
export function getAvailableBalance(profile: UserProfile | null, transactions: Transaction[]): number {
  if (!profile) return 0;
  
  // Available balance is sum of completed rewards/adjustments minus completed/pending withdrawals
  const userTx = transactions.filter(t => t.user_id === profile.id);
  const rewards = userTx
    .filter(t => (t.type === "reward" || t.type === "adjustment") && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount_tzs), 0);
    
  const withdrawals = userTx
    .filter(t => t.type === "withdrawal" && (t.status === "completed" || t.status === "pending"))
    .reduce((sum, t) => sum + Math.abs(Number(t.amount_tzs)), 0);
    
  return Math.max(0, rewards - withdrawals);
}

export function getPendingBalance(profile: UserProfile | null, submissions: Submission[], tasks: Task[]): number {
  if (!profile) return 0;
  
  // Pending balance is rewards of pending submissions
  const userSubs = submissions.filter(s => s.user_id === profile.id && s.status === "pending");
  return userSubs.reduce((sum, s) => {
    const task = tasks.find(t => t.id === s.task_id);
    return sum + (task ? Number(task.reward_tzs) : 0);
  }, 0);
}

export function getLifetimeEarnings(profile: UserProfile | null): number {
  if (!profile) return 0;
  return profile.total_earnings;
}
