import React from "react";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Timer,
  BarChart3,
} from "lucide-react";
import { StatsCardsProps } from "../../../types/statcard.types";


const StatsCards: React.FC<StatsCardsProps> = ({ stats, period }) => {
  const statCards = [
    {
      title: "Total Days",
      value: stats.totalDays,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Present Days",
      value: stats.presentDays,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Late Days",
      value: stats.lateDays,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Overtime Days",
      value: stats.overtimeDays,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Hours",
      value: `${stats.totalHours.toFixed(1)}h`,
      icon: Timer,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Avg Hours/Day",
      value: `${stats.avgHours.toFixed(1)}h`,
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Statistics</h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
          {period}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 break-words">{card.title}</p>
                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 break-words line-clamp-2">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
