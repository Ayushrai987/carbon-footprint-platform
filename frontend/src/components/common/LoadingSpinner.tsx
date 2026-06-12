import React from "react";
import { Leaf } from "lucide-react";

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

/** Animated loading spinner with eco theme */
export default function LoadingSpinner({
  fullScreen = false,
  size = "md",
}: LoadingSpinnerProps): React.ReactElement {
  const sizeClasses = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };

  const spinner = (
    <div
      className="flex flex-col items-center gap-3"
      role="status"
      aria-label="Loading"
    >
      <div className={`${sizeClasses[size]} animate-spin text-primary-500`}>
        <Leaf className="w-full h-full" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-950/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">{spinner}</div>
  );
}
