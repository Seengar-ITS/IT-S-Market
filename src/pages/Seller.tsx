import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Package, Loader2 } from 'lucide-react'

interface Product { id: string; name: string; price: number; currency: string; stock: number; is_published: boolean }

export default function Seller() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data ?? []); setLoading(false) })
  }, [user])

  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  if (authLoading || loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>

  return (
    <ITSShell serviceName="IT-S Market" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Seller Dashboard</h1>
          <button onClick={() => navigate('/seller/add')} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C63FF] text-white text-sm font-medium"><Plus size={16}/>Add Product</button>
        </div>
        {products.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground"><Package size={40} className="opacity-40"/><p className="text-sm">No products listed</p></div>
        ) : (
          <ul className="space-y-3">
            {products.map(p => (
              <li key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
                <div><p className="font-semibold text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{p.price} {p.currency} · Stock: {p.stock}</p></div>
                <span className={`text-xs px-2 py-1 rounded-full ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>{p.is_published ? 'Live' : 'Draft'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ITSShell>
  )
}
