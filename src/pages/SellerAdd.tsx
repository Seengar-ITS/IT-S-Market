import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Upload, Loader2, CheckCircle } from 'lucide-react'

const CATS = ['Electronics','Clothing','Food','Books','Digital','Services']

export default function SellerAdd() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(''); const [desc, setDesc] = useState('')
  const [cat, setCat] = useState(CATS[0]); const [price, setPrice] = useState('')
  const [stock, setStock] = useState('0'); const [isDigital, setIsDigital] = useState(false)
  const [imageFile, setImageFile] = useState<File|null>(null)
  const [submitting, setSubmitting] = useState(false); const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); if (!user) return
    setSubmitting(true)
    let images: string[] = []
    if (imageFile) {
      const { data } = await supabase.storage.from('product-images').upload(`${user.id}/${Date.now()}_${imageFile.name}`, imageFile)
      if (data) { const { data: u } = supabase.storage.from('product-images').getPublicUrl(data.path); images = [u.publicUrl] }
    }
    await supabase.from('products').insert({ seller_id: user.id, name, description: desc, category: cat, price: parseFloat(price), currency: 'USD', stock: parseInt(stock), images, is_digital: isDigital, is_published: true })
    setSubmitting(false); setDone(true)
  }

  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  return (
    <ITSShell serviceName="IT-S Market" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/seller')} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Add Product</h1>
        </div>
        {done ? (
          <div className="flex flex-col items-center py-20 gap-3 text-center"><CheckCircle size={56} className="text-green-500"/><p className="text-xl font-bold">Product Listed!</p>
            <button onClick={() => navigate('/seller')} className="px-6 py-2 rounded-xl bg-[#6C63FF] text-white">Back to Dashboard</button></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input value={name} onChange={e=>setName(e.target.value)} required placeholder="Product Name" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-[#6C63FF]/50"/>
            <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description" rows={4} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-[#6C63FF]/50 resize-none"/>
            <div className="flex gap-3">
              <select value={cat} onChange={e=>setCat(e.target.value)} className="flex-1 px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none">
                {CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              <input value={stock} onChange={e=>setStock(e.target.value)} type="number" min="0" placeholder="Stock" className="w-24 px-3 py-3 rounded-xl border border-border bg-card text-sm outline-none"/>
            </div>
            <input value={price} onChange={e=>setPrice(e.target.value)} required type="number" min="0" step="0.01" placeholder="Price (USD)" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-sm outline-none focus:border-[#6C63FF]/50"/>
            <label className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border cursor-pointer hover:bg-muted text-sm text-muted-foreground">
              <Upload size={18}/>{imageFile ? imageFile.name : 'Upload Product Image'}
              <input type="file" accept="image/*" className="hidden" onChange={e=>setImageFile(e.target.files?.[0]??null)}/>
            </label>
            <label className="flex items-center gap-3 text-sm cursor-pointer">
              <input type="checkbox" checked={isDigital} onChange={e=>setIsDigital(e.target.checked)} className="w-4 h-4 rounded"/>
              Digital product
            </label>
            <button type="submit" disabled={submitting||!name||!price} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6C63FF] text-white font-medium disabled:opacity-40">
              {submitting ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18}/>} List Product
            </button>
          </form>
        )}
      </div>
    </ITSShell>
  )
}
