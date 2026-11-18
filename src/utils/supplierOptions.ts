type SupplierLike = Record<string, any>;

/**
 * Purchase documents store the selected supplier by ledger name.  The supplier
 * directory is optional, so always merge it with Chart of Accounts here.
 */
export const buildSupplierOptions = (
  suppliers: SupplierLike[] = [],
  ledgers: SupplierLike[] = []
): SupplierLike[] => {
  const options = new Map<string, SupplierLike>();
  const keyFor = (name: unknown) => String(name || "").trim().toLocaleLowerCase();

  suppliers.forEach((supplier) => {
    const name = supplier.companyName || supplier.name || supplier.supplierName;
    const key = keyFor(name);
    if (key) options.set(key, supplier);
  });

  ledgers.forEach((ledger) => {
    const name = ledger.name || ledger.companyName;
    const key = keyFor(name);
    if (!key) return;

    const group = typeof ledger.accountGroup === "string"
      ? ledger.accountGroup
      : ledger.accountGroup?.name || "";
    const existing = options.get(key) || {};
    options.set(key, {
      ...existing,
      _id: existing._id || ledger._id,
      companyName: existing.companyName || name,
      email: existing.email || ledger.email || "",
      phone: existing.phone || ledger.phone || "",
      taxNumber: existing.taxNumber || existing.panNumber || ledger.panNumber || "",
      panNumber: existing.panNumber || existing.taxNumber || ledger.panNumber || "",
      isLedger: true,
      accountGroup: group || existing.accountGroup || "",
      displayName: group ? `${name} (${group})` : name,
    });
  });

  return Array.from(options.values()).sort((a, b) =>
    String(a.companyName || a.name || "").localeCompare(String(b.companyName || b.name || ""))
  );
};
