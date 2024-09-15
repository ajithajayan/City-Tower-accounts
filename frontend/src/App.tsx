import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ErrorBoundary from "./components/Layout/ErrorBoundary";
import NotFound404 from "./components/Layout/NotFound404";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute, {
  AuthenticatedRoute,
} from "./components/Layout/ProtectedRoute";
import Unauthorized from "./components/Layout/Unauthorized";
import { Provider } from "react-redux";
import store from "./features/store";
import Loader from "./components/Layout/Loader";
import TokenExpirationModal from "./components/modals/TokenExpirationModal";
import PasscodeLoginPage from "./pages/PasscodeLoginPage";
import { DeliveryDriverOrdersPage } from "./pages/deliveryDriver/DeliveryDriverOrdersPage";
import { DeliveryDriverProfile } from "./pages/deliveryDriver/DeliveryDriverProfile";
import CreditUsersPage from "./pages/CreditUsersPage";

const queryClient = new QueryClient();

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const DishesPage = lazy(() => import("./pages/DishesPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const BillsPage = lazy(() => import("./pages/BillsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const DiningTablePage = lazy(() => import("./pages/DiningTablePage"));
const CouponPage = lazy(() => import("./pages/CouponPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const MessPage = lazy(() => import("./pages/MessPage"));
const SalesReportPage = lazy(() => import("./pages/SalesReportPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const ShareManagement = lazy(() => import("./pages/ShareManagement"));
const DayBookPage = lazy(() => import("./pages/DayBookPage"));
const SalesEntry = lazy(() => import("./pages/SaleEntryPage"))
function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Router>
            <TokenExpirationModal />
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route
                  path="/login"
                  element={
                    <AuthenticatedRoute>
                      <LoginPage />
                    </AuthenticatedRoute>
                  }
                />
                <Route
                  path="/login-passcode"
                  element={
                    <AuthenticatedRoute>
                      <PasscodeLoginPage />
                    </AuthenticatedRoute>
                  }
                />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dishes"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <DishesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bills"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <BillsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dining-table"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <DiningTablePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/coupons"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <CouponPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <HomePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mess"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <MessPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/salesreport"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <SalesReportPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/credit-users"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <CreditUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <TransactionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/share-management"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <ShareManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/day-book"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <DayBookPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sales-entry"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <SalesEntry  />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute allowedRoles={["staff", "admin"]}>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Delivery Driver Routes */}
                <Route
                  path="/driver"
                  element={
                    <ProtectedRoute allowedRoles={["driver"]}>
                      <DeliveryDriverOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/driver/profile/:driverId"
                  element={
                    <ProtectedRoute allowedRoles={["driver"]}>
                      <DeliveryDriverProfile />
                    </ProtectedRoute>
                  }
                />

                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound404 />} />
              </Routes>
            </Suspense>
          </Router>
        </QueryClientProvider>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
