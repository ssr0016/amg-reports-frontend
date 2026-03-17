import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Dashboard from "./pages/Dashboard";
import CreateReport from "./pages/CreateReport";
import EditReport from "./pages/EditReport";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-report" element={<CreateReport />} />
        <Route path="/edit-report/:id" element={<EditReport />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
