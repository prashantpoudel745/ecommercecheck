import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      position="top-center"
      closeButton
      expand={false}
      richColors={false}
      visibleToasts={3}
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "w-fit max-w-md rounded-lg border bg-background text-foreground shadow-lg",
          description: "text-muted-foreground",
        },
      }}
    />
  );
}