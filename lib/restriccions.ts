import { AssignacioTorn, ErrorValidacio } from "@/types"

export function validarCalendari(
  dies: AssignacioTorn[],
  festius: string[],
  baixes: string[]
): ErrorValidacio[] {
  const errors: ErrorValidacio[] = []

  for (const dia of dies) {
    if (dia.es_festiu) continue

    const tots = [...dia.camio, ...dia.satellit1, ...dia.satellit2]

    // R1: Camió sempre amb conductor (Mohamed o Mamadou), mai els dos
    const conductorsAlCamio = dia.camio.filter(n => n === "Mohamed" || n === "Mamadou")
    if (conductorsAlCamio.length === 0) {
      errors.push({
        restriccio: "R1",
        missatge: `${dia.data}: El Camió no té cap conductor (Mohamed o Mamadou).`,
        data: dia.data,
      })
    }
    if (conductorsAlCamio.length > 1) {
      errors.push({
        restriccio: "R1",
        missatge: `${dia.data}: Mohamed i Mamadou coincideixen al Camió.`,
        data: dia.data,
      })
    }

    // R2: Samer fix al Satèl·lit 1 (si disponible)
    const samerAlCamio = dia.camio.includes("Samer")
    const samerAlSat2 = dia.satellit2.includes("Samer")
    if (samerAlCamio || samerAlSat2) {
      errors.push({
        restriccio: "R2",
        missatge: `${dia.data}: Samer assignat fora del Satèl·lit 1 (${samerAlCamio ? "Camió" : "Satèl·lit 2"}).`,
        data: dia.data,
      })
    }

    // R3: Fredi i Mourad mai coincideixen als satèl·lits
    const frediAlSat = [...dia.satellit1, ...dia.satellit2].includes("Fredi")
    const mouradAlSat = [...dia.satellit1, ...dia.satellit2].includes("Mourad")
    if (frediAlSat && mouradAlSat) {
      errors.push({
        restriccio: "R3",
        missatge: `${dia.data}: Fredi i Mourad coincideixen als satèl·lits.`,
        data: dia.data,
      })
    }

    // R4: Dotació diària
    if (!dia.es_cap_setmana) {
      if (dia.camio.length !== 3) {
        errors.push({
          restriccio: "R4",
          missatge: `${dia.data}: Camió hauria de tenir 3 persones, en té ${dia.camio.length}.`,
          data: dia.data,
        })
      }
      if (dia.satellit1.length !== 2) {
        errors.push({
          restriccio: "R4",
          missatge: `${dia.data}: Satèl·lit 1 hauria de tenir 2 persones, en té ${dia.satellit1.length}.`,
          data: dia.data,
        })
      }
      if (dia.satellit2.length !== 2) {
        errors.push({
          restriccio: "R4",
          missatge: `${dia.data}: Satèl·lit 2 hauria de tenir 2 persones, en té ${dia.satellit2.length}.`,
          data: dia.data,
        })
      }
    } else {
      if (dia.camio.length !== 3) {
        errors.push({
          restriccio: "R4",
          missatge: `${dia.data} (cap setmana): Camió hauria de tenir 3 persones, en té ${dia.camio.length}.`,
          data: dia.data,
        })
      }
      if (dia.satellit1.length !== 1) {
        errors.push({
          restriccio: "R4",
          missatge: `${dia.data} (cap setmana): Satèl·lit 1 hauria de tenir 1 persona, en té ${dia.satellit1.length}.`,
          data: dia.data,
        })
      }
      if (dia.satellit2.length !== 0) {
        errors.push({
          restriccio: "R4",
          missatge: `${dia.data} (cap setmana): Satèl·lit 2 hauria d'estar buit, en té ${dia.satellit2.length}.`,
          data: dia.data,
        })
      }
    }

    // R7: Ningú treballa en dia de vacances/festiu/baixa
    const no_disponibles_vacances = baixes.map(b => b.trim())
    for (const nom of tots) {
      if (nom === "BEN_NET") continue
      if (no_disponibles_vacances.includes(nom)) {
        errors.push({
          restriccio: "R7",
          missatge: `${dia.data}: ${nom} assignat però està de baixa.`,
          data: dia.data,
        })
      }
    }
  }

  // R5: Descans mínim 2 dies per setmana (agrupa per setmana ISO)
  const setmanes: Record<string, Record<string, number>> = {}
  for (const dia of dies) {
    if (dia.es_festiu) continue
    const setmana = getSetmanaISO(dia.data)
    if (!setmanes[setmana]) setmanes[setmana] = {}
    const treballadors = [...dia.camio, ...dia.satellit1, ...dia.satellit2]
    for (const nom of treballadors) {
      if (nom === "BEN_NET") continue
      setmanes[setmana][nom] = (setmanes[setmana][nom] ?? 0) + 1
    }
  }
  for (const [setmana, comptadors] of Object.entries(setmanes)) {
    for (const [nom, diesTreballats] of Object.entries(comptadors)) {
      if (diesTreballats > 5) {
        errors.push({
          restriccio: "R5",
          missatge: `Setmana ${setmana}: ${nom} treballa ${diesTreballats} dies (màx 5 per tenir mínim 2 de descans).`,
        })
      }
    }
  }

  // R6: No repetir mateix vehicle >2 dies consecutius
  const noms = ["Mohamed", "Samer", "Fredi", "Karim", "Mamadou", "Mourad", "Koke", "Mimoun"]
  for (const nom of noms) {
    let consecutius = 0
    let vehicleAnterior = ""
    for (const dia of dies) {
      if (dia.es_festiu) { consecutius = 0; vehicleAnterior = ""; continue }
      let vehicle = ""
      if (dia.camio.includes(nom)) vehicle = "camio"
      else if (dia.satellit1.includes(nom)) vehicle = "satellit1"
      else if (dia.satellit2.includes(nom)) vehicle = "satellit2"
      else { consecutius = 0; vehicleAnterior = ""; continue }

      if (vehicle === vehicleAnterior) {
        consecutius++
        if (consecutius > 2) {
          errors.push({
            restriccio: "R6",
            missatge: `${dia.data}: ${nom} porta més de 2 dies consecutius al ${vehicle}.`,
            data: dia.data,
          })
        }
      } else {
        consecutius = 1
        vehicleAnterior = vehicle
      }
    }
  }

  return errors
}

function getSetmanaISO(data: string): string {
  const d = new Date(data)
  const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay()
  const thursday = new Date(d)
  thursday.setDate(d.getDate() - dayOfWeek + 4)
  const yearStart = new Date(thursday.getFullYear(), 0, 1)
  const weekNo = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${thursday.getFullYear()}-W${String(weekNo).padStart(2, "0")}`
}
