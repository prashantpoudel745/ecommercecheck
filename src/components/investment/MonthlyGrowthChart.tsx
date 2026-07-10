import React, { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from "chart.js";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";

// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip
);

interface Investment {
  amount: number;
  date: string; // Assuming date is in ISO format "YYYY-MM-DD"
}

interface MonthlyGrowthChartProps {
  investments: Investment[];
}

const MonthlyGrowthChart: React.FC<MonthlyGrowthChartProps> = ({
  investments,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!investments || investments.length === 0) return;

    // Process investment data to get monthly totals
    const monthlyData = processInvestmentData(investments);

    if (chartRef.current) {
      // Destroy previous chart instance if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart instance
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: monthlyData.categories,
            datasets: [
              {
                label: "Investment Value",
                data: monthlyData.values,
                borderColor: "#4F46E5",
                backgroundColor: "rgba(79, 70, 229, 0.1)",
                borderWidth: 3,
                tension: 0.4, // Smooth curve
                pointBackgroundColor: "#4F46E5",
                pointRadius: 4,
                pointHoverRadius: 6,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              tooltip: {
                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                titleColor: '#f4f4f5',
                bodyColor: '#e4e4e7',
                borderColor: 'rgba(63, 63, 70, 0.5)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: function (context) {
                    return ` ${CURRENCY_SYMBOL}${context.raw.toLocaleString()}`;
                  },
                },
              },
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                  color: document.documentElement.classList.contains('dark') ? '#a1a1aa' : '#71717a',
                  font: {
                    family: "'Inter', sans-serif"
                  }
                }
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: document.documentElement.classList.contains('dark') ? '#a1a1aa' : '#71717a',
                  font: {
                    family: "'Inter', sans-serif"
                  }
                }
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [investments]);

  /**
   * Process investment data to get monthly totals
   */
  const processInvestmentData = (
    investments: Investment[]
  ): {
    categories: string[];
    values: number[];
  } => {
    const monthlyTotals: Record<string, number> = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Initialize all months with 0
    monthNames.forEach((month) => {
      monthlyTotals[month] = 0;
    });

    // Sum investments by month
    investments.forEach((investment) => {
      try {
        const date = new Date(investment.date);
        const month = date.getMonth(); // 0-11
        const monthName = monthNames[month];

        if (monthName) {
          monthlyTotals[monthName] += investment.amount;
        }
      } catch (e) {
        console.error("Error processing investment date:", e);
      }
    });

    // Convert to arrays for chart
    const categories = monthNames;
    const values = monthNames.map((month) => monthlyTotals[month]);

    return { categories, values };
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 drop-shadow-sm">Monthly Investment</h3>
      <div className="flex-1 w-full min-h-[250px] relative">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default MonthlyGrowthChart;
