"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import { useAppStore, getAvailableBalance } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";

export default function WithdrawPage() {
  const router = useRouter();
  const { user, profile, transactions, requestWithdrawal, initializeData } = useAppStore();

  const [method, setMethod] = useState<"mpesa" | "airtel_money" | "mixx_by_yas" | "halo_pesa">("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    initializeData();
  }, [user, initializeData, router]);

  const availableBal = profile ? getAvailableBalance(profile, transactions) : 0;
  
  // Calculate fees: flat 500 TZS fee, typical for mobile money transfers in Tanzania
  const fee = 500;
  const withdrawAmount = parseFloat(amount) || 0;
  const finalAmount = Math.max(0, withdrawAmount - fee);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phoneNumber || !amount) {
      setError("Please fill in all fields.");
      return;
    }

    const phoneRegex = /^(06|07|255)\d{8}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Invalid phone. Use Tanzanian format: 07XXXXXXXX or 06XXXXXXXX.");
      return;
    }

    const value = parseFloat(amount);
    if (isNaN(value) || value < 1000) {
      setError("Minimum withdrawal amount is 1,000 TZS.");
      return;
    }

    if (value > availableBal) {
      setError("Amount exceeds your available balance.");
      return;
    }

    setLoading(true);
    try {
      const res = await requestWithdrawal(method, phoneNumber, value);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/wallet");
        }, 2000);
      } else {
        setError(res.message);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to submit withdrawal request.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-4 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/wallet")}
            className="h-10 w-10 bg-[#111111] border border-[#262626] rounded-xl flex items-center justify-center cursor-pointer hover:border-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">Payouts</span>
            <h2 className="text-sm font-bold text-white leading-tight">Withdrawal</h2>
          </div>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
            <div className="h-16 w-16 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} strokeWidth={2.2} />
            </div>
            <h3 className="text-lg font-bold text-white">Request Submitted</h3>
            <p className="text-xs text-[#A1A1AA] max-w-[240px]">
              Your withdrawal of {withdrawAmount.toLocaleString()} TZS is pending processing.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
            {error && (
              <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Balances Display */}
            <div className="p-4 rounded-2xl bg-[#111111] border border-[#262626] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-[#22C55E]" />
                <span className="text-xs text-[#A1A1AA] font-semibold">Available for cashout</span>
              </div>
              <span className="text-sm font-bold text-white">
                {availableBal.toLocaleString()} TZS
              </span>
            </div>

            {/* Methods Select */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                Choose Mobile Money Provider
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: "mpesa", label: "M-Pesa" },
                  { id: "airtel_money", label: "Airtel Money" },
                  { id: "mixx_by_yas", label: "Mixx by Yas" },
                  { id: "halo_pesa", label: "Halo Pesa" }
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setMethod(prov.id as "mpesa" | "airtel_money" | "mixx_by_yas" | "halo_pesa")}
                    className={`py-3 px-2 text-center text-xs font-bold rounded-xl cursor-pointer border transition-colors ${
                      method === prov.id 
                        ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]" 
                        : "bg-[#181818] border-[#262626] text-[#A1A1AA] hover:text-white"
                    }`}
                  >
                    {prov.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Phone number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                Recipient Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0712345678"
                className="w-full bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-2xl py-3.5 px-4 text-sm font-medium transition-colors placeholder:text-[#52525B]"
              />
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase">
                  Withdrawal Amount (TZS)
                </label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBal.toString())}
                  className="text-xs text-[#22C55E] hover:underline cursor-pointer"
                >
                  Use Max
                </button>
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min 1,000 TZS"
                className="w-full bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-2xl py-3.5 px-4 text-sm font-medium transition-colors placeholder:text-[#52525B]"
              />
            </div>

            {/* Calculation summary */}
            <div className="p-4 bg-[#181818] border border-[#262626] rounded-2xl flex flex-col gap-2 mt-2">
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Transaction Fee</span>
                <span>{fee.toLocaleString()} TZS</span>
              </div>
              <div className="flex justify-between text-xs text-[#A1A1AA] border-t border-[#262626]/80 pt-2 font-bold">
                <span className="text-white">Amount You Receive</span>
                <span className="text-[#22C55E]">{finalAmount.toLocaleString()} TZS</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || availableBal <= 0}
              className="w-full py-4 mt-2 bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-[#0A0A0A] font-bold rounded-2xl cursor-pointer transition-all duration-200 text-sm shadow-[0_4px_24px_rgba(34,197,94,0.2)] flex items-center justify-center gap-1.5"
            >
              {loading ? "Processing Cashout..." : "Submit Withdrawal Request"}
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </form>
        )}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
