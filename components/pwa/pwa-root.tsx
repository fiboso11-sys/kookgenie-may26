"use client";

import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { InstallBanner } from "@/components/pwa/install-banner";
import { SyncStatus } from "@/components/pwa/sync-status";
import { UpdatePrompt } from "@/components/pwa/update-prompt";

export function PwaRoot() {
  return (
    <>
      <OfflineIndicator />
      <SyncStatus />
      <InstallBanner />
      <UpdatePrompt />
    </>
  );
}
