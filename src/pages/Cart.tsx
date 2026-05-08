import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, ShoppingCart, Trash2, CreditCard } from 'lucide-react'

interface CartItem { id: string; name: string; price: number; currency: string; quantity: number }

export default function Cart() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => { setItems(JSON.parse(localStorage.getItem('its-market-cart') ?? '[]')) }, [])

  function remove(id: string) {
    const updated = items.filter(i => i.id !== id)
    setItems(updated); localStorage.setItem('its-market-cart', JSON.stringify(updated))
  }

  function changeQty(id: string, qty: number) {
    const updated = items.map(i => i.id === id ? {...i, quantity: Math.max(1, qty)} : i)
    setItems(updated); localStorage.setItem('its-market-cart', JSON.stringify(updated))
  }

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const itsUser = user ? {id:user.id, name:user.email, email:user.email} : null

  return (
    <ITSShell serviceName="IT-S Market" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Cart</h1>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-muted-foreground">
            <ShoppingCart size={40} className="opacity-40"/>
            <p className="text-sm">Your cart is empty</p>
            <button onClick={() => navigate('/')} className="text-[#6C63FF] text-sm hover:underline">Browse products</button>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-6">
              {items.map(i => (
                <li key={i.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{i.name}</p>
                    <p className="text-sm text-[#6C63FF] font-medium">{i.price} {i.currency}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(i.id, i.quantity-1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-sm hover:bg-muted">-</button>
                    <span className="text-sm w-6 text-center">{i.quantity}</span>
                    <button onClick={() => changeQty(i.id, i.quantity+1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-sm hover:bg-muted">+</button>
                  </div>
                  <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-red-500 p-1"><Trash2 size={16}/></button>
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex justify-between font-semibold">
                <span>Total</span><span className="text-[#6C63FF]">{total.toFixed(2)} {items[0]?.currency}</span>
              </div>
              <a href="https://it-s-pay.vercel.app/send" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6C63FF] text-white font-medium hover:bg-[#5a52e0]">
                <CreditCard size={18}/>Checkout via IT-S Pay
              </a>
            </div>
          </>
        )}
      </div>
    </ITSShell>
  )
}
