import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Home } from "lucide-react";

/** 404 Not Found page with eco-themed design */
export default function NotFoundPage(): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-mesh bg-gray-50 dark:bg-dark-950 p-4">
      <div className="text-center animate-fade-in max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/25 animate-pulse-slow">
          <Leaf className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-6xl font-bold text-gradient mb-2">404</h1>
        <h2 className="text-xl font-semibold text-dark-800 dark:text-dark-200 mb-3">
          Page Not Found
        </h2>
        <p className="text-dark-500 dark:text-dark-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get
          you back on track to reducing your carbon footprint.
        </p>
        <Link to="/dashboard" className="btn-primary inline-flex">
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
