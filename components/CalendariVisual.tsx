"use client"

import { AssignacioTorn } from "@/types"
import DiaCell from "./DiaCell"

interface Props {
  mes: number
  any: number
  calendari: AssignacioTorn[]
}

const DIES_SETMANA = ["Dl", "Dm", "Dx", "Dj", "Dv", "Ds", "Dg"]
const NOMS_MESOS = [
  "Gener","Febrer","Març","Abril","Maig","Juny",
  "Juliol","Agost","Setembre","Octubre","Novembre","Desembre"
]

function getDiaSetmanaIndex(data: string): number {
  const d = new Date(data + "T00:00:00").getDay()
  return d === 0 ? 6 : d - 1
}

export default function CalendariVisual({ mes, any: year, calendari }: Props) {
  // Preparar graella
  const tornPerData = new Map<string, AssignacioTorn>()
  for (const torn of calendari) {
    tornPerData.set(torn.data, torn)
  }

  const diesDelMes = new Date(year, mes, 0).getDate()
  const primerDia = getDiaSetmanaIndex(`${year}-${String(mes).padStart(2, "0")}-01`)

  // Construir les cel·les de la graella (7 columnes)
  const celles: Array<{ diaNum: number | null; data: string | null }> = []

  // Dies buits al principi
  for (let i = 0; i < primerDia; i++) {
    celles.push({ diaNum: null, data: null })
  }

  for (let d = 1; d <= diesDelMes; d++) {
    const data = `${year}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    celles.push({ diaNum: d, data })
  }

  // Padding final per completar l'última setmana
  while (celles.length % 7 !== 0) {
    celles.push({ diaNum: null, data: null })
  }

  const setmanes: typeof celles[] = []
  for (let i = 0; i < celles.length; i += 7) {
    setmanes.push(celles.slice(i, i + 7))
  }

  const totalTreballadors: Record<string, number> = {}
  for (const torn of calendari) {
    if (torn.es_festiu) continue
    for (const nom of [...torn.camio, ...torn.satellit1, ...torn.satellit2]) {
      if (nom !== "BEN_NET") {
        totalTreballadors[nom] = (totalTreballadors[nom] ?? 0) + 1
      }
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">
        {NOMS_MESOS[mes - 1]} {year}
      </h2>

      {/* Graella */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <div className="min-w-[700px]">
          {/* Capçalera dies */}
          <div className="grid grid-cols-7 border-b border-gray-700 bg-gray-800">
            {DIES_SETMANA.map(dia => (
              <div
                key={dia}
                className={`py-2 text-center text-sm font-semibold tracking-wide
                  ${dia === "Ds" || dia === "Dg" ? "text-blue-400" : "text-gray-300"}`}
              >
                {dia}
              </div>
            ))}
          </div>

          {/* Setmanes */}
          <div className="bg-gray-900 p-2 space-y-2">
            {setmanes.map((setmana, si) => (
              <div key={si} className="grid grid-cols-7 gap-1.5">
                {setmana.map((cel, ci) => {
                  if (!cel.data) {
                    return <DiaCell key={ci} esFora />
                  }
                  const torn = tornPerData.get(cel.data)
                  return (
                    <DiaCell
                      key={ci}
                      torn={torn}
                      diaNum={cel.diaNum ?? undefined}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Llegenda */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-gray-700"></span> Dia laborable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-blue-950 border border-blue-900"></span> Cap setmana
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-orange-950 border border-orange-900"></span> Festiu
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-red-950 border border-red-900"></span> Conté Ben Net
        </span>
      </div>

      {/* Resum de dies treballats */}
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Resum dies assignats al mes
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(totalTreballadors)
            .sort((a, b) => b[1] - a[1])
            .map(([nom, dies]) => (
              <div key={nom} className="flex justify-between rounded bg-gray-700/50 px-3 py-1.5 text-sm">
                <span className="text-white">{nom}</span>
                <span className="font-mono text-gray-300">{dies}d</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
