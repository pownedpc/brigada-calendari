import { AssignacioTorn } from "@/types"

const DIES_CA = ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"]

export function getNomDia(data: string): string {
  return DIES_CA[new Date(data + "T00:00:00").getDay()]
}

export function esCapSetmana(data: string): boolean {
  const d = new Date(data + "T00:00:00").getDay()
  return d === 0 || d === 6
}

export interface DisponibilitatDia {
  data: string
  dia_setmana: string
  es_cap_setmana: boolean
  es_festiu: boolean
  disponibles: string[]
  no_disponibles: string[]
  motius: Record<string, string>
}

export function construirPrompt(
  mes: number,
  any: number,
  disponibilitat: DisponibilitatDia[]
): string {
  const nomMes = ["Gener","Febrer","Març","Abril","Maig","Juny","Juliol","Agost","Setembre","Octubre","Novembre","Desembre"][mes - 1]

  const diesStr = disponibilitat
    .filter(d => !d.es_festiu)
    .map(d => {
      const motius = Object.entries(d.motius).map(([n, m]) => `${n}:${m}`).join(", ")
      return `${d.data} (${d.dia_setmana}${d.es_cap_setmana ? " CAP_SETMANA" : ""}): disponibles=[${d.disponibles.join(",")}] no_disponibles=[${d.no_disponibles.join(",")}]${motius ? ` (${motius})` : ""}`
    })
    .join("\n")

  return `Genera el calendari de torns per a la brigada porta a porta del mes de ${nomMes} ${any}.

TREBALLADORS I ROLS:
- Mohamed: conductor. Va al Camió quan li toca. Quan NO va al Camió (l'altre conductor condueix), POT i HA D'anar a un satèl·lit si hi ha plaça lliure — no descansar si hi ha necessitat.
- Samer: FIX al Satèl·lit 1 sempre. Mai al Camió ni Satèl·lit 2.
- Fredi: operari (rota entre vehicles)
- Karim: operari (rota entre vehicles)
- Mamadou: conductor. Va al Camió quan li toca. Quan NO va al Camió (l'altre conductor condueix), PEUT i HA D'anar a un satèl·lit si hi ha plaça lliure — no descansar si hi ha necessitat.
- Mourad: operari (rota entre vehicles)
- Koke: operari (rota entre vehicles)
- Mimoun: operari (rota entre vehicles)
- BEN_NET: ÚLTIM RECURS. Només quan tots els treballadors disponibles ja estan assignats o de descans obligatori.

RESTRICCIONS ABSOLUTES:
R1. Camió SEMPRE necessita EXACTAMENT UN conductor: O Mohamed O Mamadou (mai els dos junts al Camió). L'altre conductor disponible HA de cobrir una plaça de satèl·lit si en queda una de buida.
R2. Samer va SEMPRE i ÚNICAMENT al Satèl·lit 1. Si no disponible, Satèl·lit 1 pot tenir BEN_NET.
R3. Fredi i Mourad MAI poden coincidir al Satèl·lit 1 ni al Satèl·lit 2.
R4. Dies laborables: Camió=3, Satèl·lit1=2, Satèl·lit2=2. Caps setmana: Camió=3, Satèl·lit1=1, Satèl·lit2=[].
R5. Cada treballador mínim 2 dies de descans per setmana (màx 5 dies treballats/setmana).
R6. No repetir el mateix treballador al mateix vehicle >2 dies consecutius (excepte Samer, que és fix).
R7. PRIORITAT ABSOLUTA: cap treballador treballa si no_disponible (vacances/baixa/festiu).
R8. BEN_NET només si després d'assignar TOTS els treballadors disponibles (inclosos els conductors que no condueixen aquell dia) encara queda una plaça buida.

DISPONIBILITAT PER DIA:
${diesStr}

Retorna ÚNICAMENT un JSON vàlid (sense markdown, sense text addicional) amb aquesta estructura exacta:
{
  "dies": [
    {
      "data": "YYYY-MM-DD",
      "dia_setmana": "Dilluns",
      "es_cap_setmana": false,
      "es_festiu": false,
      "camio": ["nom1", "nom2", "nom3"],
      "satellit1": ["nom1", "nom2"],
      "satellit2": ["nom1", "nom2"],
      "descans": ["nom1"]
    }
  ]
}

IMPORTANT: Inclou TOTS els dies del mes, inclosos festius (amb es_festiu:true i arrays buits) i caps de setmana.
Per caps de setmana: satellit2 sempre [].
Respecta estrictament la disponibilitat: NO posis ningú a treballar si apareix a no_disponibles.`
}

export function calcularDisponibilitat(
  mes: number,
  any: number,
  festiusInput: string,
  baixesInput: string,
  vacancesDelMes: Record<string, string[]>
): DisponibilitatDia[] {
  const TOTS_NOMS = ["Mohamed", "Samer", "Fredi", "Karim", "Mamadou", "Mourad", "Koke", "Mimoun"]

  // Parsejar festius
  const festiusDies = new Set<string>()
  if (festiusInput.trim()) {
    const parts = festiusInput.split(/[,;|\n]/).map(s => s.trim()).filter(Boolean)
    for (const part of parts) {
      const num = parseInt(part.replace(/\D/g, ""))
      if (num >= 1 && num <= 31) {
        festiusDies.add(`${any}-${String(mes).padStart(2, "0")}-${String(num).padStart(2, "0")}`)
      }
    }
  }

  // Parsejar baixes (noms de treballadors)
  const baixesNoms = new Set<string>()
  if (baixesInput.trim()) {
    const parts = baixesInput.split(/[,;\n]/).map(s => s.trim()).filter(Boolean)
    for (const part of parts) {
      const nom = TOTS_NOMS.find(n => part.toLowerCase().includes(n.toLowerCase()))
      if (nom) baixesNoms.add(nom)
    }
  }

  // Construir vacances per dia
  const vacancesPerNom: Record<string, Set<string>> = {}
  for (const [nom, dies] of Object.entries(vacancesDelMes)) {
    vacancesPerNom[nom] = new Set(dies)
  }

  const diesDelMes: DisponibilitatDia[] = []
  const diesEnMes = new Date(any, mes, 0).getDate()

  for (let d = 1; d <= diesEnMes; d++) {
    const data = `${any}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    const esFestiu = festiusDies.has(data)
    const esCDS = esCapSetmana(data)
    const nomDia = getNomDia(data)

    const disponibles: string[] = []
    const noDisponibles: string[] = []
    const motius: Record<string, string> = {}

    for (const nom of TOTS_NOMS) {
      if (baixesNoms.has(nom)) {
        noDisponibles.push(nom)
        motius[nom] = "baixa"
      } else if (vacancesPerNom[nom]?.has(data)) {
        noDisponibles.push(nom)
        motius[nom] = "vacances"
      } else {
        disponibles.push(nom)
      }
    }

    diesDelMes.push({ data, dia_setmana: nomDia, es_cap_setmana: esCDS, es_festiu: esFestiu, disponibles, no_disponibles: noDisponibles, motius })
  }

  return diesDelMes
}
