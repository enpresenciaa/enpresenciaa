import { createContext } from "react";

export type DeveloperDataSource = "journey-demo" | "real";

export type DeveloperMocksContextValue = {
  dataSource: DeveloperDataSource;
  setDataSource: (source: DeveloperDataSource) => void;
};

export const DeveloperMocksContext = createContext<DeveloperMocksContextValue | null>(null);
