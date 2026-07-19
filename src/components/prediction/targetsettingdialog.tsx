// components/prediction/targetsettingdialog.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ClipLoader } from 'react-spinners';
const API_BASE = import.meta.env.VITE_API_URL;

type TargetMode = 'uniform' | 'custom';

interface IMetricTarget {
  sales: number;
  inventory: number;
  clients: number;
}

interface IYearlyMetricTarget extends IMetricTarget {
  year: number;
}

interface IMonthlyTargetConfig {
  mode: TargetMode;
  uniformTarget: IMetricTarget;
  monthlyTargets: IMetricTarget[];
}

interface IYearlyTargetConfig {
  mode: TargetMode;
  baseYear: number;
  yearsCount: number;
  uniformTarget: IMetricTarget;
  yearlyTargets: IYearlyMetricTarget[];
}

interface ITargetsPayload {
  monthly: IMonthlyTargetConfig;
  yearly: IYearlyTargetConfig;
}

interface ITargetsResponse {
  monthly?: Partial<IMonthlyTargetConfig> & Partial<IMetricTarget>;
  yearly?: Partial<IYearlyTargetConfig> & Partial<IMetricTarget>;
}

interface TargetSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ITargetsPayload) => Promise<void> | void;
}

const emptyMetric = (): IMetricTarget => ({
  sales: 0,
  inventory: 0,
  clients: 0,
});

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const buildMonthlyTargets = (fallback?: IMetricTarget): IMetricTarget[] =>
  Array.from({ length: 12 }, () => ({ ...(fallback || emptyMetric()) }));

const buildYearlyTargets = (
  baseYear: number,
  yearsCount: number,
  fallback?: IMetricTarget
): IYearlyMetricTarget[] =>
  Array.from({ length: yearsCount }, (_, index) => ({
    year: baseYear + index,
    ...(fallback || emptyMetric()),
  }));

const TargetSettingsDialog: React.FC<TargetSettingsDialogProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const currentYear = new Date().getFullYear();
  const [monthlyMode, setMonthlyMode] = useState<TargetMode>('uniform');
  const [yearlyMode, setYearlyMode] = useState<TargetMode>('uniform');

  const [monthlyUniform, setMonthlyUniform] = useState<IMetricTarget>(emptyMetric());
  const [monthlyCustom, setMonthlyCustom] = useState<IMetricTarget[]>(buildMonthlyTargets());

  const [yearlyUniform, setYearlyUniform] = useState<IMetricTarget>(emptyMetric());
  const [yearlyBaseYear, setYearlyBaseYear] = useState<number>(currentYear);
  const [yearlyYearsCount, setYearlyYearsCount] = useState<number>(1);
  const [yearlyCustom, setYearlyCustom] = useState<IYearlyMetricTarget[]>(
    buildYearlyTargets(currentYear, 1)
  );

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const setMetricValue = (
    setter: React.Dispatch<React.SetStateAction<IMetricTarget>>,
    key: keyof IMetricTarget,
    value: string
  ) => {
    setter((prev) => ({
      ...prev,
      [key]: value ? Number(value) : 0,
    }));
  };

  const fetchTargets = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch(`${API_BASE}/api/performance/targets`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data: ITargetsResponse = await res.json();
        const monthlySource = data.monthly;
        const monthlyUniformTarget: IMetricTarget = {
          sales: Number(monthlySource?.uniformTarget?.sales ?? monthlySource?.sales ?? 0),
          inventory: Number(monthlySource?.uniformTarget?.inventory ?? monthlySource?.inventory ?? 0),
          clients: Number(monthlySource?.uniformTarget?.clients ?? monthlySource?.clients ?? 0),
        };

        const monthlyTargets = Array.isArray(monthlySource?.monthlyTargets)
          ? monthlySource.monthlyTargets.slice(0, 12).map((entry) => ({
              sales: Number(entry?.sales ?? 0),
              inventory: Number(entry?.inventory ?? 0),
              clients: Number(entry?.clients ?? 0),
            }))
          : buildMonthlyTargets(monthlyUniformTarget);

        const normalizedMonthlyTargets = Array.from({ length: 12 }, (_, index) =>
          monthlyTargets[index] || { ...monthlyUniformTarget }
        );

        setMonthlyMode(monthlySource?.mode === 'custom' ? 'custom' : 'uniform');
        setMonthlyUniform(monthlyUniformTarget);
        setMonthlyCustom(normalizedMonthlyTargets);

        const yearlySource = data.yearly;
        const parsedBaseYear = Number(yearlySource?.baseYear) || currentYear;
        const parsedYears = Math.max(
          1,
          Math.min(10, Number(yearlySource?.yearsCount) || 1)
        );
        const yearlyUniformTarget: IMetricTarget = {
          sales: Number(yearlySource?.uniformTarget?.sales ?? yearlySource?.sales ?? 0),
          inventory: Number(yearlySource?.uniformTarget?.inventory ?? yearlySource?.inventory ?? 0),
          clients: Number(yearlySource?.uniformTarget?.clients ?? yearlySource?.clients ?? 0),
        };

        const yearlyTargets = Array.isArray(yearlySource?.yearlyTargets)
          ? yearlySource.yearlyTargets.map((entry) => ({
              year: Number(entry?.year),
              sales: Number(entry?.sales ?? 0),
              inventory: Number(entry?.inventory ?? 0),
              clients: Number(entry?.clients ?? 0),
            }))
          : [];

        const normalizedYearlyTargets = Array.from({ length: parsedYears }, (_, index) => {
          const year = parsedBaseYear + index;
          const match = yearlyTargets.find((entry) => entry.year === year);
          return {
            year,
            sales: Number(match?.sales ?? yearlyUniformTarget.sales ?? 0),
            inventory: Number(match?.inventory ?? yearlyUniformTarget.inventory ?? 0),
            clients: Number(match?.clients ?? yearlyUniformTarget.clients ?? 0),
          };
        });

        setYearlyMode(yearlySource?.mode === 'custom' ? 'custom' : 'uniform');
        setYearlyUniform(yearlyUniformTarget);
        setYearlyBaseYear(parsedBaseYear);
        setYearlyYearsCount(parsedYears);
        setYearlyCustom(normalizedYearlyTargets);
      } else {
        setMonthlyMode('uniform');
        setYearlyMode('uniform');
        setMonthlyUniform(emptyMetric());
        setMonthlyCustom(buildMonthlyTargets());
        setYearlyUniform(emptyMetric());
        setYearlyBaseYear(currentYear);
        setYearlyYearsCount(1);
        setYearlyCustom(buildYearlyTargets(currentYear, 1));
      }
    } catch (err) {
      // console.error('Failed to fetch targets:', err);
      toast.error('Failed to load current targets');
      setMonthlyMode('uniform');
      setYearlyMode('uniform');
      setMonthlyUniform(emptyMetric());
      setMonthlyCustom(buildMonthlyTargets());
      setYearlyUniform(emptyMetric());
      setYearlyBaseYear(currentYear);
      setYearlyYearsCount(1);
      setYearlyCustom(buildYearlyTargets(currentYear, 1));
    } finally {
      setFetching(false);
    }
  }, [currentYear]);

  useEffect(() => {
    if (isOpen) {
      fetchTargets();
    } else {
      setMonthlyMode('uniform');
      setYearlyMode('uniform');
      setMonthlyUniform(emptyMetric());
      setMonthlyCustom(buildMonthlyTargets());
      setYearlyUniform(emptyMetric());
      setYearlyBaseYear(currentYear);
      setYearlyYearsCount(1);
      setYearlyCustom(buildYearlyTargets(currentYear, 1));
    }
  }, [isOpen, currentYear, fetchTargets]);

  useEffect(() => {
    setYearlyCustom((prev) => {
      const next = Array.from({ length: yearlyYearsCount }, (_, index) => {
        const year = yearlyBaseYear + index;
        const existing = prev.find((entry) => entry.year === year);
        return (
          existing || {
            year,
            ...yearlyUniform,
          }
        );
      });
      return next;
    });
  }, [yearlyBaseYear, yearlyYearsCount, yearlyUniform]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload: ITargetsPayload = {
        monthly: {
          mode: monthlyMode,
          uniformTarget: monthlyUniform,
          monthlyTargets:
            monthlyMode === 'custom'
              ? monthlyCustom
              : buildMonthlyTargets(monthlyUniform),
        },
        yearly: {
          mode: yearlyMode,
          baseYear: yearlyBaseYear,
          yearsCount: yearlyYearsCount,
          uniformTarget: yearlyUniform,
          yearlyTargets:
            yearlyMode === 'custom'
              ? yearlyCustom.map((entry) => ({ ...entry }))
              : buildYearlyTargets(yearlyBaseYear, yearlyYearsCount, yearlyUniform),
        },
      };

      await Promise.resolve(onSave(payload));
    } catch (error) {
      toast.error('Failed to save targets');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex justify-center py-12">
            <ClipLoader size={36} color="#3b82f6" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl max-h-[88vh] overflow-y-auto p-0">
        <DialogHeader>
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b px-6 py-4">
            <DialogTitle className="text-xl">Set Performance Targets</DialogTitle>
            <p className="text-sm text-slate-600 mt-1">
              Choose a single value for all periods or set custom values for each month and year.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-5 p-6">
          {/* Monthly Section */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="font-semibold text-slate-800">Monthly Targets</h3>
              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setMonthlyMode('uniform')}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    monthlyMode === 'uniform'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Same for all months
                </button>
                <button
                  type="button"
                  onClick={() => setMonthlyMode('custom')}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    monthlyMode === 'custom'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Set each month
                </button>
              </div>
            </div>

            {monthlyMode === 'uniform' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Sales</Label>
                  <Input
                    type="number"
                    min="0"
                    value={monthlyUniform.sales || ''}
                    onChange={(e) => setMetricValue(setMonthlyUniform, 'sales', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Clients</Label>
                  <Input
                    type="number"
                    min="0"
                    value={monthlyUniform.clients || ''}
                    onChange={(e) => setMetricValue(setMonthlyUniform, 'clients', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Inventory Value</Label>
                  <Input
                    type="number"
                    min="0"
                    value={monthlyUniform.inventory || ''}
                    onChange={(e) => setMetricValue(setMonthlyUniform, 'inventory', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="hidden md:grid grid-cols-4 gap-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <span>Month</span>
                  <span>Sales</span>
                  <span>Clients</span>
                  <span>Inventory Value</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {monthLabels.map((month, index) => (
                    <div
                      key={month}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-white p-2"
                    >
                      <div className="text-sm font-medium text-slate-700 flex items-center">{month}</div>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Sales"
                        value={monthlyCustom[index]?.sales || ''}
                        onChange={(e) =>
                          setMonthlyCustom((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...(next[index] || emptyMetric()),
                              sales: e.target.value ? Number(e.target.value) : 0,
                            };
                            return next;
                          })
                        }
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Clients"
                        value={monthlyCustom[index]?.clients || ''}
                        onChange={(e) =>
                          setMonthlyCustom((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...(next[index] || emptyMetric()),
                              clients: e.target.value ? Number(e.target.value) : 0,
                            };
                            return next;
                          })
                        }
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Inventory"
                        value={monthlyCustom[index]?.inventory || ''}
                        onChange={(e) =>
                          setMonthlyCustom((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...(next[index] || emptyMetric()),
                              inventory: e.target.value ? Number(e.target.value) : 0,
                            };
                            return next;
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Yearly Section */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="font-semibold text-slate-800">Yearly Targets</h3>
              <div className="inline-flex rounded-lg border border-slate-300 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setYearlyMode('uniform')}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    yearlyMode === 'uniform'
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Same for all years
                </button>
                <button
                  type="button"
                  onClick={() => setYearlyMode('custom')}
                  className={`px-3 py-1.5 text-sm rounded-md ${
                    yearlyMode === 'custom'
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Set each year
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <Label>Start Year</Label>
                <Input
                  type="number"
                  value={yearlyBaseYear}
                  min={currentYear - 1}
                  onChange={(e) => setYearlyBaseYear(Number(e.target.value) || currentYear)}
                />
              </div>
              <div>
                <Label>Number of Years (max 10)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={yearlyYearsCount}
                  onChange={(e) => {
                    const nextCount = Math.max(1, Math.min(10, Number(e.target.value) || 1));
                    setYearlyYearsCount(nextCount);
                  }}
                />
                <p className="text-xs text-slate-500 mt-1">You can set targets for up to 10 years only.</p>
              </div>
            </div>

            {yearlyMode === 'uniform' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Sales</Label>
                  <Input
                    type="number"
                    min="0"
                    value={yearlyUniform.sales || ''}
                    onChange={(e) => setMetricValue(setYearlyUniform, 'sales', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Clients</Label>
                  <Input
                    type="number"
                    min="0"
                    value={yearlyUniform.clients || ''}
                    onChange={(e) => setMetricValue(setYearlyUniform, 'clients', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Inventory Value</Label>
                  <Input
                    type="number"
                    min="0"
                    value={yearlyUniform.inventory || ''}
                    onChange={(e) => setMetricValue(setYearlyUniform, 'inventory', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="hidden md:grid grid-cols-4 gap-2 px-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <span>Year</span>
                  <span>Sales</span>
                  <span>Clients</span>
                  <span>Inventory Value</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {yearlyCustom.map((entry, index) => (
                    <div
                      key={entry.year}
                      className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-lg border border-emerald-200 bg-white p-2"
                    >
                      <div className="text-sm font-medium text-slate-700 flex items-center">{entry.year}</div>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Sales"
                        value={entry.sales || ''}
                        onChange={(e) =>
                          setYearlyCustom((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...next[index],
                              sales: e.target.value ? Number(e.target.value) : 0,
                            };
                            return next;
                          })
                        }
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Clients"
                        value={entry.clients || ''}
                        onChange={(e) =>
                          setYearlyCustom((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...next[index],
                              clients: e.target.value ? Number(e.target.value) : 0,
                            };
                            return next;
                          })
                        }
                      />
                      <Input
                        type="number"
                        min="0"
                        placeholder="Inventory"
                        value={entry.inventory || ''}
                        onChange={(e) =>
                          setYearlyCustom((prev) => {
                            const next = [...prev];
                            next[index] = {
                              ...next[index],
                              inventory: e.target.value ? Number(e.target.value) : 0,
                            };
                            return next;
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-white/95 backdrop-blur border-t px-6 py-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2"
          >
            {loading ? <ClipLoader size={16} color="white" /> : null}
            Save Targets
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TargetSettingsDialog;