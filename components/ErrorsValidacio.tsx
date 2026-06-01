"use client"

import { ErrorValidacio } from "@/types"

interface Props {
  errors: ErrorValidacio[]
  advertencies: string[]
}

export default function ErrorsValidacio({ errors, advertencies }: Props) {
  const teErrors = errors.length > 0

  return (
    <div className={`rounded-lg border p-4 ${
      teErrors
        ? "border-orange-700 bg-orange-900/20"
        : "border-green-700 bg-green-900/20"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-lg ${teErrors ? "text-orange-400" : "text-green-400"}`}>
          {teErrors ? "⚠" : "✓"}
        </span>
        <h3 className={`font-semibold ${teErrors ? "text-orange-400" : "text-green-400"}`}>
          {teErrors
            ? `Restriccions violades (${errors.length} errors)`
            : "Totes les restriccions verificades correctament"}
        </h3>
      </div>

      {teErrors && (
        <div className="space-y-1.5 mb-3">
          {errors.map((err, i) => (
            <div key={i} className="flex gap-2 text-sm">
              <span className="shrink-0 rounded bg-orange-800/50 px-1.5 py-0.5 text-xs font-mono text-orange-300">
                {err.restriccio}
              </span>
              <span className="text-orange-200">{err.missatge}</span>
            </div>
          ))}
        </div>
      )}

      {advertencies.length > 0 && (
        <div className="mt-2 space-y-1">
          {advertencies.map((adv, i) => (
            <p key={i} className="text-sm text-yellow-400">ℹ {adv}</p>
          ))}
        </div>
      )}

      {teErrors && (
        <p className="mt-3 text-xs text-gray-400">
          El calendari s&apos;ha generat però té errors. Pots acceptar-lo igualment o tornar a generar.
        </p>
      )}
    </div>
  )
}
