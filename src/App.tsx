import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import BaseLayout from "./layout/BaseLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import ProductCreate from "./pages/ProductCreate";
import Sales from "./pages/Sales";
import Purchases from "./pages/Purchases";
import PurchaseCreate from "./pages/PurchaseCreate";
import Reports from "./pages/Reports";
import Solds from "./pages/Solds"
import SalesHistory from "./pages/SalesHistory";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <BaseLayout><Dashboard /></BaseLayout>
            </PrivateRoute>
          } />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <BaseLayout><Products /></BaseLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <PrivateRoute>
              <BaseLayout><ProductCreate /></BaseLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <Sales />
            </PrivateRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <PrivateRoute>
              <BaseLayout><Purchases /></BaseLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchases/new"
          element={
            <PrivateRoute>
              <BaseLayout><PurchaseCreate /></BaseLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <BaseLayout><Reports /></BaseLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/solds"
          element={
            <PrivateRoute>
              <BaseLayout><Solds /></BaseLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales_history"
          element={
            <PrivateRoute>
              <BaseLayout><SalesHistory /></BaseLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
