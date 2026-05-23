import React from 'react';

/**
 * Full page background screen loader with Flipkart brand accent colors.
 */
export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs" id="custom-loader-overlay">
      <div className="relative flex items-center justify-center">
        <!-- Spinner Ring -->
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-solid border-slate-200 border-t-[#2874F0]"></div>
        <!-- Flipkart F Symbol in middle -->
        <span className="absolute text-lg font-bold italic text-[#2874F0]">F</span>
      </div>
      <p className="mt-4 font-medium tracking-wide text-slate-600 animate-pulse text-sm">Loading Flipkart...</p>
    </div>
  );
}
