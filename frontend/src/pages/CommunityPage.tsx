import React from "react";
import { Trophy, Target, Users, Clock } from "lucide-react";

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Sarah Chen", reduction: 45, avatar: "SC" },
  { rank: 2, name: "Alex Rivera", reduction: 38, avatar: "AR" },
  { rank: 3, name: "Jordan Park", reduction: 32, avatar: "JP" },
  { rank: 4, name: "You", reduction: 28, avatar: "YO", isCurrentUser: true },
  { rank: 5, name: "Morgan Lee", reduction: 25, avatar: "ML" },
];

const MOCK_CHALLENGES = [
  {
    id: 1,
    title: "Car-Free Week",
    description: "Go a full week without driving",
    target: 7,
    progress: 3,
    unit: "days",
    participants: 234,
    daysLeft: 12,
  },
  {
    id: 2,
    title: "Meatless Month",
    description: "Eat plant-based for 30 days",
    target: 30,
    progress: 8,
    unit: "days",
    participants: 567,
    daysLeft: 22,
  },
  {
    id: 3,
    title: "100km Cycling",
    description: "Cycle 100 km this month",
    target: 100,
    progress: 35,
    unit: "km",
    participants: 189,
    daysLeft: 19,
  },
];

/** Community page with leaderboard and challenges */
export default function CommunityPage(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">
          Community
        </h1>
        <p className="text-dark-500 dark:text-dark-400 mt-1">
          Compete, collaborate, and make an impact together
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard */}
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-accent-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
              Leaderboard
            </h2>
          </div>
          <div className="space-y-3">
            {MOCK_LEADERBOARD.map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${user.isCurrentUser ? "bg-primary-50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800" : "bg-dark-50 dark:bg-dark-800/50 hover:bg-dark-100 dark:hover:bg-dark-800"}`}
              >
                <span
                  className={`text-lg font-bold w-8 text-center ${user.rank <= 3 ? "text-accent-500" : "text-dark-400"}`}
                >
                  {user.rank <= 3
                    ? ["🥇", "🥈", "🥉"][user.rank - 1]
                    : `#${user.rank}`}
                </span>
                <div
                  className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold"
                  aria-hidden="true"
                >
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${user.isCurrentUser ? "text-primary-700 dark:text-primary-400" : "text-dark-800 dark:text-dark-200"}`}
                  >
                    {user.name} {user.isCurrentUser && "(You)"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  -{user.reduction}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="glass-card">
          <div className="flex items-center gap-2 mb-6">
            <Target className="w-5 h-5 text-primary-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-dark-900 dark:text-white">
              Active Challenges
            </h2>
          </div>
          <div className="space-y-4">
            {MOCK_CHALLENGES.map((challenge) => {
              const progressPercent = Math.min(
                (challenge.progress / challenge.target) * 100,
                100,
              );
              return (
                <div
                  key={challenge.id}
                  className="p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-dark-800 dark:text-dark-200">
                      {challenge.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-dark-400">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {challenge.daysLeft}d left
                    </div>
                  </div>
                  <p className="text-xs text-dark-500 dark:text-dark-400 mb-3">
                    {challenge.description}
                  </p>
                  <div className="w-full bg-dark-200 dark:bg-dark-700 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                      role="progressbar"
                      aria-valuenow={challenge.progress}
                      aria-valuemin={0}
                      aria-valuemax={challenge.target}
                      aria-label={`${challenge.title} progress`}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-dark-400">
                    <span>
                      {challenge.progress}/{challenge.target} {challenge.unit}
                    </span>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" aria-hidden="true" />
                      {challenge.participants} joined
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
