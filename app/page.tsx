"use client"

import { useState } from "react"
import Formulari from "@/components/Formulari"
import VacancesDelMes from "@/components/VacancesDelMes"
import CalendariVisual from "@/components/CalendariVisual"
import ErrorsValidacio from "@/components/ErrorsValidacio"
import { PeticioGeneracio, RespostaGeneracio } from "@/types"

export default function Home() {
  const ara = new Date()
  const [mesSeleccionat, setMesSeleccionat] = useState(
    ara.getMonth() + 2 > 12 ? 1 : ara.getMonth() + 2
  )
  const [anySeleccionat, setAnySeleccionat] = useState(
    ara.getMonth() + 2 > 12 ? ara.getFullYear() + 1 : ara.getFullYear()
  )
  const [carregant, setCarregant] = useState(false)
  const [resposta, setResposta] = useState<RespostaGeneracio | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [exportant, setExportant] = useState(false)
  const [ultimaPeticio, setUltimaPeticio] = useState<PeticioGeneracio | null>(null)

  async function handleGenerar(dades: PeticioGeneracio) {
    setCarregant(true)
    setError(null)
    setResposta(null)
    setMesSeleccionat(dades.mes)
    setAnySeleccionat(dades.any)
    setUltimaPeticio(dades)

    try {
      const res = await fetch("/api/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dades),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Error desconegut")
        return
      }

      setResposta(data)
    } catch (e) {
      setError("Error de connexió: " + String(e))
    } finally {
      setCarregant(false)
    }
  }

  async function handleExportar() {
    if (!resposta || !ultimaPeticio) return
    setExportant(true)
    try {
      const res = await fetch("/api/exportar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mes: mesSeleccionat,
          any: anySeleccionat,
          calendari: resposta.calendari,
        }),
      })
      if (!res.ok) {
        setError("Error exportant el fitxer Excel.")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const cd = res.headers.get("Content-Disposition") ?? ""
      const match = cd.match(/filename="([^"]+)"/)
      a.download = match?.[1] ?? "calendari.xlsx"
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError("Error exportant: " + String(e))
    } finally {
      setExportant(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-xl font-bold text-white">
            Brigada Porta a Porta
          </h1>
          <p className="text-sm text-gray-400">
            Mancomunitat Alta Segarra — Generació de calendaris de torns
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
          {/* Columna esquerra: formulari */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
              <h2 className="mb-5 text-lg font-semibold text-white">
                Configuració del mes
              </h2>
              <Formulari
                onSubmit={dades => {
                  setMesSeleccionat(dades.mes)
                  setAnySeleccionat(dades.any)
                  handleGenerar(dades)
                }}
                carregant={carregant}
              />
            </div>

            {/* Vacances previstes */}
            <VacancesDelMes mes={mesSeleccionat} any={anySeleccionat} />
          </div>

          {/* Columna dreta: resultats */}
          <div className="space-y-6">
            {/* Missatge error */}
            {error && (
              <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Indicador càrrega */}
            {carregant && (
              <div className="flex items-center justify-center rounded-xl border border-gray-700 bg-gray-900 p-12">
                <div className="text-center space-y-4">
                  <svg className="mx-auto h-10 w-10 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <p className="text-gray-400">Generant el calendari amb IA…</p>
                  <p className="text-xs text-gray-500">Pot trigar fins a 30 segons</p>
                </div>
              </div>
            )}

            {/* Resultats */}
            {resposta && !carregant && (
              <>
                {/* Validació */}
                <ErrorsValidacio
                  errors={resposta.errors_validacio}
                  advertencies={resposta.advertencies}
                />

                {/* Botó exportar */}
                <div className="flex justify-end">
                  <button
                    onClick={handleExportar}
                    disabled={exportant}
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-600"
                  >
                    {exportant ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Generant Excel…
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        Exportar Excel
                      </>
                    )}
                  </button>
                </div>

                {/* Calendari visual */}
                <div className="rounded-xl border border-gray-700 bg-gray-900 p-6">
                  <CalendariVisual
                    mes={mesSeleccionat}
                    any={anySeleccionat}
                    calendari={resposta.calendari}
                  />
                </div>
              </>
            )}

            {/* Estat inicial */}
            {!resposta && !carregant && !error && (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-700 bg-gray-900/50 p-16">
                <div className="text-center space-y-2">
                  <p className="text-gray-500">Omple el formulari i prem</p>
                  <p className="text-lg font-medium text-gray-400">&ldquo;Generar calendari&rdquo;</p>
                  <p className="text-gray-600 text-sm">per generar el calendari de torns</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
