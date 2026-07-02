"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Image as ImageIcon, Video, UploadCloud, Coins, AlertCircle, FileText, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { MobileContainer } from "@/components/mobile-container";
import { BottomNav } from "@/components/bottom-nav";

export default function SubmitTaskPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const { tasks, user, submitTaskProof, initializeData } = useAppStore();
  const [loading, setLoading] = useState(false);
  
  // Form states
  const [coinsEarned, setCoinsEarned] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // UI states
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [screenshotProgress, setScreenshotProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    initializeData();
  }, [user, initializeData, router]);

  const task = tasks.find(item => item.id === taskId);

  const simulateUpload = (type: "screenshot" | "video") => {
    if (type === "screenshot") {
      setScreenshotUploading(true);
      setScreenshotProgress(10);
      const interval = setInterval(() => {
        setScreenshotProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScreenshotUploading(false);
            // Pre-fill a professional stock screenshot
            setScreenshotUrl("https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600");
            return 100;
          }
          return prev + 30;
        });
      }, 300);
    } else {
      setVideoUploading(true);
      setVideoProgress(5);
      const interval = setInterval(() => {
        setVideoProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setVideoUploading(false);
            setVideoUrl("https://assets.mixkit.co/videos/preview/mixkit-gaming-streamer-playing-a-first-person-shooter-42994-large.mp4");
            return 100;
          }
          return prev + 25;
        });
      }, 400);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const coins = parseInt(coinsEarned);
    if (isNaN(coins) || coins <= 0) {
      setValidationError("Please enter a valid amount of Delta Force coins.");
      return;
    }

    if (!screenshotUrl) {
      setValidationError("Uploading a screenshot proof is mandatory.");
      return;
    }

    setLoading(true);
    try {
      await submitTaskProof(
        taskId, 
        coins, 
        notes, 
        screenshotUrl, 
        videoUrl || undefined
      );
      setSuccess(true);
      setTimeout(() => {
        router.push("/tasks?tab=submissions");
      }, 1800);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to submit. Please try again.";
      setValidationError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return (
      <MobileContainer>
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#22C55E]" />
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col p-4 pb-28">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push(`/tasks/${task.id}`)}
            className="h-10 w-10 bg-[#111111] border border-[#262626] rounded-xl flex items-center justify-center cursor-pointer hover:border-white/10 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider font-bold">Delta Force Task</span>
            <h2 className="text-sm font-bold text-white leading-tight">Submit Evidence</h2>
          </div>
        </div>

        {success ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
            <div className="h-16 w-16 bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} strokeWidth={2.2} />
            </div>
            <h3 className="text-lg font-bold text-white">Evidence Submitted</h3>
            <p className="text-xs text-[#A1A1AA] max-w-[240px]">
              Your proof of completion is pending verification. Admins will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5">
            {validationError && (
              <div className="p-4 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Task Info Row */}
            <div className="p-4 rounded-2xl bg-[#111111] border border-[#262626] flex justify-between items-center">
              <span className="text-xs text-[#A1A1AA] font-medium truncate max-w-[65%]">
                {task.title}
              </span>
              <span className="text-xs font-bold text-[#22C55E]">
                {task.reward_tzs.toLocaleString()} TZS
              </span>
            </div>

            {/* Coins Earned Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
                <Coins size={12} className="text-[#22C55E]" />
                <span>Delta Force Coins Farmed</span>
              </label>
              <input
                type="number"
                value={coinsEarned}
                onChange={(e) => setCoinsEarned(e.target.value)}
                placeholder="e.g. 35000"
                className="w-full bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-2xl py-3.5 px-4 text-sm font-medium transition-colors placeholder:text-[#52525B]"
              />
            </div>

            {/* Screenshot Upload (Simulated) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
                <ImageIcon size={12} className="text-[#22C55E]" />
                <span>Match Screenshot (Required)</span>
              </label>
              
              {screenshotUrl ? (
                <div className="relative rounded-2xl border border-[#262626] overflow-hidden group bg-[#111111] h-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={screenshotUrl} 
                    alt="Loot summary" 
                    className="w-full h-full object-cover opacity-60" 
                  />
                  <div className="absolute inset-0 flex flex-col justify-center items-center p-3 text-center bg-black/40">
                    <span className="text-xs font-bold text-white">screenshot_proof.png</span>
                    <button
                      type="button"
                      onClick={() => setScreenshotUrl(null)}
                      className="mt-2 py-1 px-3 bg-[#EF4444] hover:bg-red-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => simulateUpload("screenshot")}
                  disabled={screenshotUploading}
                  className="h-32 bg-[#111111] border border-dashed border-[#262626] hover:border-[#22C55E]/40 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {screenshotUploading ? (
                    <div className="flex flex-col items-center gap-2 w-full px-8">
                      <div className="w-full bg-[#262626] h-1 rounded-full overflow-hidden">
                        <div className="bg-[#22C55E] h-full" style={{ width: `${screenshotProgress}%` }} />
                      </div>
                      <span className="text-[11px] text-[#A1A1AA]">Uploading screenshot... {screenshotProgress}%</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="text-[#A1A1AA]" size={24} />
                      <span className="text-xs font-bold text-white">Click to Upload Match Result</span>
                      <span className="text-[10px] text-[#A1A1AA]">PNG, JPG up to 5MB</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Video Upload (Simulated Option) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
                <Video size={12} className="text-[#A1A1AA]" />
                <span>Extraction Clip (Optional)</span>
              </label>

              {videoUrl ? (
                <div className="p-3 bg-[#111111] border border-[#262626] rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-[#22C55E]" />
                    <span className="text-xs text-white">extraction_video.mp4</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoUrl(null)}
                    className="text-xs text-[#EF4444] hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => simulateUpload("video")}
                  disabled={videoUploading}
                  className="h-20 bg-[#111111] border border-dashed border-[#262626] hover:border-[#22C55E]/40 rounded-2xl flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-[0.99]"
                >
                  {videoUploading ? (
                    <div className="flex flex-col items-center gap-1 w-full px-8">
                      <div className="w-full bg-[#262626] h-1 rounded-full overflow-hidden">
                        <div className="bg-[#22C55E] h-full" style={{ width: `${videoProgress}%` }} />
                      </div>
                      <span className="text-[10px] text-[#A1A1AA]">Uploading video... {videoProgress}%</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="text-[#A1A1AA]" size={18} />
                      <span className="text-xs font-bold text-white">Click to Upload Video Proof</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Additional Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold tracking-wider text-[#A1A1AA] uppercase flex items-center gap-1.5">
                <FileText size={12} className="text-[#A1A1AA]" />
                <span>Additional Notes</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Squad member was Juma_Fighter. Extracted at Valley North locker."
                rows={3}
                className="w-full bg-[#111111] border border-[#262626] focus:border-[#22C55E] focus:outline-none rounded-2xl py-3 px-4 text-xs font-medium transition-colors placeholder:text-[#52525B] resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || screenshotUploading || videoUploading}
              className="w-full py-4 mt-3 bg-[#22C55E] hover:bg-[#16A34A] disabled:opacity-50 text-[#0A0A0A] font-bold rounded-2xl cursor-pointer transition-all duration-200 text-sm shadow-[0_4px_24px_rgba(34,197,94,0.2)] flex items-center justify-center gap-2"
            >
              {loading ? "Submitting Proof..." : "Submit Verification"}
            </button>
          </form>
        )}
      </div>
      <BottomNav />
    </MobileContainer>
  );
}
