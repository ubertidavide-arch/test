export type GateStatus = 'INCOMPLETE' | 'PASS' | 'FAIL'

export type ChecklistItem = {
  id: string
  label: string
  checked: boolean | null
}

export type GateState = {
  id: string
  title: string
  owner: string
  items: ChecklistItem[]
}

export type OverrideEntry = {
  id: string
  gateId: string
  by: string
  note: string
  at: string
}

export type ProjectState = {
  gates: GateState[]
  overrides: OverrideEntry[]
}

export const getGateStatus = (items: ChecklistItem[]): GateStatus => {
  if (items.some((item) => item.checked === null)) {
    return 'INCOMPLETE'
  }
  if (items.every((item) => item.checked === true)) {
    return 'PASS'
  }
  return 'FAIL'
}
