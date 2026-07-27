import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ChangeSignature from "@/lib/Changesignature";
import { BellRing, LogOut, Globe, DollarSign, UserPen, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { InstallButton } from "../pwa/InstallButton";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import RecentActivity from "@/components/dashboard/RecentActivity";
import EditProfileModal from "@/components/profile/EditProfileModal";
import { BusinessAssistant } from "../assistant/BusinessAssistant";
import { normalizeCurrencySymbol } from "@/utils/formatCurrency";
const API_URL = import.meta.env.VITE_API_URL||"";

const sectionLabels: Record<string, string> = {
  "/": "Executive dashboard",
  "/accounting": "Financial control",
  "/inventory": "Inventory management",
  "/crm": "Customer operations",
  "/employees": "Team management",
  "/attendance": "Attendance overview",
  "/investments": "Investment portfolio",
  "/prediction": "Growth planning",
};

export function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout: contextLogout, refreshUser } = useAuth();
  const [company, setCompany] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("/images/default-profile.png");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<"profile" | "password">("profile");
  useEffect(() => {
    if (user) {
      setCompany(user.companyName || user.fullName || "");
      setImageUrl(
        user.profileImage || user.companyprofileImage || "/images/default-profile.png"
      );
    }
  }, [user]);

  const logout = async () => {
    try {
      await contextLogout();
      navigate("/home");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Error during logout");
    }
  };

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  const changeCurrency = async (symbol: string) => {
    try {
      const response = await fetch(`${API_URL}/api/changecurrency`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currencySymbol: normalizeCurrencySymbol(symbol) }),
      });
      if (response.ok) {
        toast.success("Currency updated");
        await refreshUser();
        // optionally window.location.reload() if UI doesn't react fully:
        window.location.reload();
      } else {
        toast.error("Failed to update currency");
      }
    } catch (err) {
      toast.error("Error updating currency");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = async () => {
        const base64Image = reader.result;
        if (typeof base64Image !== "string") return;

        const response = await fetch(`${API_URL}/api/changeprofile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ profileImage: base64Image }),
        });

        if (!response.ok) {
          const errData = await response.json();
          toast.error(errData.message || "Failed to update profile image");
          return;
        }

        const data = await response.json();
        const newImage = data?.data?.profileImage || data?.profileImage || data?.user?.profileImage;

        if (newImage) {
          setImageUrl(newImage);
        }

        await refreshUser();
        toast.success("Profile image updated");
      };
    } catch (err) {
      toast.error("Upload failed");
    }
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1520px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {/* <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
            <img src="/images/logo.png" alt="Logo" className="h-9 w-9 object-contain" />
          </div> */}
          <div className="min-w-0">
            <div className="flex itemps-center gap-2">
              <h1 className="truncate text-[15px] font-semibold tracking-tight text-slate-950">Bebasthapan</h1>
              {/* <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:inline-flex">
                Enterprise
              </span> */}
            </div>
            <p className="mt-1 truncate text-xs text-slate-500">
              {sectionLabels[location.pathname] || "Operations workspace"}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          
          {/* <InstallButton /> */}
        </div>
            
        <div className="flex items-center gap-2 sm:gap-3">
                              <BusinessAssistant />

          <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-full border border-slate-200 bg-white/80 p-0 hover:bg-slate-50"
                title="Notifications"
              >
                <BellRing className="h-4 w-4 text-slate-600" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88vh] w-[95vw] max-w-2xl overflow-hidden rounded-[24px] border-slate-200 p-0 shadow-[0_24px_80px_rgba(15,23,42,0.16)]">
              <DialogHeader className="border-b border-slate-200 px-6 py-5">
                <DialogTitle className="text-lg font-semibold tracking-tight text-slate-950">
                  Notifications
                </DialogTitle>
                <p className="text-sm text-slate-500">
                  Recent activities and updates from your workspace.
                </p>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
                <RecentActivity userId={user?._id || user?.id || user?.companyId || ""} />
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-10 w-10 rounded-full border border-slate-200 bg-white/80 p-0 hover:bg-slate-50"
                title="Change Language"
              >
                <Globe className="h-5 w-5 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => changeLanguage("en")}>{t("common.english")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage("np")}>{t("common.nepali")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user?.role === "admin" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-10 w-10 rounded-full border border-slate-200 bg-white/80 p-0 hover:bg-slate-50"
                  title="Change Currency"
                >
                  <DollarSign className="h-5 w-5 text-slate-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeCurrency("रु")}>NPR (रु)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeCurrency("₹")}>INR (₹)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeCurrency("$")}>USD ($)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeCurrency("€")}>EUR (€)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full border border-slate-200 bg-white/80 p-0 hover:bg-slate-50"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={imageUrl} />
                  <AvatarFallback>{imageUrl}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-72 p-2" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col items-start space-y-2">
                  <div
                    className="flex items-center gap-3"
                    onClick={() => user?.role === "admin" && document.getElementById("fileInput")?.click()}
                    style={{ cursor: user?.role === "admin" ? "pointer" : "default" }}
                  >
                    {/* <img src={imageUrl} alt="User" className="h-9 w-9 rounded-full border object-cover" /> */}
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-800">Company : {company || user?.companyName || user?.fullName || "User"}</p>
                      <p className="text-sm font-medium text-slate-700">{user?.name}</p>
                      <p className="text-xs text-slate-500">{user?.email || "No email"}</p>
                    </div>
                  </div>

                  {user?.role === "admin" && (
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                  )}
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {user?.role === "admin" && (
                <>
                  <div className="p-2">
                    <ChangeSignature />
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 text-slate-700 hover:text-slate-900"
                onClick={() => { setProfileModalTab("password"); setIsProfileModalOpen(true); }}
              >
                <KeyRound className="h-4 w-4 text-amber-500" />
                Change Password
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="flex cursor-pointer items-center gap-2 text-red-500 hover:text-red-600"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    <EditProfileModal open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} defaultTab={profileModalTab} />
    </>
  );
}
