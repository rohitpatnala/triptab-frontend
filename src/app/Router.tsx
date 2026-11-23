
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppShell from "../components/layout/AppShell";
import Dashboard from "../features/dashboard/Dashboard";
import TripDetails from "../features/trips/TripDetails";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />

          <Route path="/trips" element={<Dashboard />} />

          <Route
            path="/trips/:tripId"
            element={<TripDetails />}
          />

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
