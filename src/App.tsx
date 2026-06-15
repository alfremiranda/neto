import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { MesView } from '@/components/views/MesView'
import { AnoView } from '@/components/views/AnoView'
import { Toast } from '@/components/ui/Toast'
import { useUIStore } from '@/store/uiStore'
import { useFinanceStore } from '@/store/financeStore'
import { sbReady } from '@/lib/supabase'

export default function App() {
  const view = useUIStore(s => s.view)
  const syncFromCloud = useFinanceStore(s => s.syncFromCloud)

  useEffect(() => {
    if (sbReady()) {
      syncFromCloud().catch(() => {})
    }
  }, [syncFromCloud])

  return (
    <div className="max-w-[720px] mx-auto px-3">
      <Header />
      <div className="flex items-start gap-[10px]">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-[calc(68px+env(safe-area-inset-bottom))] sm:pb-0">
          {view === 'mes' ? <MesView /> : <AnoView />}
        </main>
      </div>
      <Toast />
    </div>
  )
}
