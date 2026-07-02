import React from "react";

interface MobileContainerProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function MobileContainer({ children, showNav = true }: MobileContainerProps) {
  return (
    <div className="min-h-screen w-full bg-black flex justify-center items-start text-white">
      {/* Constraints for mobile views and styling for desktop framing */}
      <div className="w-full max-w-[430px] min-h-screen bg-[#0A0A0A] flex flex-col relative border-x border-[#262626]/40 shadow-2xl">
        <main className={`flex-1 flex flex-col w-full ${showNav ? "pb-24" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
