import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { registerSW } from 'virtual:pwa-register';
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    toast({
      title: "Update Available",
      description: "A new version of the app is available.",
      action: (
        <ToastAction altText="Refresh app" onClick={() => updateSW(true)}>
          Refresh
        </ToastAction>
      ),
      duration: Infinity,
    });
  },
  onOfflineReady() {
    toast({
      title: "Ready for Offline",
      description: "The app is now available offline!",
    });
  },
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <App />
  </ThemeProvider>
);
