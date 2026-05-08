import { useNavigate } from "react-router-dom"
export default function NotFound() {
  const nav = useNavigate()
  return <div className="flex flex-col items-center justify-center h-screen gap-4"><p className="text-6xl font-bold text-[#6C63FF]">404</p><p className="text-muted-foreground">Page not found</p><button onClick={()=>nav("/")} className="px-6 py-2 rounded-xl bg-[#6C63FF] text-white">Go Home</button></div>
}
