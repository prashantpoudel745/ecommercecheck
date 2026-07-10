import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { InventoryStats, Product, Transaction } from "types";

const STORAGE_KEY = "global-app-store-v1";

type DashboardStats = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
};

type DashboardState = {
  transactions: Transaction[];
  products: Product[];
  stats: DashboardStats;
  inventoryStats: InventoryStats;
  clientId: string;
  lastFetched: number;
};

type GlobalStoreState = {
  dashboard: DashboardState;
  investment: InvestmentState;
};

type GlobalStoreContextValue = {
  state: GlobalStoreState;
  setDashboard: (updater: (previous: DashboardState) => DashboardState) => void;
  setInvestment: (updater: (previous: InvestmentState) => InvestmentState) => void;
  clearDashboard: () => void;
};

type InvestmentState = {
  investments: any[];
  userRole: string | null;
  lastFetched: number;
};

const defaultDashboardState: DashboardState = {
  transactions: [],
  products: [],
  stats: {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  },
  inventoryStats: {
    totalProducts: 0,
    lowStockItems: 0,
    lowStockChange: 0,
    inventoryValue: 0,
    inventoryValueChange: 0,
  },
  clientId: "",
  lastFetched: 0,
};

const defaultState: GlobalStoreState = {
  dashboard: defaultDashboardState,
  investment: {
    investments: [],
    userRole: null,
    lastFetched: 0,
  },
};

const GlobalDataStoreContext = createContext<GlobalStoreContextValue | null>(
  null
);

function readPersistedState(): GlobalStoreState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    return {
      dashboard: {
        ...defaultDashboardState,
        ...(parsed?.dashboard || {}),
      },
      investment: {
        ...defaultState.investment,
        ...(parsed?.investment || {}),
      },
    };
  } catch {
    return defaultState;
  }
}

export function GlobalDataStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalStoreState>(() => readPersistedState());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<GlobalStoreContextValue>(
    () => ({
      state,
      setDashboard: (updater) => {
        setState((previous) => ({
          ...previous,
          dashboard: updater(previous.dashboard),
        }));
      },
      setInvestment: (updater) => {
        setState((previous) => ({
          ...previous,
          investment: updater(previous.investment),
        }));
      },
      clearDashboard: () => {
        setState((previous) => ({
          ...previous,
          dashboard: defaultDashboardState,
        }));
      },
    }),
    [state]
  );

  return (
    <GlobalDataStoreContext.Provider value={value}>
      {children}
    </GlobalDataStoreContext.Provider>
  );
}

export function useGlobalDataStore() {
  const context = useContext(GlobalDataStoreContext);

  if (!context) {
    throw new Error("useGlobalDataStore must be used within GlobalDataStoreProvider");
  }

  return context;
}
