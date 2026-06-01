"use client"

import { AssignacioTorn } from "@/types"

interface Props {
  torn?: AssignacioTorn
  diaNum?: number
  esFora?: boolean
}

function Nom({ nom }: { nom: string }) {
  if (nom === "BEN_NET") {
    return <span className="font-bold text-red-500">Ben Net</span>
  }
  return <span>{nom}</span>
}

function LlistaPersones({ persones, label }: { persones: string[]; label: string }) {
  if (persones.length === 0) return null
  return (
    <div className="text-xs leading-tight">
      <span className="text-gray-400">{label}: </span>
      {persones.map((n, i) => (
        <span key={n}>
          {i > 0 && <span className="text-gray-500">, </span>}
          <Nom nom={n} />
        </span>
      ))}
    </div>
  )
}

export default function DiaCell({ torn, diaNum, esFora }: Props) {
  if (esFora || !torn) {
    return (
      <div className="min-h-[90px] rounded border border-gray-800 bg-transparent p-1" />
    )
  }

  const { es_festiu, es_cap_setmana, camio, satellit1, satellit2 } = torn

  const baseClass = "min-h-[90px] rounded border p-1.5 transition-colors"

  if (es_festiu) {
    return (
      <div className={`${baseClass} border-orange-800/50 bg-orange-950/40`}>
        <div className="mb-1 text-right text-xs font-semibold text-gray-400">
          {diaNum}
        </div>
        <div className="text-center text-xs font-bold text-orange-400 uppercase tracking-wide mt-3">
          FESTIU
        </div>
      </div>
    )
  }

  const teBenNet =
    camio.includes("BEN_NET") ||
    satellit1.includes("BEN_NET") ||
    satellit2.includes("BEN_NET")

  const borderColor = teBenNet
    ? "border-red-900/50"
    : es_cap_setmana
    ? "border-blue-900/50"
    : "border-gray-700/50"

  const bgColor = teBenNet
    ? "bg-red-950/20"
    : es_cap_setmana
    ? "bg-blue-950/20"
    : "bg-gray-800/30"

  return (
    <div className={`${baseClass} ${borderColor} ${bgColor}`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400">{diaNum}</span>
        {es_cap_setmana && (
          <span className="text-xs text-blue-500 font-medium">cap</span>
        )}
      </div>
      <div className="space-y-0.5 text-white">
        <LlistaPersones persones={camio} label="🚛" />
        <LlistaPersones persones={satellit1} label="S1" />
        {!es_cap_setmana && satellit2.length > 0 && (
          <LlistaPersones persones={satellit2} label="S2" />
        )}
      </div>
    </div>
  )
}
