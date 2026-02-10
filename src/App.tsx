import React from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/layout/PrivateRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { OrdersList, OrderDetail, CreateOrder } from './pages/Orders';
import Finances from './pages/Finances';
import Track from './pages/Track';

// Wrapper to pass URL param as prop
const OrderDetailWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <OrderDetail id={id || ''} />;
};

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track" element={<Track />} />

            {/* Private */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute><OrdersList /></PrivateRoute>} />
            <Route path="/orders/new" element={<PrivateRoute><CreateOrder /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute><OrderDetailWrapper /></PrivateRoute>} />
            <Route path="/finances" element={<PrivateRoute><Finances /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <p className="font-display font-800 text-6xl text-steel-700">404</p>
                <p className="text-silver-400">Página no encontrada</p>
                <a href="/" className="btn-steel btn-sm">Volver al inicio</a>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
