import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Sign_up from "./components/Sign_up";
import Dashboard from "./components/daschbord";
import SidebarLayout from "./components/navebar_layout"; // layout with sidebar
import 'bootstrap/dist/css/bootstrap.min.css';


function AppRoutes() {
  const location = useLocation();
  const isSignupPage = location.pathname === "/";

  return (
    <>
      {isSignupPage ? (
        <Sign_up />
      ) : (
        <SidebarLayout>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Add more routes here */}
          </Routes>
        </SidebarLayout>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;



