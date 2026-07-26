export interface Employee {
  _id: string;
  name: string;
  department: string;
  position: string;
}

export interface User {
  _id?: string;
  id?: string;
  name?: string;
  fullName?: string;
  phone?:string;
  email?: string;
  role?: string;
  companyName?: string;
  profileImage?: string;
  companyprofileImage?: string;
  signature?: string;
  selectedPlan?: string;
  companyId?: string;
  plan?: string;
  currencySymbol?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token?: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
