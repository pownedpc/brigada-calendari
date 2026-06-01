import ExcelJS from "exceljs"
import { AssignacioTorn } from "@/types"

const NOMS_MESOS = [
  "Gener","Febrer","Març","Abril","Maig","Juny",
  "Juliol","Agost","Setembre","Octubre","Novembre","Desembre"
]
const DIES_COLS = ["L","M","X","J","V","S","D"]

function getDiaSetmanaIndex(data: string): number {
  const d = new Date(data + "T00:00:00").getDay()
  return d === 0 ? 6 : d - 1 // 0=Dl, 6=Dg
}

function formatCellaLaborable(torn: AssignacioTorn): string {
  const parts: string[] = [`Camió: ${torn.camio.join(", ")}`]
  if (torn.satellit1.length) parts.push(`Satèl·lit 1: ${torn.satellit1.join(", ")}`)
  if (torn.satellit2.length) parts.push(`Satèl·lit 2: ${torn.satellit2.join(", ")}`)
  return parts.join("\n")
}

function formatCellaCapSetmana(torn: AssignacioTorn): string {
  const parts: string[] = [`Camió: ${torn.camio.join(", ")}`]
  if (torn.satellit1.length) parts.push(`Satèl·lit: ${torn.satellit1.join(", ")}`)
  return parts.join("\n")
}

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  left:  { style: "thin", color: { argb: "FF000000" } },
  top:   { style: "thin", color: { argb: "FF000000" } },
}

export async function generarExcel(
  mes: number,
  any: number,
  calendari: AssignacioTorn[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet("Mensual")

  const nomMes = NOMS_MESOS[mes - 1]
  const diesDelMes = new Date(any, mes, 0).getDate()
  const primerDia = getDiaSetmanaIndex(
    `${any}-${String(mes).padStart(2, "0")}-01`
  )

  // Amplades columnes (A..H)
  ws.getColumn("A").width = 8.7
  for (let c = 2; c <= 8; c++) ws.getColumn(c).width = 18.7

  const tornPerData = new Map<string, AssignacioTorn>()
  for (const torn of calendari) tornPerData.set(torn.data, torn)

  let fila = 3

  // ── Capçalera mes ──────────────────────────────────────────────
  const celMes = ws.getCell(fila, 2)
  celMes.value = `${nomMes} ${any}`
  celMes.font = { name: "Calibri", size: 28, bold: true }
  fila++

  // ── Capçalera dies setmana ─────────────────────────────────────
  const filaCap = ws.getRow(fila)
  filaCap.height = 22
  DIES_COLS.forEach((dia, i) => {
    const cel = ws.getCell(fila, i + 2)
    cel.value = dia
    cel.font = { name: "Calibri", size: 16 }
    cel.alignment = { horizontal: "center" }
    cel.border = THIN_BORDER
  })
  fila++

  // ── Setmanes ───────────────────────────────────────────────────
  let diaActual = 1
  while (diaActual <= diesDelMes) {
    const filaDates    = fila
    const filaContingut = fila + 1

    ws.getRow(filaDates).height    = 12.75
    ws.getRow(filaContingut).height = 75

    // Buits inicials / finals
    for (let col = 0; col < 7; col++) {
      const cD = ws.getCell(filaDates, col + 2)
      const cC = ws.getCell(filaContingut, col + 2)
      cD.border = THIN_BORDER
      cC.border = THIN_BORDER
      cC.alignment = { wrapText: true, vertical: "top" }
    }

    const colInici = diaActual === 1 ? primerDia : 0

    for (let col = colInici; col < 7 && diaActual <= diesDelMes; col++) {
      const dataStr = `${any}-${String(mes).padStart(2,"0")}-${String(diaActual).padStart(2,"0")}`
      const torn = tornPerData.get(dataStr)

      // Fila dates
      const celData = ws.getCell(filaDates, col + 2)
      celData.value = diaActual
      celData.font  = { name: "Calibri", size: 10 }
      celData.border = THIN_BORDER

      // Fila contingut
      const celCont = ws.getCell(filaContingut, col + 2)
      celCont.border = THIN_BORDER
      celCont.alignment = { wrapText: true, vertical: "top" }

      if (torn?.es_festiu) {
        celCont.value = "FESTIU"
        celCont.font  = { name: "Calibri", size: 9, bold: true, color: { argb: "FFFF8C00" } }
        celCont.alignment = { wrapText: true, vertical: "middle", horizontal: "center" }
      } else if (torn) {
        const text = torn.es_cap_setmana
          ? formatCellaCapSetmana(torn)
          : formatCellaLaborable(torn)

        const teBenNet = [...torn.camio, ...torn.satellit1, ...torn.satellit2].includes("BEN_NET")

        celCont.value = text
        celCont.font  = {
          name: "Calibri",
          size: 9,
          ...(teBenNet ? { bold: true, color: { argb: "FFFF0000" } } : {}),
        }
      }

      diaActual++
    }

    fila += 2
  }

  const buf = await wb.xlsx.writeBuffer()
  return Buffer.from(buf)
}
