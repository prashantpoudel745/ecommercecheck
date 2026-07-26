export type TargetMode = 'uniform' | 'custom';

export interface IMetricTarget {
  sales: number;
  inventory: number;
  clients: number;
}

export interface IYearlyMetricTarget extends IMetricTarget {
  year: number;
}

export interface IMonthlyTargetConfig {
  mode: TargetMode;
  uniformTarget: IMetricTarget;
  monthlyTargets: IMetricTarget[];
}

export interface IYearlyTargetConfig {
  mode: TargetMode;
  baseYear: number;
  yearsCount: number;
  uniformTarget: IMetricTarget;
  yearlyTargets: IYearlyMetricTarget[];
}

export interface ITargetsPayload {
  monthly: IMonthlyTargetConfig;
  yearly: IYearlyTargetConfig;
}

export interface ITargetsResponse {
  monthly?: Partial<IMonthlyTargetConfig> & Partial<IMetricTarget>;
  yearly?: Partial<IYearlyTargetConfig> & Partial<IMetricTarget>;
}

export interface TargetSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ITargetsPayload) => Promise<void> | void;
}
