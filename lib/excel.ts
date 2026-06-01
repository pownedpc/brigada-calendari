import * as XLSX from "xlsx"
import { AssignacioTorn } from "@/types"

const NOMS_MESOS = [
  "Gener","Febrer","Març","Abril","Maig","Juny",
  "Juliol","Agost","Setembre","Octubre","Novembre","Desembre"
]
const DIES_COLS = ["L","M","X","J","V","S","D"] // B=L, C=M, D=X, E=J, F=V, G=S, H=D
const COL_LETTERS = ["B","C","D","E","F","G","H"]

function getDiaSetmanaIndex(data: string): number {
  // 0=Dl, 1=Dm, 2=Dx, 3=Dj, 4=Dv, 5=Ds, 6=Dg
  const d = new Date(data + "T00:00:00").getDay()
  return d === 0 ? 6 : d - 1
}

function formatCellaLaborable(torn: AssignacioTorn): string {
  const camioStr = torn.camio.join(", ")
  const sat1Str = torn.satellit1.join(", ")
  const sat2Str = torn.satellit2.join(", ")
  let txt = `Camió: ${camioStr}\nSatèl·lit 1: ${sat1Str}`
  if (sat2Str) txt += `\nSatèl·lit 2: ${sat2Str}`
  return txt
}

function formatCellaCapSetmana(torn: AssignacioTorn): string {
  const camioStr = torn.camio.join(", ")
  const sat1Str = torn.satellit1.join(", ")
  return `Camió: ${camioStr}\nSatèl·lit: ${sat1Str}`
}

export function generarExcel(
  mes: number,
  any: number,
  calendari: AssignacioTorn[]
): Buffer {
  const wb = XLSX.utils.book_new()
  const ws: XLSX.WorkSheet = {}

  const nomMes = NOMS_MESOS[mes - 1]
  const diesDelMes = new Date(any, mes, 0).getDate()

  // Calcular primer dia de la setmana del mes
  const primerDia = getDiaSetmanaIndex(`${any}-${String(mes).padStart(2, "0")}-01`)

  // Estructura: capçalera mes (fila 3), capçalera dies (fila 4), setmanes (2 files per setmana)
  let filaActual = 3

  // Capçalera mes
  ws[`B${filaActual}`] = {
    v: `${nomMes} ${any}`,
    t: "s",
    s: {
      font: { name: "Calibri", sz: 28, bold: true },
      alignment: { horizontal: "left" },
    },
  }
  filaActual++

  // Capçalera dies setmana
  DIES_COLS.forEach((dia, i) => {
    ws[`${COL_LETTERS[i]}${filaActual}`] = {
      v: dia,
      t: "s",
      s: {
        font: { name: "Calibri", sz: 16 },
        alignment: { horizontal: "center" },
        border: {
          left: { style: "thin" },
          top: { style: "thin" },
        },
      },
    }
  })
  filaActual++

  // Preparar mapa data->torn
  const tornPerData = new Map<string, AssignacioTorn>()
  for (const torn of calendari) {
    tornPerData.set(torn.data, torn)
  }

  // Setmanes — primer fila dates, segon fila contingut
  let diaActual = 1
  // Primer "setmana" pot tenir dies buits a l'inici
  while (diaActual <= diesDelMes) {
    const filaDates = filaActual
    const filaContingut = filaActual + 1

    // Fila dates
    for (let col = 0; col < 7; col++) {
      const colLetter = COL_LETTERS[col]
      let diaNum: number | null = null

      if (diaActual === 1) {
        // Primer dia: calcular columna correcta
        if (col >= primerDia) {
          const offset = col - primerDia
          diaNum = offset + 1
        }
      } else {
        // Continuar seqüencialment
        diaNum = null // es calcularà baix
      }

      ws[`${colLetter}${filaDates}`] = {
        v: "",
        t: "s",
        s: {
          font: { name: "Calibri", sz: 10 },
          border: { left: { style: "thin" }, top: { style: "thin" } },
        },
      }
      ws[`${colLetter}${filaContingut}`] = {
        v: "",
        t: "s",
        s: {
          font: { name: "Calibri", sz: 9 },
          alignment: { wrapText: true, vertical: "top" },
          border: { left: { style: "thin" }, top: { style: "thin" } },
        },
      }
    }

    // Omplir setmana
    // Determinar el rang de dies d'aquesta setmana
    // Col·lumna d'inici: si és la primera setmana, primerDia; sinó, 0
    const colInici = diaActual === 1 ? primerDia : 0
    for (let col = colInici; col < 7 && diaActual <= diesDelMes; col++) {
      const colLetter = COL_LETTERS[col]
      const dataStr = `${any}-${String(mes).padStart(2, "0")}-${String(diaActual).padStart(2, "0")}`
      const torn = tornPerData.get(dataStr)

      // Fila dates
      ws[`${colLetter}${filaDates}`] = {
        v: diaActual,
        t: "n",
        s: {
          font: { name: "Calibri", sz: 10 },
          border: { left: { style: "thin" }, top: { style: "thin" } },
        },
      }

      // Fila contingut
      if (torn) {
        if (torn.es_festiu) {
          ws[`${colLetter}${filaContingut}`] = {
            v: "FESTIU",
            t: "s",
            s: {
              font: { name: "Calibri", sz: 9, color: { rgb: "FF8C00" }, bold: true },
              alignment: { wrapText: true, vertical: "top", horizontal: "center" },
              border: { left: { style: "thin" }, top: { style: "thin" } },
            },
          }
        } else {
          const textCella = torn.es_cap_setmana
            ? formatCellaCapSetmana(torn)
            : formatCellaLaborable(torn)

          // Comprovar si hi ha BEN_NET (rich text simplificat — xlsx no suporta rich text fàcilment)
          const teBenNet = torn.camio.includes("BEN_NET") ||
            torn.satellit1.includes("BEN_NET") ||
            torn.satellit2.includes("BEN_NET")

          ws[`${colLetter}${filaContingut}`] = {
            v: textCella,
            t: "s",
            s: {
              font: {
                name: "Calibri",
                sz: 9,
                ...(teBenNet ? { color: { rgb: "FF0000" }, bold: true } : {}),
              },
              alignment: { wrapText: true, vertical: "top" },
              border: { left: { style: "thin" }, top: { style: "thin" } },
            },
          }
        }
      }

      diaActual++
    }

    filaActual += 2
  }

  // Dimensions de les columnes
  ws["!cols"] = [
    { wch: 8.7 },  // A
    { wch: 18.7 }, // B
    { wch: 18.7 }, // C
    { wch: 18.7 }, // D
    { wch: 18.7 }, // E
    { wch: 18.7 }, // F
    { wch: 18.7 }, // G
    { wch: 18.7 }, // H
  ]

  // Rang del full
  ws["!ref"] = `A1:H${filaActual}`

  XLSX.utils.book_append_sheet(wb, ws, "Mensual")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  return Buffer.from(buf)
}
