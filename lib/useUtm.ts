"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useUtm() {
  const params = useSearchParams();

  return useMemo(
    () => ({
      source: params.get("utm_source"),
      medium: params.get("utm_medium"),
      campaign: params.get("utm_campaign"),
      term: params.get("utm_term"),
      content: params.get("utm_content"),
    }),
    [params]
  );
}
