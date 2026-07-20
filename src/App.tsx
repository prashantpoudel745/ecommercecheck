import { Toaster as Sonner } from "@/components/ui/sonner";
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
const Accounting = lazy(() => import("./pages/Accounting"));
const CRM = lazy(() => import("./pages/CRM"));
const Inventory = lazy(() => import("./pages/Inventory"));
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
      { id: "accounting", paths: ["/accounting"], render: () => <Accounting /> },
      { id: "prediction", paths: ["/prediction"], render: () => <Prediction /> },
      { id: "attendance", paths: ["/attendance"], render: () => <Attendance />, roles: ["admin", "hr", "employee", "superadmin"] },
      { id: "crm", paths: ["/crm"], render: () => <CRM /> },
      { id: "inventory", paths: ["/inventory"], render: () => <Inventory /> },
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
            <Sonner />
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
            <Sonner position="top-center" />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </GlobalDataStoreProvider>
  </QueryClientProvider>
  );
};
export default App;
