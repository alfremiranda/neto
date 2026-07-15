import { useState, useEffect, useRef, useCallback } from 'react'
import { Pencil, Trash2, Receipt, RefreshCw, X, ChevronLeft, ChevronRight, ArrowUpDown, Clock, SlidersHorizontal } from 'lucide-react'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinanceStore } from '@/store/financeStore'
import { useMonthData } from '@/hooks/useMonthData'
import { useUIStore } from '@/store/uiStore'
import { calcGastos } from '@/lib/calc'
import { COP, fmtDate, localToday } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EGRESO_CATEGORIAS } from '@/data/defaults'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody } from '@/components/ui/drawer'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { LucideIcon } from 'lucide-react'
import type { Egreso, Account } from '@/types'

// ─── Category icon bubble ─────────────────────────────────────────────────────

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const cat = EGRESO_CATEGORIAS.find(c => c.id === category)
  if (!cat) return null
  const Icon = cat.icon
  return (
    <span
      className={cn('w-7 h-7 rounded-xl flex items-center justify-center shrink-0', className)}
      style={{ background: `var(${cat.bgColor})`, color: `var(${cat.color})` }}
    >
      <Icon size={12} strokeWidth={2} />
    </span>
  )
}

function fmtUSDSecondary(n: number) {
  return `USD ${n.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// ─── Category distribution bar (Todos only) ───────────────────────────────────

function EgresosBar({ egresos, trm }: { egresos: Egreso[]; trm: number }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const total = egresos.reduce(
    (sum, e) => sum + (e.currency === 'USD' ? e.amount * trm : e.amount), 0
  )
  if (total === 0) return null

  const segments = EGRESO_CATEGORIAS
    .map(cat => {
      const amount = egresos
        .filter(e => e.category === cat.id)
        .reduce((sum, e) => sum + (e.currency === 'USD' ? e.amount * trm : e.amount), 0)
      return { id: cat.id, label: cat.label, color: cat.color, amount, pct: (amount / total) * 100 }
    })
    .filter(s => s.amount > 0)
    .sort((a, b) => b.pct - a.pct)

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)]">
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {segments.map(seg => (
          <div
            key={seg.id}
            className={cn('transition-opacity duration-150 cursor-default', hovered && hovered !== seg.id ? 'opacity-30' : 'opacity-100')}
            style={{ width: `${seg.pct}%`, background: `var(${seg.color})` }}
            onMouseEnter={() => setHovered(seg.id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 items-center">
        {segments.map(seg => (
          <button
            key={seg.id}
            type="button"
            className={cn('flex items-center gap-1.5 bg-transparent border-none p-0 cursor-default transition-opacity', hovered && hovered !== seg.id ? 'opacity-30' : 'opacity-100')}
            onMouseEnter={() => setHovered(seg.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `var(${seg.color})` }} />
            <span className="text-xs text-muted-foreground">{seg.label}</span>
            <span className="text-xs font-mono font-semibold tabular-nums">{seg.pct.toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
          </button>
        ))}
        {hovered && (
          <span className="text-xs font-mono font-semibold tabular-nums ml-auto">
            {COP(segments.find(s => s.id === hovered)?.amount ?? 0)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Egreso row ───────────────────────────────────────────────────────────────

function EgresoRow({
  egreso, trm, accounts,
  onEdit, onDelete,
  isPendingDelete,
}: {
  egreso: Egreso
  trm: number
  accounts: Account[]
  onEdit: () => void
  onDelete: () => void
  isPendingDelete: boolean
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const desc      = egreso.desc || (egreso as any).tipo || '—'
  const category  = egreso.category || 'otro'
  const amtCOP    = egreso.currency === 'USD' ? egreso.amount * trm : egreso.amount
  const dateStr   = egreso.date ? fmtDate(egreso.date) : ''
  const acctLabel = egreso.account ? (accounts.find(a => a.id === egreso.account)?.label ?? egreso.account) : null
  const acctVariant = egreso.account
    ? egreso.account.toLowerCase().includes('arq')    ? 'arq'
      : egreso.account.toLowerCase().includes('toptal') ? 'toptal'
      : egreso.account.toLowerCase().includes('bancol') ? 'bancol'
      : 'otro'
    : 'otro'
  // Dim the amount + icon only while the date is still in the future; once it arrives, treat as effective
  const isScheduled   = !!egreso.date && egreso.date > localToday()

  const usdAmount = egreso.currency === 'USD' ? egreso.amount : amtCOP / trm
  const usdLabel  = fmtUSDSecondary(usdAmount)

  const ScheduledBadge = () => (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--color-tax-txt)] border border-[#fdba74] px-1.5 py-0.5 rounded-full">
      <Clock size={9} />
      Programado
    </span>
  )

  const MetaRow = () => (
    <div className="flex items-center gap-1 mt-1 flex-wrap">
      {acctLabel && <Badge variant={acctVariant}>{acctLabel}</Badge>}
      {isScheduled && <ScheduledBadge />}
      {dateStr && <span className="text-[11px] text-muted-foreground">·</span>}
      {dateStr && <span className="text-[11px] text-muted-foreground tabular-nums">{dateStr}</span>}
    </div>
  )

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden sm:flex items-center gap-2 py-[9px] border-b border-[var(--border)] last:border-0">
        <CategoryIcon category={category} />

        <div className="flex-1 min-w-0 flex flex-col">
          <span className="text-sm font-medium leading-snug truncate">{desc}</span>
          <MetaRow />
        </div>

        <div className="shrink-0 w-[104px] flex flex-col items-end">
          <div className="flex items-center gap-1">
            {egreso.recurring && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <RefreshCw size={12} className={cn('shrink-0 cursor-default', isScheduled ? 'text-[var(--color-tax-txt)]' : 'text-muted-foreground')} />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[200px] text-center text-xs">
                    {isScheduled
                      ? 'Programado — no se suma al total hasta que llegue la fecha'
                      : 'Recurrente — se copia al siguiente mes'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span className={cn('text-sm font-semibold tabular-nums font-mono', isScheduled && 'text-muted-foreground')}>
              {COP(amtCOP)}
            </span>
          </div>
          <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{usdLabel}</span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <IconButton variant="ghost" size="md" onClick={onEdit} aria-label="Editar gasto">
            <Pencil size={12} />
          </IconButton>
          {isPendingDelete ? (
            <Button
              data-egreso-confirm="true"
              variant="destructive"
              size="sm"
              onClick={onDelete}
              aria-label="Confirmar eliminación"
            >
              ¿Eliminar?
            </Button>
          ) : (
            <IconButton
              variant="ghost-danger"
              size="md"
              onClick={onDelete}
              aria-label="Eliminar gasto"
            >
              <Trash2 size={12} />
            </IconButton>
          )}
        </div>
      </div>

      {/* Mobile — tappable row opens edit sheet directly */}
      <button
        className={cn('sm:hidden w-full text-left flex items-start gap-2 py-2 border-b border-[var(--border)] last:border-0 active:bg-muted/50 transition-colors')}
        onClick={onEdit}
      >
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <CategoryIcon category={category} />
            {egreso.recurring && (
              <RefreshCw size={14} className={cn('shrink-0', isScheduled ? 'text-[var(--color-tax-txt)]' : 'text-muted-foreground')} />
            )}
            <span className={cn('text-base font-bold tabular-nums font-heading', isScheduled && 'text-muted-foreground')}>
              {COP(amtCOP)}
            </span>
            <span className="text-[11px] font-semibold tabular-nums font-mono text-muted-foreground shrink-0">
              {usdLabel}
            </span>
          </div>
          <span className="text-sm leading-snug">{desc}</span>
          <MetaRow />
        </div>
      </button>
    </>
  )
}

// ─── Action chip (category tab) ───────────────────────────────────────────────

function ChipBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-[10px] font-medium leading-none tabular-nums transition-colors',
      active
        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
        : 'bg-[var(--accent)] text-[var(--muted-foreground)]',
    )}>
      {count}
    </span>
  )
}

function CategoryChip({
  icon: Icon, label, count, active, onClick,
}: {
  icon?: LucideIcon
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 inline-flex items-center gap-1 min-h-[30px] pl-[9px] pr-[5px] py-[5px] rounded-xl border text-[10px] font-medium whitespace-nowrap cursor-pointer transition-colors',
        active
          ? 'border-[var(--primary)] text-[var(--primary)]'
          : 'border-[var(--input)] text-[var(--muted-foreground)] hover:border-[var(--muted-foreground)] hover:text-foreground',
      )}
      style={active ? { backgroundColor: 'color-mix(in oklab, var(--primary) 10%, transparent)' } : undefined}
    >
      {Icon && <Icon size={12} strokeWidth={2} className="shrink-0" />}
      {label}
      <ChipBadge count={count} active={active} />
    </button>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function EgresosCardSkeleton() {
  return (
    <SectionCard icon={Receipt} title="Gastos del mes">
      <div className="flex gap-2 mb-3">
        {[48, 36, 52].map((w, i) => <Skeleton key={i} className="h-7 rounded-full" style={{ width: w }} />)}
      </div>
      <div className="space-y-0">
        {[55, 70, 45, 60].map((w, i) => (
          <div key={i} className="flex items-center gap-3 py-[9px] border-b border-[var(--border)] last:border-0">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton style={{ width: `${w}%` }} className="h-3.5" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <Skeleton className="h-3.5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export function EgresosCard() {
  const hydrated = useHasHydrated()
  if (!hydrated) return <EgresosCardSkeleton />
  return <EgresosCardContent />
}

function EgresosCardContent() {
  const { removeEgreso, getAccounts } = useFinanceStore()
  const { openSheet, showToast, setEditingEgreso } = useUIStore()

  const [activeTab,     setActiveTab]     = useState('todos')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterDate,    setFilterDate]    = useState('')
  const [sortBy,           setSortBy]           = useState('date-desc')
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const [confirmId,        setConfirmId]        = useState<number | null>(null)
  const [canLeft,       setCanLeft]       = useState(false)
  const [canRight,      setCanRight]      = useState(false)

  const cardRef  = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 2)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    const ro = new ResizeObserver(updateArrows)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', updateArrows); ro.disconnect() }
  }, [updateArrows])

  useEffect(() => {
    if (confirmId === null) return
    const dismiss = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-egreso-confirm]')) setConfirmId(null)
    }
    document.addEventListener('mousedown', dismiss)
    return () => document.removeEventListener('mousedown', dismiss)
  }, [confirmId])

  const month    = useMonthData()
  const egresos  = month.egresos || []
  const accounts = getAccounts()

  // Categories that have at least one egreso this month
  const activeCats = EGRESO_CATEGORIAS.filter(cat =>
    egresos.some(e => (e.category || 'otro') === cat.id)
  )

  // Account options present in this month's egresos
  const accountOptions = [...new Set(
    egresos.filter(e => e.account).map(e => e.account!)
  )]

  const hasFilters = !!filterAccount || !!filterDate

  // Filtered + sorted list
  const visible = egresos
    .filter(e => {
      if (activeTab !== 'todos' && (e.category || 'otro') !== activeTab) return false
      if (filterAccount && e.account !== filterAccount) return false
      if (filterDate && e.date !== filterDate) return false
      return true
    })
    .sort((a, b) => {
      const amtA = a.currency === 'USD' ? a.amount * month.trm : a.amount
      const amtB = b.currency === 'USD' ? b.amount * month.trm : b.amount
      switch (sortBy) {
        case 'date-asc':    return (a.date || '').localeCompare(b.date || '')
        case 'amount-desc': return amtB - amtA
        case 'amount-asc':  return amtA - amtB
        case 'name-asc':    return (a.desc || '').localeCompare(b.desc || '', 'es')
        default:            return (b.date || '').localeCompare(a.date || '') // date-desc
      }
    })

  const today = localToday()
  const subtotal = visible.reduce(
    (a, e) => {
      if (e.date && e.date > today) return a
      return a + (e.currency === 'USD' ? e.amount * month.trm : e.amount)
    }, 0
  )
  const grandTotal = calcGastos(egresos, month.trm, today)

  function scrollTabs(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -140 : 140, behavior: 'smooth' })
  }

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    setFilterAccount('')
    setFilterDate('')
    requestAnimationFrame(() => {
      cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
  }

  function handleEdit(id: number) {
    setEditingEgreso(id); openSheet('egreso')
  }

  function handleDelete(id: number) {
    if (confirmId === id) {
      removeEgreso(id); setConfirmId(null); showToast('Egreso eliminado')
    } else {
      setConfirmId(id)
    }
  }

  const subtotalLabel = activeTab === 'todos'
    ? 'Total gastos'
    : `Total ${activeCats.find(c => c.id === activeTab)?.label ?? activeTab}`

  return (
    <SectionCard
      icon={Receipt}
      title="Gastos del mes"
    >
        {egresos.length === 0 ? (
          <Empty className="border-0 py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Receipt size={14} /></EmptyMedia>
              <EmptyTitle>Sin gastos</EmptyTitle>
              <EmptyDescription>No hay gastos registrados este mes</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div ref={cardRef} className="-mx-4 -mb-4">
              {/* Category chips — scrollable with arrow affordances */}
              <div className="relative border-b border-[var(--border)]">
                {canLeft && (
                  <button
                    type="button" onClick={() => scrollTabs('left')}
                    aria-label="Ver categorías anteriores"
                    className="hidden sm:flex absolute left-0 top-0 bottom-0 z-10 items-center justify-center w-8 bg-gradient-to-r from-[var(--card)] via-[var(--card)] to-transparent"
                  >
                    <ChevronLeft size={13} className="text-muted-foreground" />
                  </button>
                )}
                <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-none">
                  <div className="flex items-center gap-2 w-max min-w-full px-4 py-3">
                    <CategoryChip
                      label="Todos"
                      count={egresos.length}
                      active={activeTab === 'todos'}
                      onClick={() => handleTabChange('todos')}
                    />
                    <span className="shrink-0 w-px h-5 bg-[var(--border)] mx-0.5" />
                    {activeCats.map(cat => {
                      const count = egresos.filter(e => (e.category || 'otro') === cat.id).length
                      return (
                        <CategoryChip
                          key={cat.id}
                          icon={cat.icon}
                          label={cat.label}
                          count={count}
                          active={activeTab === cat.id}
                          onClick={() => handleTabChange(cat.id)}
                        />
                      )
                    })}
                  </div>
                </div>
                {canRight && (
                  <button
                    type="button" onClick={() => scrollTabs('right')}
                    aria-label="Ver más categorías"
                    className="hidden sm:flex absolute right-0 top-0 bottom-0 z-10 items-center justify-center w-8 bg-gradient-to-l from-[var(--card)] via-[var(--card)] to-transparent"
                  >
                    <ChevronRight size={13} className="text-muted-foreground" />
                  </button>
                )}
              </div>

              {/* Filter bar — mobile: sort + filter icon; desktop: all controls */}
              <div className="border-b border-[var(--border)]">
                {/* Mobile filter bar */}
                <div className="sm:hidden px-4 py-2 flex items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-size="none" className="flex-1 h-11 gap-1.5 text-sm">
                      <ArrowUpDown size={12} className="text-muted-foreground shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="date-desc">Fecha: más reciente</SelectItem>
                      <SelectItem value="date-asc">Fecha: más antigua</SelectItem>
                      <SelectItem value="amount-desc">Mayor monto</SelectItem>
                      <SelectItem value="amount-asc">Menor monto</SelectItem>
                      <SelectItem value="name-asc">Nombre A–Z</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative shrink-0">
                    <Button
                      size="icon-sm"
                      variant={hasFilters ? 'default' : 'outline'}
                      onClick={() => setFilterDrawerOpen(true)}
                      aria-label="Filtros"
                    >
                      <SlidersHorizontal size={14} />
                    </Button>
                    {hasFilters && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[var(--primary)] rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none pointer-events-none">
                        {[filterAccount, filterDate].filter(Boolean).length}
                      </span>
                    )}
                  </div>
                </div>

                {/* Desktop filter bar */}
                <div className="hidden sm:flex px-4 py-2 items-center gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-size="none" className="shrink-0 h-7 w-auto gap-1.5 text-xs">
                      <ArrowUpDown size={12} className="text-muted-foreground shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="start">
                      <SelectItem value="date-desc">Fecha: más reciente</SelectItem>
                      <SelectItem value="date-asc">Fecha: más antigua</SelectItem>
                      <SelectItem value="amount-desc">Mayor monto</SelectItem>
                      <SelectItem value="amount-asc">Menor monto</SelectItem>
                      <SelectItem value="name-asc">Nombre A–Z</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterAccount || 'all'} onValueChange={v => setFilterAccount(v === 'all' ? '' : v)}>
                    <SelectTrigger data-size="none" className="min-w-0 flex-1 h-7 text-xs">
                      <SelectValue placeholder="Todas las cuentas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las cuentas</SelectItem>
                      {accountOptions.map(a => (
                        <SelectItem key={a} value={a}>
                          {accounts.find(ac => ac.id === a)?.label ?? a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <DatePicker
                      value={filterDate}
                      onChange={setFilterDate}
                      placeholder="Todas las fechas"
                      className="h-7 text-xs flex-1 min-w-0"
                    />
                    {filterDate && (
                      <IconButton variant="ghost" size="md" onClick={() => setFilterDate('')} aria-label="Limpiar fecha">
                        <X size={12} />
                      </IconButton>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile filter drawer — matches the app sheet style */}
              <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen} direction="bottom" noBodyStyles>
                <DrawerContent className="inset-x-0 bottom-0 rounded-t-2xl max-h-[85dvh]">
                  {/* Drag handle */}
                  <div data-vaul-handle className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-[var(--border)] shrink-0" />

                  <DrawerHeader>
                    <DrawerTitle>Filtros</DrawerTitle>
                    <button
                      onClick={() => setFilterDrawerOpen(false)}
                      aria-label="Cerrar"
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </DrawerHeader>

                  <DrawerBody className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="field-label">Cuenta</label>
                      <Select value={filterAccount || 'all'} onValueChange={v => setFilterAccount(v === 'all' ? '' : v)}>
                        <SelectTrigger data-size="none" className="w-full h-10 text-sm">
                          <SelectValue placeholder="Todas las cuentas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas las cuentas</SelectItem>
                          {accountOptions.map(a => (
                            <SelectItem key={a} value={a}>
                              {accounts.find(ac => ac.id === a)?.label ?? a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="field-label">Fecha</label>
                      <div className="flex items-center gap-2">
                        <DatePicker
                          value={filterDate}
                          onChange={setFilterDate}
                          placeholder="Todas las fechas"
                          className="h-10 text-sm flex-1"
                        />
                        {filterDate && (
                          <IconButton variant="ghost" size="md" onClick={() => setFilterDate('')} aria-label="Limpiar fecha">
                            <X size={14} />
                          </IconButton>
                        )}
                      </div>
                    </div>
                  </DrawerBody>

                  <div
                    className="shrink-0 px-5 pt-3 border-t border-[var(--border)] space-y-2"
                    style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
                  >
                    {hasFilters && (
                      <Button
                        variant="outline"
                        size="xl"
                        className="w-full"
                        onClick={() => { setFilterAccount(''); setFilterDate(''); setFilterDrawerOpen(false) }}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                    <Button size="xl" className="w-full" onClick={() => setFilterDrawerOpen(false)}>
                      Aplicar
                    </Button>
                  </div>
                </DrawerContent>
              </Drawer>

              {/* Content */}
              <div className="px-4 pb-4">
                {visible.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Sin egresos con los filtros seleccionados
                  </div>
                ) : (
                  <>
                    {visible.map(e => (
                      <EgresoRow
                        key={e.id}
                        egreso={e}
                        trm={month.trm}
                        accounts={accounts}
                        onEdit={() => handleEdit(e.id)}
                        onDelete={() => handleDelete(e.id)}
                        isPendingDelete={confirmId === e.id}
                      />
                    ))}

                    {/* Subtotal */}
                    <div className="flex justify-between items-center mt-3 bg-muted rounded-lg px-3 py-2.5">
                      <span className="text-sm text-muted-foreground">
                        {subtotalLabel}
                        {hasFilters && <span className="ml-1 text-xs opacity-60">(filtrado)</span>}
                      </span>
                      <div className="text-right">
                        <span className="text-base font-semibold font-heading tabular-nums">{COP(subtotal)}</span>
                        {hasFilters && subtotal !== grandTotal && (
                          <div className="text-[10px] text-muted-foreground tabular-nums">
                            de {COP(grandTotal)} total
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Category bar — only in Todos without filters; exclude future-dated */}
                    {activeTab === 'todos' && !hasFilters && (
                      <EgresosBar egresos={egresos.filter(e => !e.date || e.date <= today)} trm={month.trm} />
                    )}
                  </>
                )}
              </div>
          </div>
        )}
    </SectionCard>
  )
}
