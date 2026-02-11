import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Transactions from "./pages/Transactions";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* CATEGORIES */}
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Categories />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* TRANSACTIONS */}
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Transactions />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
