import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

export default function AdminStatusManager() {
  const [admins, setAdmins] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const { user } = useAuth();
  const userId = user?._id || user?.id;
  // Fetch admins
  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await fetch(`${API_BASE}/api/getalladmin/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        setAdmins(Array.isArray(data.data) ? data.data : []);
      } else {
        console.error("Failed to fetch admins:", data.message);
        setAdmins([]);
      }
    } catch (e) {
      console.error("Error fetching admins:", e);
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Toggle admin status: pending ↔ approved
  const toggleAdminStatus = async (adminId, currentStatus) => {
    const newStatus = currentStatus === "approved" ? "pending" : "approved";

    // Optimistic update
    setAdmins((prev) =>
      prev.map((admin) =>
        admin._id === adminId ? { ...admin, status: newStatus } : admin
      )
    );

    try {
      const res = await fetch(`${API_BASE}/api/admin/${adminId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ newStatus }),
      });

      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setAdmins((prev) =>
          prev.map((admin) =>
            admin._id === adminId ? { ...admin, status: currentStatus } : admin
          )
        );
        alert("Failed to update status. Please try again.");
      }
    } catch (error) {
      console.error("Status update error:", error);
      // Revert on network error
      setAdmins((prev) =>
        prev.map((admin) =>
          admin._id === adminId ? { ...admin, status: currentStatus } : admin
        )
      );
      alert("Network error. Status not updated.");
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (adminId) => {
    if (!confirm("Are you sure you want to delete this admin? This cannot be undone.")) {
      return;
    }

    // Optimistic delete
    const prevAdmins = [...admins];
    setAdmins((prev) => prev.filter((admin) => admin._id !== adminId));

    try {
      const res = await fetch(`${API_BASE}/api/admin/${adminId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setAdmins(prevAdmins);
        alert("Failed to delete admin. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setAdmins(prevAdmins);
      alert("Network error. Admin was not deleted.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case "suspect":
        return <Badge className="bg-red-500 text-white">Suspect</Badge>;
      default:
        return <Badge className="bg-gray-400 text-white">Unknown</Badge>;
    }
  };

  const filteredAdmins = admins
    .filter((a) => a?.name?.toLowerCase().includes(search.toLowerCase()) ?? true)
    .filter((a) => (statusFilter === "all" ? true : a.status === statusFilter));

  return (
    <div className="p-8 w-full flex justify-center bg-gray-100 min-h-screen">
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold">Admin Directory</h2>
        <p className="text-gray-600 mb-6">Manage admin registrations and status</p>

        {/* Search & Filter */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            className="w-full"
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspect">Suspect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-0">
            {loadingAdmins ? (
              <div className="p-8 text-center text-gray-500">Loading admins...</div>
            ) : filteredAdmins.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No admins found.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-700 bg-gray-50">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Company</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Blocked</th>
                    <th className="p-4">Subscription</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAdmins.map((admin) => (
                    <tr key={admin._id} className="border-b hover:bg-gray-100">
                      <td className="p-4 font-medium">
                        <div className="flex items-center gap-2">
                          {admin.name || (
                            <span className="text-gray-400 italic">No Name</span>
                          )}
                          {admin.status === "approved" && (
                            <Check className="text-green-500 w-5 h-5" />
                          )}
                        </div>
                      </td>

                      <td className="p-4">{admin.email}</td>

                      <td className="p-4">
                        {admin.companyName || (
                          <span className="text-gray-400 italic">N/A</span>
                        )}
                      </td>

                      <td className="p-4">{getStatusBadge(admin.status)}</td>

                      <td className="p-4">
                        {admin.blocked?.isBlocked ? (
                          <Badge className="bg-red-500 text-white">Blocked</Badge>
                        ) : (
                          <Badge className="bg-green-500 text-white">Active</Badge>
                        )}
                      </td>

                      <td className="p-4">
                        <Badge>{admin.subscription?.status || "N/A"}</Badge>
                      </td>

                      <td className="p-4">
                        <Badge>{admin.payment?.status || "N/A"}</Badge>
                      </td>

                      <td className="p-4">{admin.role}</td>

                      <td className="p-4 flex gap-2">
                        {/* View Button */}
                        <Button variant="outline" size="sm" className="gap-1">
                          <Eye size={14} /> View
                        </Button>

                        {/* Toggle Status Button */}
                        {admin.status === "pending" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-500 hover:bg-green-50 gap-1"
                            onClick={() => toggleAdminStatus(admin._id, admin.status)}
                          >
                            <Check size={14} /> Approve
                          </Button>
                        ) : admin.status === "approved" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-yellow-600 border-yellow-500 hover:bg-yellow-50 gap-1"
                            onClick={() => toggleAdminStatus(admin._id, admin.status)}
                          >
                            ⏳ Make Pending
                          </Button>
                        ) : null}

                        {/* Delete Button */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteAdmin(admin._id)}
                        >
                          <Trash size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}