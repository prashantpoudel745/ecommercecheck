import { Toaster as RadixToaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useMemo, useState } from "react";
import { LayoutWrapper } from "./functions/FunctionalComponent/layoutwrapper";
import { ProtectedRoute } from "./functions/FunctionalComponent/ProtectedRoute";
import { PublicRoute } from "./functions/FunctionalComponent/PublicRoute";
import { GlobalDataStoreProvider } from "./store/GlobalDataStore";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedKeepAliveRouter } from "./components/layout/ProtectedKeepAliveRouter";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Insights = lazy(() => import("./pages/Insights"));
// Removed general Accounting import in favor of specific components
const ChartOfAccounts = lazy(() => import("./components/accounting/ChartOfAccounts"));
const VoucherBook = lazy(() => import("./components/accounting/VoucherBook"));
const FinancialReports = lazy(() => import("./components/accounting/FinancialReports"));
const AccountingDashboard = lazy(() => import("./components/accounting/AccountingDashboard"));
const CashTransfers = lazy(() => import("./components/accounting/CashTransfers"));
const PlaceholderComponent = lazy(() => import("./components/common/PlaceholderComponent"));

// Sales View Pages
const QuotationsPage = lazy(() => import("./pages/sales/QuotationsPage"));
const SalesOrdersPage = lazy(() => import("./pages/sales/SalesOrdersPage"));
const InvoicesPage = lazy(() => import("./pages/sales/InvoicesPage"));
const CreditNotesPage = lazy(() => import("./pages/sales/CreditNotesPage"));
const CustomersPage = lazy(() => import("./pages/sales/CustomersPage"));

// Sales Create Pages
const CreateQuotationPage = lazy(() => import("./pages/sales/CreateQuotationPage"));
const CreateSalesOrderPage = lazy(() => import("./pages/sales/CreateSalesOrderPage"));
const CreateInvoicePage = lazy(() => import("./pages/sales/CreateInvoicePage"));
const CreateClientPaymentPage = lazy(() => import("./pages/sales/CreateClientPaymentPage"));
const CreateCreditNotePage = lazy(() => import("./pages/sales/CreateCreditNotePage"));
const CreateCustomerPage = lazy(() => import("./pages/sales/CreateCustomerPage"));

// Purchase View Pages
const PurchaseOrdersPage = lazy(() => import("./pages/purchase/PurchaseOrdersPage"));
const PurchaseBillsPage = lazy(() => import("./pages/purchase/PurchaseBillsPage"));
const ExpensesPage = lazy(() => import("./pages/purchase/ExpensesPage"));
const SupplierPaymentsPage = lazy(() => import("./pages/purchase/SupplierPaymentsPage"));
const SuppliersPage = lazy(() => import("./pages/purchase/SuppliersPage"));

// Purchase Create Pages
const CreatePurchaseOrderPage = lazy(() => import("./pages/purchase/CreatePurchaseOrderPage"));
const CreatePurchaseBillPage = lazy(() => import("./pages/purchase/CreatePurchaseBillPage"));
const CreateExpensePage = lazy(() => import("./pages/purchase/CreateExpensePage"));
const ExpenseDetailPage = lazy(() => import("./pages/purchase/ExpenseDetailPage"));
const CreateSupplierPaymentPage = lazy(() => import("./pages/purchase/CreateSupplierPaymentPage"));
const CreateSupplierPage = lazy(() => import("./pages/purchase/CreateSupplierPage"));

// IRD Compliance Pages
const DebitNotesPage       = lazy(() => import("./pages/purchase/DebitNotesPage"));
const CreateDebitNotePage  = lazy(() => import("./pages/purchase/CreateDebitNotePage"));
const CompanySettingsPage  = lazy(() => import("./pages/CompanySettingsPage"));
const BackupPage           = lazy(() => import("./pages/BackupPage"));

const CRM = lazy(() => import("./pages/CRM"));

const Inventory = lazy(() => import("./pages/Inventory"));
const ImportDataPage = lazy(() => import("./pages/ImportDataPage"));

const NotFound = lazy(() => import("./pages/NotFound"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const Forgetpassword = lazy(() => import("./pages/Forgetpassword"));
const ResetPassword = lazy(() => import("./pages/Resetpassword"));
const Investmentpage = lazy(() => import("./pages/Investmentpage"));
const EmployeeLoginPage = lazy(() => import("./pages/EmployeeLoginPage"));
const EmployeePage = lazy(() => import("./pages/Employeepage"));
const EditEmployee = lazy(() => import("./components/employees/EditEmployee"));
const ResetPasswordEmployee = lazy(() => import("./pages/ResetPasswordEmployee"));
const ForgotPasswordEmployee = lazy(() => import("./pages/Forgetpasswordemployee"));
const PaymentSuccess = lazy(() => import("./components/payment/esewa/PaymentSuccess"));
const PaymentFailure = lazy(() => import("./components/payment/esewa/PaymentFailure"));
const Attendance = lazy(() => import("./pages/Attendance"));
const AdminLoginPage = lazy(() => import("./pages/SuperadminLogin"));
const AdminSignupPage = lazy(() => import("./pages/Superadmincreate"));
const AdminStatusManager = lazy(() => import("./pages/superAdminaccess"));
const Prediction = lazy(() => import("./pages/Prediction"));
const Home = lazy(() => import("./pages/Home"));
const Sales = lazy(() => import("./pages/Sales"));
const queryClient = new QueryClient();

const App = () => {
  // const [userData, setUserData] = useState(null);

  const protectedKeepAlivePages = useMemo(
    () => [
      { id: "dashboard", paths: ["/"], render: () => <Dashboard /> },
      { id: "insights", paths: ["/insights"], render: () => <Insights /> },
      { id: "employees", paths: ["/employees"], render: () => <EmployeePage /> },
      
      // Accounting Routes
      { id: "accounting-dashboard", paths: ["/accounting/dashboard"], render: () => <div className="p-4"><AccountingDashboard /></div> },
      { id: "accounting-coa", paths: ["/accounting/chart-of-accounts"], render: () => <div className="p-4"><ChartOfAccounts /></div> },
      { id: "accounting-vouchers", paths: ["/accounting/journal-vouchers"], render: () => <div className="p-4"><VoucherBook /></div> },
      { id: "accounting-cash", paths: ["/accounting/cash-transfers"], render: () => <div className="p-4"><CashTransfers /></div> },
      { id: "accounting-reports", paths: ["/accounting/financial-reports"], render: () => <div className="p-4"><FinancialReports /></div> },

      // Sales View Routes
      { id: "sales-quotations", paths: ["/sales/quotations"], render: () => <QuotationsPage /> },
      { id: "sales-orders", paths: ["/sales/orders"], render: () => <SalesOrdersPage /> },
      { id: "sales-invoice", paths: ["/sales/invoice"], render: () => <InvoicesPage /> },
      { id: "sales-credit", paths: ["/sales/credit-notes"], render: () => <CreditNotesPage /> },
      { id: "sales-customers", paths: ["/sales/customers"], render: () => <CustomersPage /> },

      // Sales Create Routes
      { id: "create-quotation", paths: ["/sales/quotations/new"], render: () => <CreateQuotationPage /> },
      { id: "create-sales-order", paths: ["/sales/orders/new"], render: () => <CreateSalesOrderPage /> },
      { id: "create-invoice", paths: ["/sales/invoice/new"], render: () => <CreateInvoicePage /> },
      { id: "create-client-payment", paths: ["/sales/client-payment/new"], render: () => <CreateClientPaymentPage /> },
      { id: "create-credit-note", paths: ["/sales/credit-notes/new"], render: () => <CreateCreditNotePage /> },
      { id: "create-customer", paths: ["/sales/customers/new"], render: () => <CreateCustomerPage /> },

      // Purchase View Routes
      { id: "purchase-orders", paths: ["/purchase/orders"], render: () => <PurchaseOrdersPage /> },
      { id: "purchase-bills", paths: ["/purchase/bills"], render: () => <PurchaseBillsPage /> },
      { id: "purchase-expenses", paths: ["/purchase/expenses"], render: () => <ExpensesPage /> },
      { id: "purchase-payment", paths: ["/purchase/supplier-payment"], render: () => <SupplierPaymentsPage /> },
      { id: "purchase-suppliers", paths: ["/purchase/suppliers"], render: () => <SuppliersPage /> },

      // Purchase Create Routes
      { id: "create-purchase-order", paths: ["/purchase/orders/new"], render: () => <CreatePurchaseOrderPage /> },
      { id: "create-purchase-bill", paths: ["/purchase/bills/new"], render: () => <CreatePurchaseBillPage /> },
      { id: "create-expense", paths: ["/purchase/expenses/new"], render: () => <CreateExpensePage /> },
      { id: "create-supplier-payment", paths: ["/purchase/supplier-payment/new"], render: () => <CreateSupplierPaymentPage /> },
      { id: "create-supplier", paths: ["/purchase/suppliers/new"], render: () => <CreateSupplierPage /> },

      // IRD Compliance Routes
      { id: "purchase-debit-notes",        paths: ["/purchase/debit-notes"],       render: () => <DebitNotesPage /> },
      { id: "create-debit-note",           paths: ["/purchase/debit-notes/new"],   render: () => <CreateDebitNotePage /> },
      { id: "settings-company",            paths: ["/settings/company"],           render: () => <CompanySettingsPage /> },
      { id: "settings-backup",             paths: ["/settings/backup"],            render: () => <BackupPage /> },

      // Inventory Routes
      { id: "inventory", paths: ["/inventory", "/inventory/products"], render: () => <Inventory /> },
      { id: "inventory-categories", paths: ["/inventory/categories"], render: () => <PlaceholderComponent moduleName="Inventory" title="Categories" /> },
      { id: "import", paths: ["/import"], render: () => <ImportDataPage /> },

      { id: "prediction", paths: ["/prediction"], render: () => <Prediction /> },
      { id: "attendance", paths: ["/attendance"], render: () => <Attendance />, roles: ["admin", "hr", "employee", "superadmin"] },
      { id: "crm", paths: ["/crm"], render: () => <CRM /> },
      { id: "investments", paths: ["/investments"], render: () => <Investmentpage />, roles: ["admin", "superadmin"] },
      {
        id: "superadminaccess",
        paths: ["/superadminaccess"],
        render: () => <AdminStatusManager />,
        roles: ["superadmin"]
      },
    ],
    []
  );

  // const handlePaymentSuccess = (data) => {
  //   setUserData(data);
  // };
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalDataStoreProvider>
        <AuthProvider>
          <TooltipProvider>
            {/* Radix-based Toaster (top-center) */}
            <RadixToaster />
          <BrowserRouter>
            <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center">Loading...</div>}>
            <Routes>
            <Route
              path="/*"
              element={
                <LayoutWrapper>
                  <Routes>
                    <Route
                      path="/employee/edit/:id"
                      element={
                        <ProtectedRoute>
                          <EditEmployee onSuccess={() => {}} />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/purchase/expenses/view/:id"
                      element={
                        <ProtectedRoute>
                          <ExpenseDetailPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="*"
                      element={
                        <ProtectedRoute>
                          <ProtectedKeepAliveRouter
                            pages={protectedKeepAlivePages}
                            fallback={<NotFound />}
                          />
                        </ProtectedRoute>
                      }
                    />

                    {/* Public Routes */}
                    <Route
                      path="/home"
                      element={
                        <PublicRoute>
                          <Home />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/contact-sales"
                      element={
                        <PublicRoute>
                          <Sales />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <PublicRoute>
                          <LoginPage />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/employeelogin"
                      element={
                        <PublicRoute>
                          <EmployeeLoginPage />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/reset-password/:token"
                      element={
                        <PublicRoute>
                          <ResetPassword />
                        </PublicRoute>
                      }
                    />

                    <Route
                      path="/superadminlogin--34567"
                      element={
                        <PublicRoute>
                          <AdminLoginPage />
                        </PublicRoute>
                      }
                    />

                    <Route
                      path="/superadmincreate--34567"
                      element={
                        <PublicRoute>
                          <AdminSignupPage />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/reset-password-employee/:token"
                      element={
                        <PublicRoute>
                          <ResetPasswordEmployee />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/forgetpassword"
                      element={
                        <PublicRoute>
                          <Forgetpassword />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/forgetpasswordemployee"
                      element={
                        <PublicRoute>
                          <ForgotPasswordEmployee />
                        </PublicRoute>
                      }
                    />
                    {/* <Route
                      path="/payment/success"
                      element={
                        <PublicRoute>
                          <PaymentSuccess
                            userData={userData}
                            onSuccess={handlePaymentSuccess}
                          />
                        </PublicRoute>
                      }
                    /> */}
                    <Route
                      path="/payment-failure"
                      element={
                        <PublicRoute>
                          <PaymentFailure />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="/signup"
                      element={
                        <PublicRoute>
                          <SignupPage />
                        </PublicRoute>
                      }
                    />
                    <Route
                      path="*"
                      element={
                        <PublicRoute>
                          <NotFound />
                        </PublicRoute>
                      }
                    />
                  </Routes>
                </LayoutWrapper>
              }
            />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </GlobalDataStoreProvider>
  </QueryClientProvider>
  );
};
export default App;
