import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Pass from "./pages/Pass";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import RetrievePass from "./pages/RetrievePass";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
  path="/retrieve-pass"
  element={<RetrievePass />}
/>

      <Route path="/pass/:token" element={<Pass />} />

      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;