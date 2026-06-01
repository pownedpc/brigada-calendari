import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getVacancesDelMes } from "@/lib/treballadors"
import { calcularDisponibilitat, construirPrompt } from "@/lib/prompt"
import { validarCalendari } from "@/lib/restriccions"
import { AssignacioTorn, PeticioGeneracio, RespostaGeneracio } from "@/types"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const body: PeticioGeneracio = await req.json()
    const { mes, any, festius, baixes, observacions } = body

    if (!mes || !any || mes < 1 || mes > 12 || any < 2025) {
      return NextResponse.json({ error: "Mes o any invàlids." }, { status: 400 })
    }

    // 1. Calcular disponibilitat
    const vacances = getVacancesDelMes(mes, any)
    const disponibilitat = calcularDisponibilitat(mes, any, festius, baixes, vacances)

    // 2. Construir prompt
    const prompt = construirPrompt(mes, any, disponibilitat)

    // 3. Cridar Claude
    const missatge = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8000,
      system: "Ets un assistent que genera calendaris de torns en format JSON. Retorna ÚNICAMENT JSON vàlid sense cap text addicional ni markdown ni blocs de codi.",
      messages: [{ role: "user", content: prompt }],
    })

    const respostaText = missatge.content
      .filter(b => b.type === "text")
      .map(b => (b as { type: "text"; text: string }).text)
      .join("")

    // 4. Parsejar JSON
    let calendariData: { dies: AssignacioTorn[] }
    try {
      // Netejar si Claude afegeix markdown malgrat tot
      const jsonNet = respostaText.replace(/^```[\w]*\n?/, "").replace(/\n?```$/, "").trim()
      calendariData = JSON.parse(jsonNet)
    } catch {
      return NextResponse.json(
        { error: "Claude ha retornat un JSON invàlid.", detall: respostaText.slice(0, 500) },
        { status: 500 }
      )
    }

    // 5. Afegir festius marcats al calendari (assegurar es_festiu)
    const festiusDies = new Set<string>()
    if (festius.trim()) {
      const parts = festius.split(/[,;|\n]/).map(s => s.trim()).filter(Boolean)
      for (const part of parts) {
        const num = parseInt(part.replace(/\D/g, ""))
        if (num >= 1 && num <= 31) {
          festiusDies.add(`${any}-${String(mes).padStart(2, "0")}-${String(num).padStart(2, "0")}`)
        }
      }
    }
    for (const dia of calendariData.dies) {
      if (festiusDies.has(dia.data)) {
        dia.es_festiu = true
        dia.camio = []
        dia.satellit1 = []
        dia.satellit2 = []
        dia.descans = []
      }
    }

    // 6. Validar restriccions
    const baixesLlista = baixes.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
    const errorsValidacio = validarCalendari(calendariData.dies, Array.from(festiusDies), baixesLlista)

    const advertencies: string[] = []
    if (observacions.trim()) {
      advertencies.push(`Observacions del Francesc: ${observacions}`)
    }

    const resposta: RespostaGeneracio = {
      calendari: calendariData.dies,
      errors_validacio: errorsValidacio,
      advertencies,
    }

    return NextResponse.json(resposta)
  } catch (err) {
    console.error("Error a /api/generar:", err)
    return NextResponse.json(
      { error: "Error intern del servidor.", detall: String(err) },
      { status: 500 }
    )
  }
}
