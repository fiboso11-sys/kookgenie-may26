import { AppShell } from "@/components/AppShell";
import { GroceryProvider } from "@/components/GroceryContext";
import { ToastProvider } from "@/components/ToastProvider";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <GroceryProvider>
      <ToastProvider />
      <AppShell>{children}</AppShell>
    </GroceryProvider>
  );
}
