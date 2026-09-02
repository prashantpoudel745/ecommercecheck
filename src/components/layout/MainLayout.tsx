import { ReactNode, useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { BusinessAssistant } from "../assistant/BusinessAssistant";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { showWarning, secondsLeft, extendSession } = useSessionTimeout();

  const handleMenuClick = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={handleMobileClose} />
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header onMenuClick={handleMenuClick} />
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 pb-4">
          <div className="mx-auto max-w-[1520px] w-full">
            {children}
          </div>
        </main>
      </div>

      <Dialog open={showWarning} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Session Timeout Warning</DialogTitle>
            <DialogDescription>
              You have been inactive for a while. For your security, you will be automatically logged out in <strong>{secondsLeft}</strong> seconds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end">
            <Button type="button" onClick={extendSession}>
              Stay Logged In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

