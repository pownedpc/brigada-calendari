"use client"

import { getVacancesDelMes } from "@/lib/treballadors"

interface Props {
  mes: number
  any: number
}

export default function VacancesDelMes({ mes, any }: Props) {
  const vacances = getVacancesDelMes(mes, any)
  const entrades = Object.entries(vacances)

  if (entrades.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Vacances previstes
        </h3>
        <p className="text-sm text-gray-500">Cap treballador té vacances aquest mes.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-amber-800/50 bg-amber-900/20 p-4">
      <h3 className="mb-3 text-sm font-semibold text-amber-400 uppercase tracking-wide">
        ⚠ Vacances previstes ({entrades.length} treballadors)
      </h3>
      <div className="space-y-2">
        {entrades.map(([nom, dies]) => {
          const diesFormatats = dies.map(d => {
            const num = parseInt(d.split("-")[2])
            return num
          })
          const ranges = comprimirDies(diesFormatats)
          return (
            <div key={nom} className="flex items-start gap-3 text-sm">
              <span className="min-w-[80px] font-medium text-white">{nom}</span>
              <span className="text-amber-300">{ranges}</span>
              <span className="text-xs text-gray-500">({dies.length} dies)</span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-amber-600">
        ⚠️ Alguns períodes marcats PER_CONFIRMAR — verificar amb el Francesc.
      </p>
    </div>
  )
}

function comprimirDies(dies: number[]): string {
  if (dies.length === 0) return ""
  const sorted = [...dies].sort((a, b) => a - b)
  const ranges: string[] = []
  let start = sorted[0]
  let end = sorted[0]
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      ranges.push(start === end ? `${start}` : `${start}-${end}`)
      start = sorted[i]
      end = sorted[i]
    }
  }
  ranges.push(start === end ? `${start}` : `${start}-${end}`)
  return "Dies: " + ranges.join(", ")
}
