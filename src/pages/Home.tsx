import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Search, ShoppingCart, Loader2 } from 'lucide-react'

interface Product { id: string; name: string; description: string; category: string; price: number; currency: string; images: string[]; stock: number; is_digital: boolean }
const CATS = ['All','Electronics','Clothing','Food','Books','Digital','Services']

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState(''); const [cat, setCat] = useState('All')
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    let q = supabase.from('products').select('*').eq('is_published', true).order('created_at', { ascending: false })
    if (cat !== 'All') q = q.eq('category', cat)
    if (query) q = q.ilike('name', `%${query}%`)
    q.then(({ data }) => { setProducts(data ?? []); setLoading(false) })
  }, [query, cat])

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('its-market-cart') ?? '[]')
    setCartCount(cart.length)
  }, [])

  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  if (authLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>

  return (
    <ITSShell serviceName="IT-S Market" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">IT-S Market</h1>
          <div className="flex gap-2">
            <button onClick={() => navigate('/orders')} className="text-sm text-[#6C63FF] hover:underline">Orders</button>
            <button onClick={() => navigate('/cart')} className="relative p-2 rounded-lg hover:bg-muted">
              <ShoppingCart size={20}/>{cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#6C63FF] text-white text-[9px] flex items-center justify-center">{cartCount}</span>}
            </button>
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-[#6C63FF]/50"/>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATS.map(c => <button key={c} onClick={() => setCat(c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${cat === c ? 'bg-[#6C63FF] text-white' : 'border border-border hover:bg-muted'}`}>{c}</button>)}
        </div>
        {loading ? <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#6C63FF]" size={28}/></div> : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No products found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(p => (
              <button key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                className="text-left rounded-xl border border-border bg-card overflow-hidden hover:border-[#6C63FF]/40 transition-colors">
                <div className="h-36 bg-muted flex items-center justify-center">
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover"/> :
                    <div className="text-4xl text-muted-foreground opacity-30">📦</div>}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · Stock: {p.stock}</p>
                  <p className="text-sm font-bold text-[#6C63FF] mt-1">{p.price} {p.currency}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </ITSShell>
  )
}
