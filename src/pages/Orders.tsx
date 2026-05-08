import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Package, Loader2 } from 'lucide-react'

interface Order { id: string; product_id: string; quantity: number; total_amount: number; currency: string; status: string; created_at: string; products: { name: string } }

export default function Orders() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('orders').select('*, products(name)').eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setOrders((data ?? []) as Order[]); setLoading(false) })
  }, [user])

  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  if (authLoading || loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>

  return (
    <ITSShell serviceName="IT-S Market" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">My Orders</h1>
        </div>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3 text-muted-foreground"><Package size={40} className="opacity-40"/><p className="text-sm">No orders yet</p></div>
        ) : (
          <ul className="space-y-3">
            {orders.map(o => (
              <li key={o.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm">{o.products?.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>{o.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">Qty: {o.quantity} · {Number(o.total_amount).toFixed(2)} {o.currency}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ITSShell>
  )
}
