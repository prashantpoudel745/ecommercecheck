import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CURRENCY_SYMBOL } from "@/utils/formatCurrency";

const plans = [
  {
    title: "Beginners",
    price: "2000",
    buttonText: "Get Started",
  },
  {
    title: "Pro",
    price: "5000",
    buttonText: "Upgrade to Pro",
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
      <h1 className="text-3xl font-bold text-center mb-10">
        Subscription Plans
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {plans.map((plan, idx) => (
          <Card key={idx} className="rounded-2xl shadow-lg bg-white">
            <CardContent className="p-6 flex flex-col items-center">
              <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
              <p className="text-xl font-bold mb-4">{CURRENCY_SYMBOL}{plan.price}</p>
              <Button className="w-full text-xs">{plan.buttonText}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
