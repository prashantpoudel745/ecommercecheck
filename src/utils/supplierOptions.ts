type SupplierLike = Record<string, any>;

export const isSupplierGroupName = (groupName?: string): boolean => {
  if (!groupName) return false;
  const name = String(groupName).toLowerCase().trim();
  // Exclude non-trade liability payables like taxes, salary, loans
  if (/tax|duty|duties|vat|salary|payroll|wage|loan|interest/i.test(name)) {
    return false;
  }
  return /creditor|supplier|vendor|trade\s*payable|accounts?\s*payable/i.test(name);
};

/**
 * Purchase documents store the selected supplier by ledger name.
 * Only includes registered suppliers and Chart of Accounts ledgers that belong to
 * supplier / creditor groups (e.g. Sundry Creditors, Trade Payables).
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
    if (!key) return;

    // If an unclassified ledger has a non-supplier group (e.g. Cash, Bank, Sales), exclude it
    const grp = typeof supplier.accountGroup === "string" ? supplier.accountGroup : supplier.accountGroup?.name;
    if (supplier.isLedger && grp && !isSupplierGroupName(grp)) {
      return;
    }

    options.set(key, supplier);
  });

  ledgers.forEach((ledger) => {
    const name = ledger.name || ledger.companyName;
    const key = keyFor(name);
    if (!key) return;

    const group = typeof ledger.accountGroup === "string"
      ? ledger.accountGroup
      : ledger.accountGroup?.name || "";

    // Exclude non-supplier ledgers unless already registered in SupplierModel
    if (group && !isSupplierGroupName(group) && !options.has(key)) {
      return;
    }

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
