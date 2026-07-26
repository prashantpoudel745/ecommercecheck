import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { EditProfileModalProps } from "../../../types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL||"";



export default function EditProfileModal({ open, onClose, defaultTab = "profile" }: EditProfileModalProps) {
  const { user } = useAuth();

  // --- Profile form state ---
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    companyName: user?.companyName || "",
  });

  // --- Password form state ---
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Sync profile fields when user loads
  React.useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
      });
    }
  }, [user]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    setPasswordSuccess(false);
    try {
      const res = await fetch(`${API_URL}/api/changepassword`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Password change failed");
      toast.success("Password changed successfully!");
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputClass =
    "h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg rounded-2xl border-slate-200 p-0 shadow-2xl">
        <DialogHeader className="border-b border-slate-100 px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-slate-900">Account Settings</DialogTitle>
          <p className="text-sm text-slate-500">Manage your profile and security settings</p>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="px-6 pb-6 pt-4">
          <TabsList className="mb-5 grid w-full grid-cols-2 rounded-xl bg-slate-100 p-1">
            <TabsTrigger
              value="password"
              className="flex items-center gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Lock className="h-4 w-4" />
              Change Password
            </TabsTrigger>
          </TabsList>

          {/* ── Change Password Tab ── */}
          <TabsContent value="password">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Current Password</Label>
                <div className="relative">
                  <Input
                    className={`${inputClass} pr-10`}
                    type={showCurrent ? "text" : "password"}
                    placeholder="Enter current password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">New Password</Label>
                <div className="relative">
                  <Input
                    className={`${inputClass} pr-10`}
                    type={showNew ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.newPassword && (
                  <div className="mt-1 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          passwordForm.newPassword.length >= (i + 1) * 2
                            ? passwordForm.newPassword.length >= 12
                              ? "bg-emerald-500"
                              : passwordForm.newPassword.length >= 8
                              ? "bg-amber-400"
                              : "bg-red-400"
                            : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    className={`${inputClass} pr-10 ${
                      passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                        : ""
                    }`}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordForm.confirmPassword && passwordForm.confirmPassword !== passwordForm.newPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={passwordLoading}
                className="mt-2 h-10 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {passwordLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : passwordSuccess ? (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                ) : null}
                {passwordLoading ? "Updating…" : passwordSuccess ? "Updated!" : "Update Password"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
