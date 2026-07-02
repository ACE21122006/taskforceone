"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  PlusCircle, 
  MinusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from "lucide-react";
import { 
  useAppStore, 
  getAvailableBalance, 
  getPendingBalance, 
  getLifetimeEarnings 
} from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";
import { TransactionsSkeleton } from "@/components/skeleton-loaders";

export default function WalletPage() {
  const router = useRouter();
  const { user, profile, transactions, submissions, tasks, initializeData } = useAppStore();
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

  if (loading || !profile || !user) {
    return (
      <MobileContainer>
        <div className="flex flex-col gap-6 p-4">
          <div className="h-6 w-24 bg-[#1c1c1c] rounded-md animate-pulse" />
          <div className="h-40 w-full bg-[#1c1c1c] rounded-2xl animate-pulse" />
          <TransactionsSkeleton />
        </div>
        <BottomNav />
      </MobileContainer>
    );
  }

  const availableBal = getAvailableBalance(profile, transactions);
  const pendingBal = getPendingBalance(profile, submissions, tasks);
  const lifetimeEar = getLifetimeEarnings(profile);

  // Filter transactions for current user
  const userTransactions = transactions.filter(t => t.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">DF Earn Finance</span>
            <h2 className="text-sm font-bold text-white leading-tight">My Wallet</h2>
          </div>
        </div>

        {/* Balance Card Grid */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Main Card */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-4 relative overflow-hidden">
            <div>
              <span className="text-[10px] font-bold tracking-wider text-[#A1A1AA] uppercase">Available Balance</span>
              <div className="text-3xl font-bold tracking-tight text-white mt-1">
                {availableBal.toLocaleString()} <span className="text-xs text-[#22C55E] font-semibold">TZS</span>
              </div>
            </div>
            
            <button
              onClick={() => router.push("/withdraw")}
              disabled={availableBal <= 0}
              className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 disabled:hover:bg-[#22C55E] text-[#0A0A0A] font-bold rounded-xl cursor-pointer transition-all text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <ArrowUpRight size={14} strokeWidth={2.5} />
              <span>Withdraw to Mobile Money</span>
            </button>
          </div>

          {/* Secondary stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-1.5">
              <span className="text-[10px] text-[#A1A1AA]">Pending Review</span>
              <div className="text-base font-bold text-white">
                {pendingBal.toLocaleString()} TZS
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-1.5">
              <span className="text-[10px] text-[#A1A1AA]">Total Earned</span>
              <div className="text-base font-bold text-[#22C55E]">
                {lifetimeEar.toLocaleString()} TZS
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-xs font-bold tracking-wider text-[#A1A1AA] uppercase mb-3">Transaction History</h3>
          
          {userTransactions.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {userTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3.5 bg-[#181818] border border-[#262626] rounded-2xl flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon based on transaction type */}
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
                      tx.type === "withdrawal" 
                        ? "bg-red-500/10 text-[#EF4444]" 
                        : "bg-[#22C55E]/10 text-[#22C55E]"
                    }`}>
                      {tx.type === "withdrawal" ? <MinusCircle size={16} /> : <PlusCircle size={16} />}
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-white leading-tight">
                        {tx.type === "reward" ? "Task Completed" : tx.type === "withdrawal" ? "Withdrawal" : "Adjustment"}
                      </span>
                      <span className="text-[10px] text-[#A1A1AA] max-w-[200px] truncate">
                        {tx.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-xs font-bold ${
                      tx.type === "withdrawal" ? "text-white" : "text-[#22C55E]"
                    }`}>
                      {tx.type === "withdrawal" ? "-" : "+"}
                      {Math.abs(tx.amount_tzs).toLocaleString()} TZS
                    </span>
                    
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      tx.status === "completed" 
                        ? "text-[#22C55E] bg-[#22C55E]/10" 
                        : tx.status === "pending" 
                          ? "text-[#F59E0B] bg-[#F59E0B]/10" 
                          : "text-[#EF4444] bg-[#EF4444]/10"
                    }`}>
                      {tx.status === "completed" && <CheckCircle2 size={8} />}
                      {tx.status === "pending" && <AlertCircle size={8} />}
                      {tx.status === "rejected" && <XCircle size={8} />}
                      <span className="capitalize">{tx.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-[#181818] border border-[#262626] border-dashed rounded-2xl text-center flex flex-col items-center justify-center gap-2 mt-1">
              <Clock className="text-[#A1A1AA]" size={24} />
              <span className="text-xs font-bold text-white">No transactions yet</span>
              <p className="text-[10px] text-[#A1A1AA] max-w-[180px]">
                Complete your first farming job to see your financial logs here.
              </p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
