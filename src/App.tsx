import { Routes, Route } from 'react-router-dom'
import { ThemeProvider, ITSShell } from '@its-universe/os'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import Seller from './pages/Seller'
import SellerAdd from './pages/SellerAdd'
import Returns from './pages/Returns'
import NotFound from './pages/NotFound'

function AppContent() {
  const { user } = useAuth()
  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  return (
    <ITSShell serviceName="IT-S Market" user={itsUser}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/seller" element={<Seller />} />
        <Route path="/seller/add" element={<SellerAdd />} />
        <Route path="/returns" element={<Returns />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ITSShell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
