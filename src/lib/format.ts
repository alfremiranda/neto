export function COP(n: number): string {
  return '$' + Math.round(n).toLocaleString('es-CO')
}

export function USD(n: number): string {
  return 'USD ' + (Math.round(n * 100) / 100).toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function pct(a: number, b: number): string {
  return b > 0 ? Math.round(a / b * 100) + '%' : '0%'
}

export function copFormat(n: number): string {
  return n > 0 ? Math.round(n).toLocaleString('es-CO') : ''
}

export function parseCOP(str: string): number {
  return parseInt(String(str).replace(/\D/g, '')) || 0
}

export function parseMoney(str: string): number {
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0
}

export function formatMoney(n: number, decimals: number): string {
  return n.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
