import { useCallback, useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import useMarketplaceController from "./hooks/useMarketplaceController.js";
import SiteHeader from "./components/SiteHeader.jsx";
import NoticeBanner from "./components/NoticeBanner.jsx";
import SiteFooter from "./components/SiteFooter.jsx";
import AuthModal from "./components/AuthModal.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ShopPage from "./pages/ShopPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import SellerPage from "./pages/SellerPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AccountPage from "./pages/AccountPage.jsx";

const PATH_BY_PAGE = {
  shop: "/",
  cart: "/cart",
  seller: "/seller",
  orders: "/orders",
  admin: "/admin",
  account: "/account",
};
const PAGE_BY_PATH = {
  "/": "shop",
  "/cart": "cart",
  "/seller": "seller",
  "/orders": "orders",
  "/admin": "admin",
  "/account": "account",
};

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateForController = useCallback(
    (page) => {
      const path = PATH_BY_PAGE[page] || "/";
      if (location.pathname !== path) navigate(path);
    },
    [location.pathname, navigate],
  );
  const app = useMarketplaceController(navigateForController);
  const {
    page: controllerPage,
    setPage: setControllerPage,
    setResetForm,
    setModal,
    user,
    setError,
  } = app;

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("resetToken");
    if (token) {
      setResetForm((old) => ({ ...old, token }));
      setModal("reset");
    }
  }, [location.search, setModal, setResetForm]);

  const goToPage = useCallback(
    (page) => {
      const path = PATH_BY_PAGE[page] || "/";
      setControllerPage(PAGE_BY_PATH[path] || "shop");
      if (location.pathname !== path) navigate(path);
    },
    [location.pathname, navigate, setControllerPage],
  );

  // Keep existing controller workflows (e.g. checkout -> orders) synchronized with URL routes.
  useEffect(() => {
    const page = PAGE_BY_PATH[location.pathname];
    if (page && page !== controllerPage) setControllerPage(page);
  }, [location.pathname, controllerPage, setControllerPage]);

  // If a protected URL redirected to the shop, open login; after login, return to the requested URL.
  useEffect(() => {
    if (!user && location.state?.openLogin) setModal("login");
    if (user && location.state?.from?.pathname) {
      const target = location.state.from.pathname;
      const allowed =
        target === "/orders" ||
        target === "/account" ||
        (target === "/seller" && user.role === "seller") ||
        (target === "/admin" && user.role === "admin");
      if (allowed) navigate(target, { replace: true, state: null });
      else if (target === "/seller" || target === "/admin") {
        setError(
          "Your account does not have permission to open that page.",
        );
        navigate("/", { replace: true, state: null });
      }
    }
    if (location.state?.forbidden)
        setError("Your account does not have permission to open that page.");
      }, [user, setError, setModal, location.state, navigate]);

  const navProps = {
    ...app,
    page: PAGE_BY_PATH[location.pathname] || "shop",
    setPage: goToPage,
  };

  return (
    <div className="app-shell">
      <SiteHeader {...navProps} />
      <main>
        <NoticeBanner
          notice={app.notice}
          setNotice={app.setNotice}
          error={app.error}
          setError={app.setError}
        />
        <Routes>
          <Route path="/" element={<ShopPage {...app} />} />
          <Route
            path="/cart"
            element={<CartPage {...app} setPage={goToPage} />}
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute user={app.user}>
                <OrdersPage {...app} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute user={app.user} allowedRoles={["seller"]}>
                <SellerPage {...app} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={app.user} allowedRoles={["admin"]}>
                <AdminPage {...app} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute user={app.user}>
                <AccountPage {...app} />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <SiteFooter setPage={goToPage} />
      <AuthModal {...app} />
    </div>
  );
}
