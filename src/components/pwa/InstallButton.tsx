import { useState, useRef, useEffect } from "react";

export function InstallButton() {
  const [installable, setInstallable] = useState(false);
  const deferredPrompt = useRef<Event | null>(null);

  useEffect(() => {
    // Skip if user previously dismissed
    if (localStorage.getItem("installPromptDismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPrompt.current as any;

    if (!promptEvent) return;

    // Show the install prompt
    promptEvent.prompt();

    // Wait for the user's response
    const { outcome } = await promptEvent.userChoice;

    // Reset the prompt
    deferredPrompt.current = null;
    setInstallable(false);
  };

  const handleDismiss = () => {
    setInstallable(false);
    localStorage.setItem("installPromptDismissed", "true");
  };

  if (!installable) return null;

  return (
    <div className="install-banner fixed bottom-4 right-4 p-4 bg-gray-800 text-white rounded-lg shadow-lg flex gap-2">
      {/* <button
        onClick={handleInstall}
        className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded"
      >
        Install App
      </button>
      <button
        onClick={handleDismiss}
        className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded"
      >
        Not Now
      </button> */}
    </div>
  );
}
