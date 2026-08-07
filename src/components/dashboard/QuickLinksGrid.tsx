import { Link } from "react-router-dom";
interface QuickLink {
  label: string;
  url: string;
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
  { label: "Import Data", url: "/import"},
  { label: "Quotations", url: "sales/quotations/new"},
  { label: "Sales Order", url: "sales/orders/new"},
  { label: "Invoices", url: "sales/invoice/new"},
  { label: "Customers", url: "sales/customers/new" },
  { label: "Purchase Order", url: "purchase/orders/new"},
  { label: "Purchase Bills", url: "purchase/bills/new" },
  { label: "Expenses", url: "purchase/expenses/new"},
  { label: "Supplier Payment", url: "purchase/supplier-payment/new"},
  { label: "Supplier", url: "purchase/suppliers/new"},
  { label: "Analytics", url: "/insights"},
  { label: "Products", url: "/inventory"},
  { label: "Team", url: "/employees" },
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 p-2">
              {group.links.map(({ label, url }) => (
                <Link
                  key={url}
                  to={url}
                  className={`group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-1 py-2 text-center outline-none transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-offset-2 ${group.ring}`}
                >
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