import { createBrowserRouter } from "react-router-dom";
import LoginPage from "./pages/authPages/LoginPage";
import SignupPage from "./pages/authPages/SignupPage";
import App from "./App"
import AuthLayout from "./pages/layouts/AuthLayout";
import DefaultLayout from "./pages/layouts/DefaultLayout";
import VerifyPage from "./pages/authPages/VerifyPage";
import VerifySuccess from "./pages/authPages/VerifySuccess";
import CategoriesPage from "./pages/CategoriesPage";
import OrdersPage from "./pages/OrdersPages";

import FarmsPage from "./pages/FarmsPage";
import FarmsDetail from "./pages/FarmsDetail";

import ProductDetail from "./pages/ProductDetail";
import ProfilePage from "./pages/ProfilePage";
import OrderHistoryPage from "./pages/OrderHistoryPage";
import ProfileLayout from "./pages/layouts/ProfileLayout";
import DashboardPage from "./pages/DashboardPage";
import AdminOnly from "./components/AdminOnly";
import { fetchFarm, fetchFarmProducts, fetchProduct } from "./controllers/productController";

export const routes= createBrowserRouter([
  {
    path: "/",
    Component: DefaultLayout,
    children: [
      {
        index: true,
        Component: App
      },
      {
        path: "categories",
        Component: CategoriesPage
      },
      {
        Component: ProfileLayout,
        children: [
          {
            path: "profile",
            Component: ProfilePage
          },
          {
            path: "order-history",
            Component: OrderHistoryPage
          },
          {
            path: "dashboard",
            element: <AdminOnly><DashboardPage /></AdminOnly>
          },
          {
            path: "admin",
            element: <AdminOnly><DashboardPage /></AdminOnly>
          },
        ]
      },
      {
        path: "farms",
        children: [
          {
            index: true,
            Component: FarmsPage,
          },
          {
            path: ":farmId",
            children: [
              {
                index: true,
                Component: FarmsDetail,
                loader: async ({ params }) => {
                  const { farmId } = params;
                  const farm = await fetchFarm(farmId);
                  const products = await fetchFarmProducts(farmId);
                  return { farm, products };
                }
              },
              {
                path: "products",
                Component: ProductDetail,
              },
            ]
          },
        ]
      },
      {
        path: "product/:productId",
        Component: ProductDetail,
        loader: async ({ params }) => {
          const { productId } = params;
          const product = await fetchProduct(productId);
          return { product };
        }
      },
      {
        path: "orders",
        Component: OrdersPage
      },

    ]
  },
  {
    path: "/auth",
    Component: AuthLayout,
    children: [
      {
        path: "login",
        Component: LoginPage,
      },
      {
        path: "signup",
        Component: SignupPage,
      },
      {
        path: "verify",
        Component: VerifyPage,
      },
      {
        path: "verify/success",
        Component: VerifySuccess,
      },
    ]
  },
]);
