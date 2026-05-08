import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, ShoppingCart, Star, Loader2 } from 'lucide-react'

interface Product { id: string; name: string; description: string; category: string; price: number; currency: string; images: string[]; stock: number; is_digital: boolean; seller_id: string }
interface Review { id: string; user_id: string; rating: number; review: string; created_at: string }

export default function ProductDetail() {
  const { id } = useParams<{id:string}>()
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product|null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5); const [review, setReview] = useState('')
  const [imgIdx, setImgIdx] = useState(0); const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('products').select('*').eq('id', id).single(),
      supabase.from('product_reviews').select('*').eq('product_id', id).order('created_at', { ascending: false })
    ]).then(([{data:p},{data:r}]) => { setProduct(p); setReviews(r??[]); setLoading(false) })
  }, [id])

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('its-market-cart') ?? '[]')
    if (!cart.find((i: {id:string}) => i.id === id)) {
      cart.push({ id, name: product?.name, price: product?.price, currency: product?.currency, quantity: 1 })
      localStorage.setItem('its-market-cart', JSON.stringify(cart))
    }
    setAdded(true)
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault(); if (!user || !id) return
    await supabase.from('product_reviews').upsert({ product_id: id, user_id: user.id, rating, review }, { onConflict: 'product_id,user_id' })
    const {data} = await supabase.from('product_reviews').select('*').eq('product_id', id).order('created_at', { ascending: false })
    setReviews(data??[]); setReview('')
  }

  if (authLoading || loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>
  if (!product) return <div className="flex items-center justify-center h-screen text-muted-foreground">Product not found</div>
  const itsUser = user ? {id:user.id, name:user.email, email:user.email} : null
  const avgRating = reviews.length ? (reviews.reduce((s,r) => s+r.rating, 0)/reviews.length).toFixed(1) : null

  return (
    <ITSShell serviceName="IT-S Market" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm"><ArrowLeft size={16}/>Back</button>
        {product.images?.length > 0 && (
          <div>
            <div className="h-64 rounded-xl bg-muted overflow-hidden"><img src={product.images[imgIdx]} alt="" className="w-full h-full object-cover"/></div>
            {product.images.length > 1 && <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => <button key={i} onClick={() => setImgIdx(i)} className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 ${imgIdx===i?'border-[#6C63FF]':'border-transparent'}`}><img src={img} alt="" className="w-full h-full object-cover"/></button>)}
            </div>}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold">{product.name}</h1>
          <p className="text-sm text-muted-foreground">{product.category} · Stock: {product.stock}</p>
          {avgRating && <p className="text-sm flex items-center gap-1 mt-1"><Star size={13} className="fill-amber-400 text-amber-400"/>{avgRating} ({reviews.length})</p>}
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-[#6C63FF]">{product.price} {product.currency}</span>
          <button onClick={addToCart} disabled={added || product.stock === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6C63FF] text-white font-medium hover:bg-[#5a52e0] disabled:opacity-40">
            <ShoppingCart size={16}/>{added ? 'Added to Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          {added && <button onClick={() => navigate('/cart')} className="text-sm text-[#6C63FF] hover:underline">View Cart</button>}
        </div>
        <div>
          <h2 className="font-semibold mb-3">Reviews ({reviews.length})</h2>
          {user && (
            <form onSubmit={submitReview} className="rounded-xl border border-border bg-card p-4 mb-4 space-y-3">
              <div className="flex gap-1">{[1,2,3,4,5].map(s=><button key={s} type="button" onClick={()=>setRating(s)}><Star size={20} className={s<=rating?'fill-amber-400 text-amber-400':'text-muted-foreground'}/></button>)}</div>
              <textarea value={review} onChange={e=>setReview(e.target.value)} placeholder="Write a review..." rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-[#6C63FF]/50 resize-none"/>
              <button type="submit" className="px-4 py-2 rounded-lg bg-[#6C63FF] text-white text-sm">Submit</button>
            </form>
          )}
          {reviews.map(r => (
            <div key={r.id} className="p-3 rounded-xl border border-border bg-card mb-2">
              <div className="flex gap-0.5 mb-1">{[1,2,3,4,5].map(s=><Star key={s} size={12} className={s<=r.rating?'fill-amber-400 text-amber-400':'text-muted-foreground'}/>)}</div>
              <p className="text-sm">{r.review}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </ITSShell>
  )
}
