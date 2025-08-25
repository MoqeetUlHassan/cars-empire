import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth.jsx';

// Layout Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import VehicleListPage from './pages/VehicleListPage';
import VehicleDetailPage from './pages/VehicleDetailPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CreateListingPage from './pages/CreateListingPage';
import EditListingPage from './pages/EditListingPage';
import MyListingsPage from './pages/MyListingsPage';
import ProfilePage from './pages/Dashboard/ProfilePage';
import GaragePage from './pages/Dashboard/GaragePage';
import AddGarageVehiclePage from './pages/Dashboard/AddGarageVehiclePage';
import EditGarageVehiclePage from './pages/Dashboard/EditGarageVehiclePage';
import ViewGarageVehiclePage from './pages/Dashboard/ViewGarageVehiclePage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="vehicles" element={<VehicleListPage />} />
                <Route path="vehicles/:id" element={<VehicleDetailPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardPage />} />
                <Route path="create-listing" element={<CreateListingPage />} />
                <Route path="edit-listing/:id" element={<EditListingPage />} />
                <Route path="my-listings" element={<MyListingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="garage" element={<GaragePage />} />
                <Route path="garage/add" element={<AddGarageVehiclePage />} />
                <Route path="garage/:id" element={<ViewGarageVehiclePage />} />
                <Route path="garage/:id/edit" element={<EditGarageVehiclePage />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
