import { useState, useEffect } from "react";
import EmployeeOverview from "@/components/employees/EmployeeOverview";

export default function EmployeePage() {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setRole(parsedUser.role);
    }
    setIsLoading(false);
  }, []);

  if (isLoading) return <div>Loading...</div>;

  if (role !== "admin") {
    return (
      <div className="p-4 text-center text-red-600 font-semibold">
        Only admin can view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employee Management</h1>
      </div>

      <EmployeeOverview />
    </div>
  );
}
