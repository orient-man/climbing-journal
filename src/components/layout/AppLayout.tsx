import { Outlet } from "react-router-dom";
import AppNav from "./AppNav";
import { Toaster } from "@/components/ui/toaster";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
