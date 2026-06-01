"use client"

import { useState } from "react"
import { PeticioGeneracio } from "@/types"

interface Props {
  onSubmit: (dades: PeticioGeneracio) => void
  carregant: boolean
}

const MESOS = [
  "Gener","Febrer","Març","Abril","Maig","Juny",
  "Juliol","Agost","Setembre","Octubre","Novembre","Desembre"
]

export default function Formulari({ onSubmit, carregant }: Props) {
  const ara = new Date()
  const [mes, setMes] = useState(ara.getMonth() + 2 > 12 ? 1 : ara.getMonth() + 2)
  const [any, setAny] = useState(ara.getMonth() + 2 > 12 ? ara.getFullYear() + 1 : ara.getFullYear())
  const [festius, setFestius] = useState("")
  const [baixes, setBaixes] = useState("")
  const [observacions, setObservacions] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ mes, any, festius, baixes, observacions })
  }

  const anys = [2025, 2026, 2027]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mes i any */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Mes
          </label>
          <select
            value={mes}
            onChange={e => setMes(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {MESOS.map((nom, i) => (
              <option key={i + 1} value={i + 1}>{nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Any
          </label>
          <select
            value={any}
            onChange={e => setAny(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {anys.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Festius */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          Dies festius del mes
          <span className="ml-2 text-xs text-gray-500">(ex: 24, 25 de desembre → escriu "24, 25")</span>
        </label>
        <input
          type="text"
          value={festius}
          onChange={e => setFestius(e.target.value)}
          placeholder="ex: 1, 8 (dies del mes separats per comes)"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Baixes */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          Baixes o incidències de personal
          <span className="ml-2 text-xs text-gray-500">(noms dels treballadors afectats)</span>
        </label>
        <textarea
          value={baixes}
          onChange={e => setBaixes(e.target.value)}
          placeholder="ex: Karim (tot el mes), Fredi (dies 3-5)"
          rows={2}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Observacions */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-300">
          Observacions addicionals
        </label>
        <textarea
          value={observacions}
          onChange={e => setObservacions(e.target.value)}
          placeholder="Qualsevol indicació especial per a la generació del calendari..."
          rows={3}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        />
      </div>

      {/* Botó */}
      <button
        type="submit"
        disabled={carregant}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-400"
      >
        {carregant ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Generant calendari amb IA…
          </span>
        ) : (
          "Generar calendari"
        )}
      </button>
    </form>
  )
}
