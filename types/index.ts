export type Rol = "conductor_camio" | "fix_satellit1" | "operari"

export interface Treballador {
  id: string
  nom: string
  cognoms: string
  rol: Rol
}

export interface AssignacioTorn {
  data: string         // ISO: "2026-06-01"
  dia_setmana: string  // "Dilluns"
  es_cap_setmana: boolean
  es_festiu: boolean
  camio: string[]
  satellit1: string[]
  satellit2: string[]
  descans: string[]
}

export interface RespostaGeneracio {
  calendari: AssignacioTorn[]
  errors_validacio: ErrorValidacio[]
  advertencies: string[]
}

export interface ErrorValidacio {
  restriccio: string
  missatge: string
  data?: string
}

export interface PeticioGeneracio {
  mes: number
  any: number
  festius: string
  baixes: string
  observacions: string
}

export interface VacancaInfo {
  nom: string
  dies: string[]
}
