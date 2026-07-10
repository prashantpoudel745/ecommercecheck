import { useState } from "react";
import AddInvestmentForm from "./AddnewInvestment";
const ClientStatus = () => {
  const [open, setOpen] = useState(false);
  const user = localStorage.getItem("user");
  const userId = JSON.parse(user)._id;
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Client Status</h3>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={() => {
            setOpen(true);
          }}
        >
          <AddInvestmentForm onAddInvestment={() => {}} userId={userId} />
        </button>
      </div>
      <div className="flex mb-4">
        <div className="w-3/4 h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500" style={{ width: "83%" }}></div>
        </div>
        <div className="w-1/4 h-4 bg-gray-200 rounded-full overflow-hidden ml-2">
          <div className="h-full bg-blue-500" style={{ width: "17%" }}></div>
        </div>
      </div>
    </div>
  );
};

export default ClientStatus;
