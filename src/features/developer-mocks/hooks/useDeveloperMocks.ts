import { use } from "react";

import { DeveloperMocksContext } from "@/features/developer-mocks/context/DeveloperMocksContext";

export function useDeveloperMocks() {
  const context = use(DeveloperMocksContext);

  if (!context) {
    throw new Error("useDeveloperMocks must be used inside DeveloperMocksProvider");
  }

  return context;
}
