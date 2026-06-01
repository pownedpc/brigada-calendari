"use client"

import { useState } from "react"
import { ErrorValidacio } from "@/types"

const RESTRICCIONS_CRÍTIQUES = new Set(["R1", "R2", "R3", "R7"])

interface Props {
  errors: ErrorValidacio[]
  advertencies: string[]
}

export default function ErrorsValidacio({ errors, advertencies }: Props) {
  const [mostrarDetall, setMostrarDetall] = useState(false)

  const critics = errors.filter(e => RESTRICCIONS_CRÍTIQUES.has(e.restriccio))
  const avisos = errors.filter(e => !RESTRICCIONS_CRÍTIQUES.has(e.restriccio))

  const okTotal = critics.length === 0

  // Agrupar missatges crítics únics (sense data) per mostrar-los compactes
  const criticsMissatgesUnics = [...new Set(critics.map(e => {
    // Treure la data del missatge per agrupar
    return e.missatge.replace(/^\d{4}-\d{2}-\d{2}: /, "")
  }))]

  return (
    <div className={`rounded-lg border p-4 ${
      okTotal
        ? "border-green-700 bg-green-900/20"
        : "border-red-700 bg-red-900/20"
    }`}>
      {/* Capçalera */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xl ${okTotal ? "text-green-400" : "text-red-400"}`}>
          {okTotal ? "✓" : "✗"}
        </span>
        <h3 className={`font-semibold text-base ${okTotal ? "text-green-400" : "text-red-400"}`}>
          {okTotal
            ? "Calendari vàlid — llest per exportar"
            : `Calendari invàlid — ${critics.length} problema${critics.length > 1 ? "s" : ""} crític${critics.length > 1 ? "s" : ""}`}
        </h3>
      </div>

      {/* Errors crítics — compactes */}
      {critics.length > 0 && (
        <ul className="mb-3 space-y-1 pl-1">
          {criticsMissatgesUnics.map((msg, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-red-300">
              <span className="mt-0.5 shrink-0 text-red-500">•</span>
              {msg}
            </li>
          ))}
        </ul>
      )}

      {/* Avisos de sobrecàrrega (R5/R6) — col·lapsats */}
      {avisos.length > 0 && (
        <div className="mt-2">
          <button
            onClick={() => setMostrarDetall(!mostrarDetall)}
            className="flex items-center gap-1.5 text-xs text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            <span>{mostrarDetall ? "▾" : "▸"}</span>
            {avisos.length} avís{avisos.length > 1 ? "os" : ""} de sobrecàrrega per vacances simultànies
          </button>
          {mostrarDetall && (
            <ul className="mt-2 space-y-0.5 pl-3">
              {avisos.map((e, i) => (
                <li key={i} className="text-xs text-yellow-600">{e.missatge}</li>
              ))}
            </ul>
          )}
          {!mostrarDetall && (
            <p className="mt-1 text-xs text-gray-500">
              Aquests avisos poden ser inevitables quan hi ha moltes vacances al mateix mes.
            </p>
          )}
        </div>
      )}

      {/* Observacions */}
      {advertencies.length > 0 && (
        <div className="mt-2 space-y-1">
          {advertencies.map((adv, i) => (
            <p key={i} className="text-xs text-gray-400">ℹ {adv}</p>
          ))}
        </div>
      )}

      {/* Peu */}
      {!okTotal && (
        <p className="mt-3 text-xs text-gray-500">
          Pots tornar a generar o exportar igualment si els problemes son acceptables.
        </p>
      )}
    </div>
  )
}
