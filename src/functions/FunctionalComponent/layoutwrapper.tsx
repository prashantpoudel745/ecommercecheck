import { MainLayout } from "@/components/layout/MainLayout";
import { useLocation } from "react-router-dom";

export const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isSignupPage = location.pathname === "/signup";
  const isForgetPasswordPage = location.pathname === "/forgetpassword";
  const isEmployeeForgetPasswordPage =
    location.pathname === "/forgetpasswordemployee";

  const isResetPasswordPage = location.pathname.startsWith("/reset-password");
  const isEmployeeLoginPage = location.pathname.startsWith("/employeelogin");
  const isEmployeeResetPassword =
    location.pathname.startsWith("/employeereset");
  const isPaymentSuccessPage = location.pathname === "/payment/success";
  const isPaymentFailurePage = location.pathname === "/payment/failure";
  const isHomePage = location.pathname === "/home";
  const isContactSalesPage = location.pathname === "/contact-sales";

  // If on login page, render children directly without MainLayout
  if (
    isLoginPage ||
    isSignupPage ||
    isForgetPasswordPage ||
    isResetPasswordPage ||
    isEmployeeLoginPage ||
    isEmployeeResetPassword ||
    isPaymentSuccessPage ||
    isPaymentFailurePage ||
    isEmployeeForgetPasswordPage ||
    isHomePage ||
    isContactSalesPage
  ) {
    return children;
  }
  // Otherwise wrap with MainLayout
  return <MainLayout>{children}</MainLayout>;
};
