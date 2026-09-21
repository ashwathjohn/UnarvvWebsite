import {
  Routes,
  Route,
} from "react-router-dom";

import ScrollToTop from "./components/common/ScrollToTop";

import Home from "./pages/Home";
import Pass from "./pages/Pass";
import RetrievePass from "./pages/RetrievePass";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      {/* ================================================================
          GLOBAL SCROLL HANDLER
      ================================================================= */}

      <ScrollToTop />

      {/* ================================================================
          APPLICATION ROUTES
      ================================================================= */}

      <Routes>
        {/* PUBLIC HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* RETRIEVE EXISTING PASS */}

        <Route
          path="/retrieve-pass"
          element={<RetrievePass />}
        />

        {/* PARTICIPANT PASS */}

        <Route
          path="/pass/:token"
          element={<Pass />}
        />

        {/* ADMIN LOGIN */}

        <Route
          path="/admin"
          element={<AdminLogin />}
        />

        {/* ADMIN DASHBOARD */}

        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Routes>
    </>
  );
}

export default App;