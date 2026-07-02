import React from "react";

export function SkeletonBase({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#1c1c1c] rounded-xl ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Header Profile Skeleton */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SkeletonBase className="h-10 w-10 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-3 w-16" />
          </div>
        </div>
        <SkeletonBase className="h-8 w-8 rounded-lg" />
      </div>

      {/* Wallet Card Skeleton */}
      <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-4">
        <SkeletonBase className="h-3 w-32" />
        <SkeletonBase className="h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 mt-2 pt-4 border-t border-[#262626]/60">
          <div className="flex flex-col gap-1.5">
            <SkeletonBase className="h-3 w-20" />
            <SkeletonBase className="h-5 w-24" />
          </div>
          <div className="flex flex-col gap-1.5">
            <SkeletonBase className="h-3 w-20" />
            <SkeletonBase className="h-5 w-24" />
          </div>
        </div>
      </div>

      {/* Active Tasks Header */}
      <div className="flex justify-between items-center mt-2">
        <SkeletonBase className="h-5 w-32" />
        <SkeletonBase className="h-4 w-16" />
      </div>

      {/* Current Task Card Skeleton */}
      <div className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <SkeletonBase className="h-5 w-48" />
          <SkeletonBase className="h-5 w-16" />
        </div>
        <SkeletonBase className="h-3 w-full" />
        <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#262626]/40">
          <SkeletonBase className="h-3 w-24" />
          <SkeletonBase className="h-8 w-24" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <SkeletonBase className="h-20 w-full" />

      {/* Activity Feed Skeleton */}
      <div className="flex flex-col gap-3">
        <SkeletonBase className="h-5 w-36" />
        <SkeletonBase className="h-12 w-full" />
        <SkeletonBase className="h-12 w-full" />
      </div>
    </div>
  );
}

export function TaskFeedSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search & Filters */}
      <SkeletonBase className="h-10 w-full" />
      <div className="flex gap-2 overflow-x-hidden">
        <SkeletonBase className="h-8 w-16" />
        <SkeletonBase className="h-8 w-16" />
        <SkeletonBase className="h-8 w-16" />
        <SkeletonBase className="h-8 w-24" />
      </div>

      {/* Task cards */}
      <div className="flex flex-col gap-3.5 mt-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="p-4 rounded-2xl bg-[#181818] border border-[#262626] flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <SkeletonBase className="h-5 w-44" />
              <SkeletonBase className="h-5 w-20" />
            </div>
            <div className="flex gap-2">
              <SkeletonBase className="h-4 w-16" />
              <SkeletonBase className="h-4 w-20" />
            </div>
            <div className="flex justify-between items-center mt-2 pt-3 border-t border-[#262626]/40">
              <SkeletonBase className="h-3 w-24" />
              <SkeletonBase className="h-9 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4">
      <SkeletonBase className="h-6 w-3/4" />
      <SkeletonBase className="h-10 w-32" />
      <SkeletonBase className="h-40 w-full" />
      <SkeletonBase className="h-24 w-full" />
      <SkeletonBase className="h-24 w-full" />
      <SkeletonBase className="h-12 w-full mt-4" />
    </div>
  );
}

export function TransactionsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 4].map((n) => (
        <div key={n} className="p-3.5 rounded-2xl bg-[#181818] border border-[#262626] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <SkeletonBase className="h-9 w-9 rounded-xl" />
            <div className="flex flex-col gap-1.5">
              <SkeletonBase className="h-4 w-24" />
              <SkeletonBase className="h-3 w-16" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <SkeletonBase className="h-4 w-20" />
            <SkeletonBase className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
