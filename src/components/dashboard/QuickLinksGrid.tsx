import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Upload,
  DollarSign,
  Receipt,
  ReceiptText,
  WalletCards,
  ShoppingCart,
  Truck,
  Warehouse,
  CreditCard,
  FileText,
  BarChart3,
  LineChart,
  Database,
  UserCog,
} from "lucide-react";

interface QuickLink {
  label: string;
  url: string;
  icon: LucideIcon;
}

interface QuickLinkGroup {
  title: string;
  links: QuickLink[];
  iconBg: string;
  iconText: string;
  ring: string;
}

// Same data you have today — untouched, just grouped by module below.
const quickLinks: QuickLink[] = [
  { label: "Import Data", url: "/import", icon: Upload },
  { label: "Quotations", url: "sales/quotations/new", icon: DollarSign },
  { label: "Sales Order", url: "sales/orders/new", icon: Receipt },
  { label: "Invoices", url: "sales/invoice/new", icon: ReceiptText },
  { label: "Credit Notes", url: "sales/credit-notes/new", icon: WalletCards },
  { label: "Customers", url: "sales/customers/new", icon: ShoppingCart },
  { label: "Purchase Order", url: "purchase/orders/new", icon: Truck },
  { label: "Purchase Bills", url: "purchase/bills/new", icon: Warehouse },
  { label: "Expenses", url: "purchase/expenses/new", icon: CreditCard },
  { label: "Supplier Payment", url: "purchase/supplier-payment/new", icon: FileText },
  { label: "Supplier", url: "purchase/suppliers/new", icon: BarChart3 },
  { label: "Analytics", url: "/insights", icon: LineChart },
  { label: "Products", url: "/inventory", icon: Database },
  { label: "Team", url: "/employees", icon: UserCog },
];

// Groups derive from the url prefix, so adding a new "sales/..." or
// "purchase/..." link later slots in automatically with no extra wiring.
function buildGroups(links: QuickLink[]): QuickLinkGroup[] {
  const byPrefix = (prefix: string) =>
    links.filter((l) => l.url.startsWith(prefix));
  const rest = links.filter(
    (l) => !l.url.startsWith("sales") && !l.url.startsWith("purchase"),
  );

  return [
    {
      title: "Sales",
      links: byPrefix("sales"),
      iconBg: "bg-blue-50",
      iconText: "text-blue-600",
      ring: "focus-visible:ring-blue-500",
    },
    {
      title: "Purchase",
      links: byPrefix("purchase"),
      iconBg: "bg-violet-50",
      iconText: "text-violet-600",
      ring: "focus-visible:ring-violet-500",
    },
    {
      title: "Workspace",
      links: rest,
      iconBg: "bg-slate-100",
      iconText: "text-slate-600",
      ring: "focus-visible:ring-slate-500",
    },
  ].filter((group) => group.links.length > 0);
}

function QuickLinksGrid() {
  const groups = buildGroups(quickLinks);

  return (
    <section aria-labelledby="quick-actions-heading" className="space-y-5">
      <h2
        id="quick-actions-heading"
        className="text-[15px] font-semibold tracking-tight text-slate-900"
      >
        Quick actions
      </h2>

      <div className="space-y-4">
        {groups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {group.title}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {group.links.map(({ label, url, icon: Icon }) => (
                <Link
                  key={url}
                  to={url}
                  className={`group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-1 py-2 text-center outline-none transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 ${group.ring}`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-lg ${group.iconBg} ${group.iconText} transition-transform duration-150 group-hover:scale-[1.06]`}
                  >
                    <Icon size={18} strokeWidth={1.75} />
                  </span>
                  <span className="text-[13px] font-medium leading-tight text-slate-700">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default QuickLinksGrid;