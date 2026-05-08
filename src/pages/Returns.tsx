import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ITSShell } from '@its-universe/os'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, RotateCcw, Loader2 } from 'lucide-react'

interface ReturnRow { id: string; order_id: string; reason: string; status: string; created_at: string }

export default function Returns() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [returns, setReturns] = useState<ReturnRow[]>([])
  const [orderId, setOrderId] = useState(''); const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    supabase.from('returns').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setReturns(data ?? []); setLoading(false) })
  }, [])

  async function submitReturn(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true)
    const { data } = await supabase.from('returns').insert({ order_id: orderId, reason, status: 'pending' }).select().single()
    if (data) setReturns(prev => [data, ...prev])
    setOrderId(''); setReason(''); setSubmitting(false)
  }

  const itsUser = user ? { id: user.id, name: user.email, email: user.email } : null
  if (authLoading || loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin text-[#6C63FF]" size={32}/></div>

  return (
    <ITSShell serviceName="IT-S Market" user={itsUser} onAvatarClick={signOut}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold">Returns</h1>
        </div>
        <form onSubmit={submitReturn} className="rounded-xl border border-border bg-card p-4 space-y-3 mb-6">
          <h2 className="font-semibold text-sm">Request a Return</h2>
          <input value={orderId} onChange={e=>setOrderId(e.target.value)} required placeholder="Order ID" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-[#6C63FF]/50"/>
          <textarea value={reason} onChange={e=>setReason(e.target.value)} required placeholder="Reason for return" rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none focus:border-[#6C63FF]/50 resize-none"/>
          <button type="submit" disabled={submitting||!orderId||!reason} className="w-full py-2.5 rounded-xl bg-[#6C63FF] text-white text-sm font-medium disabled:opacity-40">
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>
        {returns.map(r => (
          <div key={r.id} className="p-4 rounded-xl border border-border bg-card mb-2">
            <div className="flex justify-between items-start">
              <div><p className="text-sm font-medium">Order: {r.order_id.slice(0,8)}...</p><p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p></div>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${r.status==='approved'?'bg-green-100 text-green-700':r.status==='rejected'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{r.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
          </div>
        ))}
        {returns.length === 0 && <div className="flex flex-col items-center py-12 gap-3 text-muted-foreground"><RotateCcw size={32} className="opacity-40"/><p className="text-sm">No return requests</p></div>}
      </div>
    </ITSShell>
  )
}
