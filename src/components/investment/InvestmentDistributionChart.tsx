import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const InvestmentDistributionChart = ({ investments }) => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    // Clean up function to destroy any existing chart
    const cleanupChart = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };

    // Return early with error message if no data
    if (
      !investments ||
      !Array.isArray(investments) ||
      investments.length === 0
    ) {
      cleanupChart();
      return;
    }

    try {
      // Calculate percentage distribution by category
      const categoryMap = new Map();
      let totalAmount = 0;

      // Sum amounts by category
      investments.forEach((investment) => {
        if (investment && typeof investment.amount === "number") {
          const category = investment.category || "Uncategorized";
          const currentAmount = categoryMap.get(category) || 0;
          categoryMap.set(category, currentAmount + investment.amount);
          totalAmount += investment.amount;
        }
      });

      // Convert to percentage and prepare chart data
      const chartData = Array.from(categoryMap.entries()).map(
        ([category, amount]) => ({
          category,
          amount,
          percentage:
            totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
        })
      );

      // Clean up previous chart instance
      cleanupChart();

      // Create new chart if canvas is available
      if (chartRef.current) {
        const ctx = chartRef.current.getContext("2d");
        if (!ctx) return;

        const labels = chartData.map((item) => item.category);
        const values = chartData.map((item) => item.amount);

        const backgroundColor = [
          "#4F46E5", // Indigo
          "#10B981", // Emerald
          "#F59E0B", // Amber
          "#EF4444", // Red
          "#8B5CF6", // Violet
          "#0EA5E9", // Sky
          "#14B8A6", // Teal
          "#F97316", // Orange
        ];

        chartInstanceRef.current = new Chart(ctx, {
          type: "pie",
          data: {
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: backgroundColor.slice(0, labels.length),
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: document.documentElement.classList.contains('dark') ? '#a1a1aa' : '#52525b',
                  font: {
                    family: "'Inter', sans-serif",
                    weight: 500,
                  }
                }
              },
              tooltip: {
                backgroundColor: 'rgba(24, 24, 27, 0.9)',
                titleColor: '#f4f4f5',
                bodyColor: '#e4e4e7',
                borderColor: 'rgba(63, 63, 70, 0.5)',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const amount = context.raw;
                    const percentage = Math.round((Number(amount) / totalAmount) * 100);
                    return `${label}: ${percentage}% (${new Intl.NumberFormat(
                      "en-US",
                      {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0
                      }
                    ).format(Number(amount))})`;
                  },
                },
              },
            },
          },
        });
      }
    } catch (err) {
      console.error(err);
      cleanupChart();
    }

    // Clean up chart on component unmount
    return cleanupChart;
  }, [investments]);

  const renderContent = () => {
    if (
      !investments ||
      !Array.isArray(investments) ||
      investments.length === 0
    ) {
      return (
        <div className="flex items-center justify-center h-72">
          <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">No investment data available</p>
        </div>
      );
    }

    return (
      <div className="h-72 w-full flex items-center justify-center">
        <canvas ref={chartRef} />
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 drop-shadow-sm">Investment Distribution</h2>
      <div className="flex-1 w-full relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default InvestmentDistributionChart;
