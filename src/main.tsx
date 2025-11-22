import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { registerSW } from 'virtual:pwa-register';
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import App from "./App.tsx";
import "./index.css";

// Register main service worker for PWA
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

// Register push notification service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Push notification service worker registered:', registration);
    })
    .catch(error => {
      console.error('Push notification service worker registration failed:', error);
    });
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <App />
  </ThemeProvider>
);
