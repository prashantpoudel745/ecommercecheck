// src/components/Dashboard/AddnewInvestment.jsx
import { useState } from "react";
import { toast } from "@/utils/notify";
import { createInvestment } from "@/services/investmentService";

const AddInvestmentForm = ({ onAddInvestment, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientname: "",
    description: "",
    amount: "",
    category: "",
    returns: "",
    date: new Date().toISOString().split("T")[0], // Default to today
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || "" : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create payload
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        returns: formData.returns !== "" ? Number(formData.returns) : undefined,
        userId: userId,
      };

      // Submit the form using the createInvestment service
      const data = await createInvestment(payload);

      toast.success("Investment added successfully");

      // Reset form and close modal
      setFormData({
        clientname: "",
        description: "",
        amount: "",
        category: "",
        returns: "",
        date: new Date().toISOString().split("T")[0],
      });
      setIsOpen(false);

      // Notify parent component about the new investment
      if (onAddInvestment) {
        onAddInvestment(data);
      }
    } catch (error) {
      toast.error(error.message || "Failed to add investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 hover:text-slate-200 transition"
      >
        Add Investment
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm">
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-4">
          <div className="bg-white rounded-xl p-4 w-full max-w-lg max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Investment</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="clientname"
                  value={formData.clientname}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter Client Name"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter description"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full p-2 border rounded"
                  placeholder="Enter Amount"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Category *
                </label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter your category"
                  required
                ></input>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Returns
                </label>
                <input
                  type="number"
                  name="returns"
                  value={formData.returns}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  placeholder="Expected Yearly Returns"
                  min={0}
                  step={0.1} // <- This is what makes it increment by 0.1
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  readOnly
                />
              </div>

              <div className="flex justify-end space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 hover:text-slate-200 disabled:bg-gray-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Investment"}
                </button>
              </div>
            </form>
          </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddInvestmentForm;
