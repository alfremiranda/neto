import { useState, useEffect, useRef, useCallback } from 'react'
import { Pencil, Trash2, Plus, Receipt, RefreshCw, Check, X, ChevronLeft, ChevronRight, ArrowUpDown, Clock, MoreVertical } from 'lucide-react'
import { RowActionsSheet } from '@/components/ui/RowActionsSheet'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { calcGastos } from '@/lib/calc'
import { COP, USD, fmtDate, localToday } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EGRESO_CATEGORIAS } from '@/data/defaults'
import { EgresoSheet } from '@/components/sheets/EgresoSheet'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/DatePicker'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import type { Egreso, Account } from '@/types'

// ─── Category icon bubble ─────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: string }) {
  const cat = EGRESO_CATEGORIAS.find(c => c.id === category)
  if (!cat) return null
  const Icon = cat.icon
  return (
    <span
      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `var(${cat.bgColor})`, color: `var(${cat.color})` }}
    >
      <Icon size={13} strokeWidth={2} />
    </span>
  )
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
            <span className="text-xs font-mono font-semibold tabular-nums">{Math.round(seg.pct)}%</span>
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
  onEdit, onDelete, onConfirm,
  isPendingDelete,
}: {
  egreso: Egreso
  trm: number
  accounts: Account[]
  onEdit: () => void
  onDelete: () => void
  onConfirm: () => void
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

  return (
    <>
      <div className={cn('flex items-center gap-2 min-h-[52px] py-1.5 border-b border-[var(--border)] last:border-0', isScheduled && 'opacity-60')}>
        <CategoryIcon category={category} />

        <div className="flex-1 min-w-0">
          <span className="block text-sm truncate">{desc}</span>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {acctLabel && <Badge variant={acctVariant}>{acctLabel}</Badge>}
            {isScheduled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--color-tax-txt)] bg-[var(--color-tax)]/10 px-1.5 py-0.5 rounded-full">
                <Clock size={9} />
                Programado
              </span>
            )}
            {dateStr && <span className="text-xs text-muted-foreground/60 tabular-nums">{dateStr}</span>}
          </div>
        </div>

        {/* Amount */}
        <div className="shrink-0 flex items-center gap-1.5 text-right">
          {egreso.recurring && (
            <RefreshCw size={12} className={cn('shrink-0', isUnconfirmed ? 'text-[var(--color-tax-txt)]' : 'text-muted-foreground')} />
          )}
          <div>
            <div className={cn('text-sm font-semibold tabular-nums font-heading', (isUnconfirmed || isScheduled) && 'text-muted-foreground')}>
              {egreso.currency === 'USD' ? USD(egreso.amount) : COP(amtCOP)}
            </div>
            {egreso.currency === 'USD' && (
              <div className="text-[10px] text-muted-foreground tabular-nums">{COP(amtCOP)}</div>
            )}
          </div>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center shrink-0">
          {isUnconfirmed && (
            <Button
              variant="ghost" size="icon-sm" onClick={onConfirm} aria-label="Confirmar monto"
              className="text-[var(--color-tax-txt)] hover:text-[var(--color-tax-txt)] hover:bg-[var(--color-tax)]/10"
            >
              <Check size={12} />
            </Button>
          )}
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar egreso">
            <Pencil size={12} />
          </Button>
          <Button
            data-egreso-confirm={isPendingDelete ? 'true' : undefined}
            variant={isPendingDelete ? 'destructive' : 'ghost'}
            size={isPendingDelete ? 'sm' : 'icon-sm'}
            onClick={onDelete}
            aria-label={isPendingDelete ? 'Confirmar eliminación' : 'Eliminar egreso'}
            className={!isPendingDelete ? 'hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]' : ''}
          >
            {isPendingDelete ? '¿Eliminar?' : <Trash2 size={12} />}
          </Button>
        </div>

        {/* Mobile action */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden shrink-0"
          onClick={() => setSheetOpen(true)}
          aria-label="Opciones"
        >
          <MoreVertical size={16} />
        </Button>
      </div>

      <RowActionsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={desc}
        subtitle={[acctLabel, dateStr].filter(Boolean).join(' · ')}
        onEdit={onEdit}
        onDelete={onDelete}
        extraActions={isUnconfirmed ? [{
          label: 'Confirmar monto',
          icon: <Check size={18} className="text-[var(--color-tax-txt)] shrink-0" />,
          onClick: onConfirm,
        }] : undefined}
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
  const { getCurrentMonth, removeEgreso, getAccounts, confirmEgreso } = useFinanceStore()
  const { openSheet, showToast, setEditingEgreso } = useUIStore()

  const [activeTab,     setActiveTab]     = useState('todos')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterDate,    setFilterDate]    = useState('')
  const [sortBy,        setSortBy]        = useState('date-desc')
  const [confirmId,     setConfirmId]     = useState<number | null>(null)
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

  const month    = getCurrentMonth()
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
          <Button size="sm" onClick={() => { setEditingEgreso(null); openSheet('egreso') }}>
            <Plus size={13} />
            <span className="hidden xs:inline">Agregar</span>
          </Button>
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

              {/* Filter bar — stacks vertically on mobile */}
              <div className="px-4 py-2 flex flex-col gap-2 border-b border-[var(--border)] sm:flex-row sm:items-center">
                {/* Row 1 on mobile: account + sort */}
                <div className="flex items-center gap-2">
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

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger data-size="none" className="shrink-0 h-7 w-auto px-2 gap-1.5 text-xs border-transparent bg-transparent hover:bg-[var(--accent)]">
                      <ArrowUpDown size={12} className="text-muted-foreground shrink-0" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="date-desc">Fecha: más reciente</SelectItem>
                      <SelectItem value="date-asc">Fecha: más antigua</SelectItem>
                      <SelectItem value="amount-desc">Mayor monto</SelectItem>
                      <SelectItem value="amount-asc">Menor monto</SelectItem>
                      <SelectItem value="name-asc">Nombre A–Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 2 on mobile: date picker */}
                <div className="flex items-center gap-1 sm:flex-1 min-w-0">
                  <DatePicker
                    value={filterDate}
                    onChange={setFilterDate}
                    placeholder="Todas las fechas"
                    className="h-7 text-xs flex-1 min-w-0"
                  />
                  {filterDate && (
                    <Button size="icon-sm" variant="ghost" onClick={() => setFilterDate('')} title="Limpiar fecha">
                      <X size={12} />
                    </Button>
                  )}
                </div>
              </div>

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
                        onConfirm={() => confirmEgreso(e.id)}
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
