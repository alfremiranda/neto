import { useState, useEffect, useRef, useCallback } from 'react'
import { Pencil, Trash2, Plus, Receipt, RefreshCw, X, ChevronLeft, ChevronRight, ArrowUpDown, Clock, MoreVertical, SlidersHorizontal } from 'lucide-react'
import { RowActionsSheet } from '@/components/ui/RowActionsSheet'
import { useFinanceStore } from '@/store/financeStore'
import { useMonthData } from '@/hooks/useMonthData'
import { useUIStore } from '@/store/uiStore'
import { calcGastos } from '@/lib/calc'
import { COP, fmtDate, localToday } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EGRESO_CATEGORIAS } from '@/data/defaults'
import { EgresoSheet } from '@/components/sheets/EgresoSheet'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
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
  const [sheetOpen, setSheetOpen] = useState(false)
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
  const isUnconfirmed = egreso.confirmed === false
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
              <RefreshCw size={12} className={cn('shrink-0', isUnconfirmed ? 'text-[var(--color-tax-txt)]' : 'text-muted-foreground')} />
            )}
            <span className={cn('text-sm font-semibold tabular-nums font-mono', isUnconfirmed && 'text-muted-foreground')}>
              {COP(amtCOP)}
            </span>
          </div>
          <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{usdLabel}</span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <IconButton variant="ghost" size="md" onClick={onEdit} aria-label="Editar egreso">
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
              aria-label="Eliminar egreso"
            >
              <Trash2 size={12} />
            </IconButton>
          )}
        </div>
      </div>

      {/* Mobile layout */}
      <div className={cn('sm:hidden flex items-start gap-2 py-2 border-b border-[var(--border)] last:border-0')}>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <CategoryIcon category={category} />
            {egreso.recurring && (
              <RefreshCw size={14} className={cn('shrink-0', isUnconfirmed ? 'text-[var(--color-tax-txt)]' : 'text-muted-foreground')} />
            )}
            <span className={cn('text-base font-bold tabular-nums font-heading', isUnconfirmed && 'text-muted-foreground')}>
              {COP(amtCOP)}
            </span>
            <span className="text-[11px] font-semibold tabular-nums font-mono text-muted-foreground shrink-0">
              {usdLabel}
            </span>
          </div>
          <span className="text-sm leading-snug">{desc}</span>
          <MetaRow />
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 -mr-1 mt-0.5"
          onClick={() => setSheetOpen(true)}
          aria-label="Opciones"
        >
          <MoreVertical size={20} />
        </Button>
      </div>

      <RowActionsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={desc}
        subtitle={[acctLabel, dateStr].filter(Boolean).join(' · ')}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  )
}

// ─── Count badge pill ─────────────────────────────────────────────────────────

function CountBadge({ count, active }: { count: number; active: boolean }) {
  return (
    <span className={cn(
      'ml-1 min-w-[18px] h-[18px] rounded-full text-[10px] font-medium px-1 inline-flex items-center justify-center tabular-nums leading-none transition-colors',
      active
        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
        : 'bg-muted text-muted-foreground',
    )}>
      {count}
    </span>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

const TAB_CLS = [
  'gap-1 rounded-none px-3 py-3 text-xs border-b-2 border-transparent -mb-px min-h-[44px]',
  'data-[state=active]:border-[var(--primary)] data-[state=active]:!bg-transparent',
  'data-[state=active]:!shadow-none data-[state=active]:text-foreground whitespace-nowrap',
].join(' ')

export function EgresosCard() {
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

  const subtotal = visible.reduce(
    (a, e) => a + (e.currency === 'USD' ? e.amount * month.trm : e.amount), 0
  )
  const grandTotal = calcGastos(egresos, month.trm)

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
    ? 'Total egresos'
    : `Total ${activeCats.find(c => c.id === activeTab)?.label ?? activeTab}`

  return (
    <>
      <SectionCard
        icon={Receipt}
        title="Egresos del mes"
        action={
          <>
            <Button size="sm" onClick={() => { setEditingEgreso(null); openSheet('egreso') }} className="hidden sm:flex">
              <Plus size={13} />Agregar
            </Button>
            <IconButton variant="filled" size="xl" onClick={() => { setEditingEgreso(null); openSheet('egreso') }} aria-label="Agregar egreso" className="sm:hidden">
              <Plus />
            </IconButton>
          </>
        }
      >
        {egresos.length === 0 ? (
          <Empty className="border-0 py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Receipt size={14} /></EmptyMedia>
              <EmptyTitle>Sin egresos</EmptyTitle>
              <EmptyDescription>No hay gastos registrados este mes</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={() => { setEditingEgreso(null); openSheet('egreso') }}>
                <Plus size={13} />Agregar egreso
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div ref={cardRef} className="-mx-4 -mb-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              {/* Tab bar — scrollable with arrow buttons */}
              <div className="relative border-b border-[var(--border)]">
                {canLeft && (
                  <button
                    type="button" onClick={() => scrollTabs('left')}
                    aria-label="Ver categorías anteriores"
                    className="absolute left-0 top-0 bottom-0 z-10 flex items-center justify-center w-7 bg-gradient-to-r from-background via-background/90 to-transparent"
                  >
                    <ChevronLeft size={13} className="text-muted-foreground" />
                  </button>
                )}
                <div ref={scrollRef} className="overflow-x-auto overflow-y-hidden scrollbar-none">
                  <TabsList className="flex w-max min-w-full rounded-none bg-transparent p-0 h-auto justify-start gap-0 px-1">
                    <TabsTrigger value="todos" className={TAB_CLS}>
                      Todos
                      <CountBadge count={egresos.length} active={activeTab === 'todos'} />
                    </TabsTrigger>
                    {activeCats.map(cat => {
                      const count = egresos.filter(e => (e.category || 'otro') === cat.id).length
                      const Icon  = cat.icon
                      return (
                        <TabsTrigger key={cat.id} value={cat.id} className={TAB_CLS}>
                          <Icon size={11} />
                          {cat.label}
                          <CountBadge count={count} active={activeTab === cat.id} />
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                </div>
                {canRight && (
                  <button
                    type="button" onClick={() => scrollTabs('right')}
                    aria-label="Ver más categorías"
                    className="absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center w-7 bg-gradient-to-l from-background via-background/90 to-transparent"
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
                    <SelectTrigger data-size="none" className="flex-1 h-8 gap-1.5 text-xs border-transparent bg-transparent hover:bg-[var(--accent)]">
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
                    <SelectTrigger data-size="none" className="shrink-0 h-7 w-auto px-2 gap-1.5 text-xs border-transparent bg-transparent hover:bg-[var(--accent)]">
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

              {/* Mobile filter drawer */}
              <Drawer open={filterDrawerOpen} onOpenChange={setFilterDrawerOpen} noBodyStyles>
                <DrawerContent className="inset-x-0 bottom-0 rounded-t-2xl max-h-[80dvh]">
                  <DrawerHeader className="text-left pb-2">
                    <DrawerTitle>Filtros</DrawerTitle>
                  </DrawerHeader>
                  <div className="px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Cuenta</label>
                      <Select value={filterAccount || 'all'} onValueChange={v => setFilterAccount(v === 'all' ? '' : v)}>
                        <SelectTrigger data-size="none" className="h-10 text-sm">
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
                      <label className="text-xs font-medium text-muted-foreground">Fecha</label>
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
                    {hasFilters && (
                      <Button
                        variant="outline"
                        className="w-full mt-1"
                        onClick={() => { setFilterAccount(''); setFilterDate(''); setFilterDrawerOpen(false) }}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                    <Button className="w-full" onClick={() => setFilterDrawerOpen(false)}>
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

                    {/* Category bar — only in Todos without filters */}
                    {activeTab === 'todos' && !hasFilters && (
                      <EgresosBar egresos={egresos} trm={month.trm} />
                    )}
                  </>
                )}
              </div>
            </Tabs>
          </div>
        )}
      </SectionCard>

      <EgresoSheet />
    </>
  )
}
