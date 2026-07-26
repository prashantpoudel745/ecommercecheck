import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";
import { FinanceChartProps } from "../../../types/accounting.types";


export function FinanceChart({ data }: FinanceChartProps) {
  return (
    <Card className="col-span-2 shadow-md rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Financial Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${CURRENCY_SYMBOL}${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  padding: "0.5rem",
                }}
                formatter={(value: number, name: string) => {
                  // Format the name to be more user-friendly
                  const formattedName =
                    name === "income" ? "Income" : "Expenses";
                  return [`${CURRENCY_SYMBOL}${value.toFixed(2)}`, formattedName];
                }}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#16a34a" // green
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#dc2626" // red
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
