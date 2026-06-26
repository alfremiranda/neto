import { useCallback, useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { AppSidebar, Sidebar_MobileNav } from '@/components/layout/Sidebar'
import { MesView } from '@/components/views/MesView'
import { DashboardView } from '@/components/views/DashboardView'
import { ConfigView } from '@/components/views/ConfigView'
import { CuentasView } from '@/components/views/CuentasView'
import { Toast } from '@/components/ui/Toast'
import { AccountEditSheet } from '@/components/sheets/AccountEditSheet'
import { AccountDetailSheet } from '@/components/sheets/AccountDetailSheet'
import { BalanceSheet } from '@/components/sheets/BalanceSheet'
import { TransferSheet } from '@/components/sheets/TransferSheet'
import { SidebarProvider } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useFinanceStore } from '@/store/financeStore'
import { usePullToRefresh, PTR_THRESHOLD } from '@/hooks/usePullToRefresh'
import { LoginScreen } from '@/components/auth/LoginScreen'
import { OnboardingView } from '@/components/onboarding/OnboardingView'

function PullIndicator({ pullY, refreshing, isPulling }: { pullY: number; refreshing: boolean; isPulling: boolean }) {
  const progress = Math.min(pullY / PTR_THRESHOLD, 1)
  const ready    = progress >= 1
  if (pullY === 0 && !refreshing) return null
  return (
    <div
      className="flex items-center justify-center overflow-hidden shrink-0"
      style={{
        height: pullY,
        transition: isPulling ? 'none' : 'height 0.3s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      <div className={[
        'flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-colors duration-150',
        ready || refreshing
          ? 'bg-[var(--primary)] border-[var(--primary)]'
          : 'bg-[var(--card)] border-[var(--border)]',
      ].join(' ')}>
        {refreshing ? (
          <div className="w-4 h-4 border-2 border-[var(--primary-foreground)]/30 border-t-[var(--primary-foreground)] rounded-full animate-spin" />
        ) : (
          <ArrowDown
            size={14}
            className={ready ? 'text-[var(--primary-foreground)]' : 'text-muted-foreground'}
            style={{ transform: `rotate(${progress * 180}deg)`, transition: 'transform 0.1s' }}
          />
        )}
      </div>
    </div>
  )
}

export default function App() {
  const view = useUIStore(s => s.view)
  const { showToast } = useUIStore()
  const { user, loading, cloudReady, initialize } = useAuthStore()
  const { syncFromCloud } = useFinanceStore()
  const onboardingDone = useFinanceStore(s => {
    const settings = s.db._settings as import('@/types').Settings | undefined
    return settings?.onboardingDone === true || (settings?.accounts != null && settings.accounts.length > 0)
  })
  const mainRef = useRef<HTMLElement>(null)

  // Initialize auth listener once on mount
  useEffect(() => {
    const unsub = initialize()
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = useCallback(async () => {
    await syncFromCloud()
    showToast('Sincronizado')
  }, [syncFromCloud, showToast])

  const { pullY, refreshing, isPulling } = usePullToRefresh(mainRef, handleRefresh, !user || !onboardingDone)

  if (loading || !cloudReady) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--background)]">
        <div className="w-6 h-6 border-2 border-[var(--border)] border-t-foreground rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!onboardingDone) {
    return <OnboardingView />
  }

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen className="flex-col h-full !min-h-0 max-h-full overflow-hidden">
        {/* TopNav — full width, above sidebar and content */}
        <Header />

        {/* Below header: sidebar + main content side by side */}
        <div className="relative flex flex-row flex-1 min-h-0 overflow-hidden">
          <AppSidebar />

          <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-[var(--background)] min-w-0 flex flex-col">
            <PullIndicator pullY={pullY} refreshing={refreshing} isPulling={isPulling} />
            <div className="max-w-5xl mx-auto w-full p-4 sm:p-5 lg:p-6 pb-4 sm:pb-5 lg:pb-6">
              {view === 'mes'       && <MesView />}
              {view === 'dashboard' && <DashboardView />}
              {view === 'cuentas'   && <CuentasView />}
              {view === 'config'    && <ConfigView />}
            </div>
          </main>
        </div>

        <Sidebar_MobileNav />

        {/* Global sheets */}
        <AccountEditSheet />
        <AccountDetailSheet />
        <BalanceSheet />
        <TransferSheet />
        <Toast />
      </SidebarProvider>
    </TooltipProvider>
  )
}
