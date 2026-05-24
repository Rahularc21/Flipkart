import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Providers contexts
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';

// Core structural components
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Target web screens
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirm from './pages/OrderConfirm.jsx';
import OrderHistory from './pages/OrderHistory.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import Wishlist from './pages/Wishlist.jsx';

// Initialize React Query client loggers
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1
    }
  }
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                
                <div className="min-h-screen flex flex-col bg-[#F1F3F6] text-[#212121]">
                  
                  {/* Global notification toaster */}
                  <Toaster 
                    position="top-center" 
                    toastOptions={{
                      duration: 3500,
                      style: {
                        background: '#333',
                        color: '#fff',
                        fontSize: '12px',
                        borderRadius: '4px'
                      }
                    }} 
                  />

                  {/* Header navigation anchors */}
                  <Navbar />

                  {/* Body container with router paths */}
                  <main className="flex-grow pt-2.5 pb-16">
                    <Routes>
                      
                      {/* Public routes available to all clients */}
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />

                      {/* Secured routes requiring authenticated sessions */}
                      <Route 
                        path="/checkout" 
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        } 
                      />
                      
                      <Route 
                        path="/order-confirm" 
                        element={
                          <ProtectedRoute>
                            <OrderConfirm />
                          </ProtectedRoute>
                        } 
                      />

                      <Route 
                        path="/orders" 
                        element={
                          <ProtectedRoute>
                            <OrderHistory />
                          </ProtectedRoute>
                        } 
                      />

                      <Route 
                        path="/orders/:id" 
                        element={
                          <ProtectedRoute>
                            <OrderDetail />
                          </ProtectedRoute>
                        } 
                      />

                      <Route 
                        path="/wishlist" 
                        element={
                          <ProtectedRoute>
                            <Wishlist />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Fallback pattern redirecting queries back home */}
                      <Route path="*" element={<Navigate to="/" replace />} />

                    </Routes>
                  </main>

                  {/* Aesthetic footer baseboard */}
                  <Footer />

                </div>

              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
