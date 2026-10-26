/** @format */

import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import AppLayout from "./pages/AppLayout";
import DashboardLayout from "./pages/DashboardLayout";
import Account from "./pages/Account";
import Inventory from "./pages/Inventory";
import Order from "./pages/Order";
import AuthFormComponent from "./pages/AuthPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Protect from "./components/Protect";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Wrapper from "./pages/Wrapper";
import InteractiveMap from "./pages/InteractiveMap";
import { useMemo } from "react"; // Import useMemo
import LandingPage from "./pages/LandingPage";
import { auth } from "./features/authMethods";

const router = createBrowserRouter([
  {
    path: "login",
    element: <AuthFormComponent />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
    ],
  },
  {
    path: "dashboard",
    element: (
      <Protect>
        <DashboardLayout />
      </Protect>
    ),
    children: [
      { index: true, element: <Navigate to="order" replace /> },
      {
        path: "account",
        element: <Account />,
      },
      { path: "home", element: <Navigate to="../order" replace /> },
      { path: "product", element: <Navigate to="../inventory" replace /> },
      {
        path: "inventory",
        element: <Inventory />,
      },
      {
        path: "order",
        element: <Order />,
      },
      {
        path: "map",
        element: <InteractiveMap />,
      },
    ],
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

// Many components read ["user"] without their own queryFn; registering it here
// means refetches never fail with "Missing queryFn" and log the user out.
queryClient.setQueryDefaults(["user"], {
  queryFn: () => auth.isAuthenticated(),
  retry: false,
});

function App() {
  const devtools = useMemo(
    () =>
      process.env.NODE_ENV === "development" ? (
        <div>
          <ReactQueryDevtools initialIsOpen={false} />
        </div>
      ) : null,
    [],
  );
  const routerProvider = useMemo(
    () => <RouterProvider router={router} />,
    [router],
  );

  return (
    <QueryClientProvider client={queryClient}>
      {devtools}
      <Wrapper>{routerProvider}</Wrapper>
    </QueryClientProvider>
  );
}

export default App;
