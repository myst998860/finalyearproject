import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from './Component/Login'
import Registration from './Component/Registration'
import Aboutus from './Component/Aboutus'
import Shop from './Component/Shop'
import BillingPage from './Component/BillingPage'
import TestEsewaPayment from './Component/TestEsewaPayment'
import RegisterOrganization from './Component/RegisterOrganization'
import HomePage from './Component/HomePage'
import Booklist from './Component/Booklist'
import BooklistWithCloudinary from './Component/BooklistWithCloudinary'
import BookSell from './Component/BookSell'
import BookDonate from './Component/BookDonate'
import BookExchange from './Component/BookExchange'
import RequestBook from './Component/RequestBook'
import ViewDetails from './Component/ViewDetails'
import CartPage from './Component/CartPage'
import Checkout from './Component/Checkout'
import SuccessPage from './Component/SuccessPage'
import Profile from './Component/Profile'
import Notification from './Component/Notification'
import SearchPage from './Component/SearchPage'
import ForgetPassword from './Component/ForgetPassword'
import ResetPassword from './Component/ResetPassword'
import ChangePassword from './Component/ChangePassword'
import OrderHistory from './Component/OrderHistory'
import NewCollection from './Component/NewCollection'
import UsedBooksSection from './Component/UsedBooksSection'
import { CartProvider } from './Component/CartContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Contact from './Component/Contact'
import AdminPanel from './Component/aadmin/Adminpanel'
import OrganizationOrder from './Component/aadmin/Order'
import Product from './Component/aadmin/Product'

// Admin Components
import AdminLogin from './Component/admin/src/pages/Login'
import AppLayout from './Component/admin/src/components/Layout/AppLayout'
import Dashboard from './Component/admin/src/pages/Dashboard'
import AdminUsers from './Component/admin/src/pages/Users'
import AdminBooks from './Component/admin/src/pages/Books'
import AdminOrders from './Component/admin/src/pages/Orders'
import AdminAnalytics from './Component/admin/src/pages/Analytics'
import AdminProtectedRoute from './Component/admin/src/components/AdminProtectedRoute'

// Create a QueryClient instance
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
      <CartProvider> 
        <Router>
          <Routes>
            {/* Main App Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Registration />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/about" element={<Aboutus />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/books" element={<Booklist />} />
            <Route path="/books-cloudinary" element={<BooklistWithCloudinary />} />
            <Route path="/sell" element={<BookSell />} />
            <Route path="/book-sell" element={<BookSell />} />
            <Route path="/donate" element={<BookDonate />} />
            <Route path="/book-donate" element={<BookDonate />} />
            <Route path="/exchange" element={<BookExchange />} />
            <Route path="/book-exchange" element={<BookExchange />} />
            <Route path="/request" element={<RequestBook />} />
            <Route path="/book/:id" element={<ViewDetails />} />
            <Route path="/view-details" element={<ViewDetails />} />
            <Route path="/book-details" element={<ViewDetails />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/test-payment" element={<TestEsewaPayment />} />
            <Route path="/register-organization" element={<RegisterOrganization />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notification />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/search" element={<SearchPage/>} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/order-history" element={<OrderHistory />} />
            <Route path="/new-collection" element={<NewCollection />} />
            <Route path="/used-books" element={<UsedBooksSection />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/adminpanel" element={<AdminPanel />} />
            <Route path="/organization-orders" element={<OrganizationOrder />} />
            <Route path="/organization-products" element={<Product />} />

            {/* 404 Route - Catch all undefined routes */}
            <Route path="*" element={<div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you're looking for doesn't exist.</p>
              <button onClick={() => window.history.back()}>Go Back</button>
            </div>} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AppLayout />
              </AdminProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="payments" element={<div style={{ padding: '20px' }}>Payments Management - Coming Soon</div>} />
              <Route path="reports" element={<div style={{ padding: '20px' }}>Reports - Coming Soon</div>} />
              <Route path="settings" element={<div style={{ padding: '20px' }}>Settings - Coming Soon</div>} />
            </Route>
          </Routes>
        </Router>
        <ToastContainer position="top-right" autoClose={3000} />
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
