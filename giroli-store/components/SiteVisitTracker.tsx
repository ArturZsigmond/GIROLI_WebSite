"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/admin-login")) {
      return;
    }

    // Track site visit
    const trackVisit = async () => {
      try {
        await fetch("/api/analytics/site-visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: pathname }),
        });
      } catch (err) {
        // Silently fail tracking
        console.error("Failed to track site visit:", err);
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}

