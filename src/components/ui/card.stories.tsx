import type { Meta, StoryObj } from '@storybook/react-vite'
import { Landmark, TrendingUp, CalendarDays, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card'
import { SectionCard } from './SectionCard'
import { MetricCard } from './MetricCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from './empty'
import { Skeleton } from './skeleton'
import { Separator } from './separator'
import { Button } from './button'

const meta = { title: 'Contenedores/Tarjetas', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Card_: Story = {
  name: 'Card',
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Título</CardTitle>
        <CardDescription>Una descripción de apoyo</CardDescription>
      </CardHeader>
      <CardContent>Contenido de la tarjeta.</CardContent>
    </Card>
  ),
}

export const SectionCard_: Story = {
  name: 'SectionCard',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>
      <SectionCard icon={Landmark} title="Mis Cuentas">Contenido</SectionCard>
      <SectionCard icon={TrendingUp} title="Con acción" action={<Button size="sm" variant="outline">Ver todo</Button>}>
        Contenido
      </SectionCard>
    </div>
  ),
}

export const MetricCard_: Story = {
  name: 'MetricCard',
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, maxWidth: 480 }}>
      <MetricCard label="Bruto total año" value="$41.120.125" sub="USD 10.250,00" />
      <MetricCard label="Gastos" value={<span className="text-[var(--color-expense)]">$4.742.240</span>} sub="12% del bruto" />
    </div>
  ),
}

/** The state a list reaches most often and the one most often left undesigned. */
export const Vacio: Story = {
  name: 'Empty',
  render: () => (
    <Empty className="max-w-md">
      <EmptyHeader>
        <EmptyMedia variant="icon"><CalendarDays size={14} /></EmptyMedia>
        <EmptyTitle>Sin registros en 2026</EmptyTitle>
        <EmptyDescription>Navega a un mes y agrega ingresos o gastos</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm"><Plus size={13} />Nuevo</Button>
      </EmptyContent>
    </Empty>
  ),
}

export const CargaYSeparador: Story = {
  name: 'Skeleton y Separator',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360 }}>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-9 w-24 rounded-full" />
      <Separator />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', height: 24 }}>
        <span className="ts-body-small">Izquierda</span>
        <Separator orientation="vertical" />
        <span className="ts-body-small">Derecha</span>
      </div>
    </div>
  ),
}
