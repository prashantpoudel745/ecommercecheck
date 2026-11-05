import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";

const plans = [
  {
    title: "Basic",
    price: "2000",
    requests: "50 AI requests/month",
    buttonText: "Choose Basic",
  },
  {
    title: "Pro",
    price: "5000",
    requests: "200 AI requests/month",
    buttonText: "Upgrade to Pro",
  },
  {
    title: "Premium",
    price: "10000",
    requests: "500 AI requests/month",
    buttonText: "Choose Premium",
  },
];

type SubscriptionPlansProps = {
  authMode?: "login" | "signup";
};

export default function SubscriptionPlans({
  authMode,
}: SubscriptionPlansProps) {
  if (authMode === "login") return null;

  return (
    <div className="py-0 px-1">
      <h1 className="text-3xl font-bold text-center mb-4">
        Subscription Plans
      </h1>
      <p className="mb-4 text-center text-sm text-emerald-700">Pay yearly and save 15%.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <Card key={idx} className="rounded-2xl shadow-lg bg-white">
            <CardContent className="p-4 flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
              <p className="text-xl font-bold mb-4">{CURRENCY_SYMBOL}{plan.price}</p>
              <p className="mb-4 text-sm text-muted-foreground">{plan.requests}</p>
              <Button className="w-full text-xs">{plan.buttonText}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
