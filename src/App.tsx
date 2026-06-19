import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { AppSidebar, Sidebar_MobileNav } from '@/components/layout/Sidebar'
import { MesView } from '@/components/views/MesView'
import { AnoView } from '@/components/views/AnoView'
import { ConfigView } from '@/components/views/ConfigView'
import { CuentasView } from '@/components/views/CuentasView'
import { Toast } from '@/components/ui/Toast'
import { AccountEditSheet } from '@/components/sheets/AccountEditSheet'
import { BalanceSheet } from '@/components/sheets/BalanceSheet'
import { TransferSheet } from '@/components/sheets/TransferSheet'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
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
    <TooltipProvider>
      <div className="h-screen overflow-hidden flex flex-col">
        <Header />

        <SidebarProvider
          defaultOpen
          className="flex-1 min-h-0 overflow-hidden"
        >
          <AppSidebar />

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-6 pb-[calc(72px+env(safe-area-inset-bottom))] sm:pb-5 lg:pb-6 bg-[var(--background)] min-w-0">
            <div className="max-w-5xl mx-auto">
              {view === 'mes'     && <MesView />}
              {view === 'ano'     && <AnoView />}
              {view === 'cuentas' && <CuentasView />}
              {view === 'config'  && <ConfigView />}
            </div>
          </main>
        </SidebarProvider>

        <Sidebar_MobileNav />

        {/* Global sheets */}
        <AccountEditSheet />
        <BalanceSheet />
        <TransferSheet />
        <Toast />
      </div>
    </TooltipProvider>
  )
}
