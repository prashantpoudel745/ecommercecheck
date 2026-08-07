import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, Loader2, Send } from "lucide-react";

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  customerName: string;
  isProcessing: boolean;
}

export function EmailConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  customerName,
  isProcessing,
}: EmailConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="bg-indigo-100 p-3 rounded-full mb-2">
            <Mail className="h-6 w-6 text-indigo-600" />
          </div>
          <AlertDialogTitle className="text-xl font-semibold text-slate-900">
            Confirm Send Email
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 pt-2 text-base">
            Do you want to send this document via email to{" "}
            <span className="font-semibold text-slate-800">{customerName || "this client"}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center sm:space-x-4 mt-6">
          <AlertDialogCancel 
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[100px]"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isProcessing}
            className="w-full sm:w-auto min-w-[100px] bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? "Sending..." : "Confirm & Send"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
