"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send, Image as ImageIcon, Coins, MessageSquare, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";

function InboxCommsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const msgParam = searchParams.get("msg") || "";

  const { user, messages, sendMessage, initializeData } = useAppStore();
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [inputText, setInputText] = useState(() => msgParam);
  const [coinsSent, setCoinsSent] = useState<string>("");
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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



  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading]);

  // Filter messages for current user
  const userMessages = messages
    .filter(m => m.user_id === user?.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSimulateUpload = () => {
    setIsUploading(true);
    setError(null);
    setTimeout(() => {
      const mockImages = [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=600"
      ];
      const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
      setScreenshotUrl(randomImg);
      setIsUploading(false);
    }, 800);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !screenshotUrl && !coinsSent) return;

    try {
      const parsedCoins = coinsSent ? parseInt(coinsSent) : undefined;
      await sendMessage(inputText, screenshotUrl || undefined, parsedCoins);
      setInputText("");
      setCoinsSent("");
      setScreenshotUrl("");
      setError(null);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to send message.";
      setError(errMsg);
    }
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
      <div className="flex-1 flex flex-col h-full bg-[#0A0A0A] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-[#111111]/80 backdrop-blur-md border-b border-[#262626] z-10">
          <button
            onClick={() => router.push("/dashboard")}
            className="h-10 w-10 bg-[#18181B] border border-[#262626] rounded-xl flex items-center justify-center cursor-pointer hover:border-white/10 transition-colors text-white"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">Direct Comms</span>
            <h2 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
              <MessageSquare size={14} className="text-[#124715]" />
              <span>Admin Chat & Deposits</span>
            </h2>
          </div>
        </div>

        {/* Notice Info */}
        <div className="bg-[#124715]/5 border-b border-[#124715]/10 p-3 text-[10px] text-[#A1A1AA] leading-relaxed flex gap-2 items-center">
          <Coins size={14} className="text-[#124715] shrink-0" />
          <span>Farmed coins are sent directly to the Admin. Send your screenshot proof and specify the amount in the chat below. Admin will verify and manually credit TZS.</span>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-h-[calc(100vh-230px)] scrollbar-none">
          {userMessages.length > 0 ? (
            userMessages.map((msg) => {
              const isAdmin = msg.sender_role === "admin";
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[85%] ${
                    isAdmin ? "self-start items-start" : "self-end items-end"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[9px] text-[#A1A1AA] font-bold">
                      {isAdmin ? "Admin (TFZ Support)" : msg.username || "You"}
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
                        ? "bg-[#18181B] border-[#262626] text-white rounded-tl-none"
                        : "bg-[#124715]/15 border-[#124715]/30 text-white rounded-tr-none"
                    }`}
                  >
                    {/* Coin Transfer Badge */}
                    {msg.coins_sent && (
                      <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 font-bold px-2 py-1 rounded-xl text-[9px] w-fit">
                        <Coins size={11} />
                        <span>{msg.coins_sent.toLocaleString()} Coins Deposited</span>
                      </div>
                    )}

                    {/* Screenshot thumbnail */}
                    {msg.screenshot_url && (
                      <div className="relative rounded-xl overflow-hidden border border-white/10 max-w-[200px] shadow-md mt-0.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.screenshot_url}
                          alt="Farming Proof"
                          className="w-full h-auto object-cover max-h-[140px]"
                        />
                      </div>
                    )}

                    {/* Message text */}
                    {msg.message && <p className="font-medium">{msg.message}</p>}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-8 border border-[#262626] border-dashed rounded-2xl min-h-[220px]">
              <MessageSquare size={28} className="text-[#52525B]" />
              <span className="text-xs font-bold text-white">No Message History</span>
              <p className="text-[11px] text-[#A1A1AA] max-w-[200px]">
                Send your first message or upload coin proof below to start communicating with the admin.
              </p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Box with Attachments option */}
        <div className="p-4 bg-[#111111]/90 border-t border-[#262626] pb-24 z-10 flex flex-col gap-3">
          {error && (
            <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/25 text-[#EF4444] text-[10px] rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Attachment Preview (if any) */}
          {(screenshotUrl || coinsSent || isUploading) && (
            <div className="flex gap-2.5 items-center flex-wrap bg-[#18181B] border border-[#262626] p-2.5 rounded-xl">
              {isUploading && (
                <span className="text-[10px] text-[#A1A1AA] animate-pulse">Uploading proof screenshot...</span>
              )}
              {screenshotUrl && (
                <div className="relative rounded-lg overflow-hidden border border-white/10 h-14 w-14 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={screenshotUrl} alt="Thumbnail preview" className="h-full w-full object-cover" />
                  <button
                    onClick={() => setScreenshotUrl("")}
                    className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black p-0.5 rounded-full text-white cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
              {coinsSent && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold py-1.5 px-3 rounded-xl shrink-0">
                  <Coins size={11} />
                  <span>{parseInt(coinsSent).toLocaleString()} Coins Claimed</span>
                  <button
                    onClick={() => setCoinsSent("")}
                    className="ml-1 text-yellow-500 hover:text-white cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSend} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* Type message input */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type message or details here..."
                className="flex-1 bg-[#18181B] border border-[#262626] focus:border-[#124715] focus:outline-none rounded-xl py-3 px-4 text-xs font-semibold placeholder:text-[#52525B]"
              />

              <button
                type="submit"
                className="h-11 w-11 bg-[#124715] hover:bg-[#124715] text-white rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-md"
              >
                <Send size={15} />
              </button>
            </div>

            <div className="flex gap-2 mt-1">
              {/* Simulate Image Upload Button */}
              <button
                type="button"
                onClick={handleSimulateUpload}
                disabled={isUploading || !!screenshotUrl}
                className="flex-1 py-2 bg-[#18181B] hover:bg-[#262626] disabled:opacity-50 text-[10px] text-[#A1A1AA] hover:text-white font-bold rounded-xl border border-[#262626] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <ImageIcon size={13} className="text-[#124715]" />
                <span>Attach Screenshot Proof</span>
              </button>

              {/* Enter coins amount input */}
              <div className="flex-1 relative flex items-center">
                <Coins size={12} className="absolute left-3 text-yellow-500" />
                <input
                  type="number"
                  value={coinsSent}
                  onChange={(e) => setCoinsSent(e.target.value)}
                  placeholder="Coins sent (e.g. 50k)"
                  className="w-full bg-[#18181B] border border-[#262626] focus:border-yellow-500 focus:outline-none rounded-xl py-2 pl-8 pr-3 text-[10px] font-bold placeholder:text-[#52525B]"
                />
              </div>
            </div>
          </form>
        </div>
      </div>
      <BottomNav />
    </MobileContainer>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={
      <MobileContainer>
        <div className="flex flex-col gap-6 p-4">
          <div className="h-6 w-24 bg-[#1c1c1c] rounded-md animate-pulse" />
          <div className="h-16 w-full bg-[#1c1c1c] rounded-xl animate-pulse" />
          <div className="h-16 w-full bg-[#1c1c1c] rounded-xl animate-pulse" />
        </div>
        <BottomNav />
      </MobileContainer>
    }>
      <InboxCommsContent />
    </Suspense>
  );
}