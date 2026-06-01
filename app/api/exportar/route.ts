import { NextRequest, NextResponse } from "next/server"
import { generarExcel } from "@/lib/excel"
import { AssignacioTorn } from "@/types"

export async function POST(req: NextRequest) {
  try {
    const body: { mes: number; any: number; calendari: AssignacioTorn[] } = await req.json()
    const { mes, any: year, calendari } = body

    const buffer = generarExcel(mes, year, calendari)

    const nomMesos = ["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"]
    const nomFitxer = `Calendari_Brigada_${nomMesos[mes-1]}_${year}.xlsx`

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${nomFitxer}"`,
      },
    })
  } catch (err) {
    console.error("Error a /api/exportar:", err)
    return NextResponse.json({ error: "Error generant el fitxer Excel." }, { status: 500 })
  }
}
