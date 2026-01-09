import { describe, expect, test } from 'vitest'
import { getGateStatus, type ChecklistItem } from './models'

const createItems = (checkedValues: Array<boolean | null>): ChecklistItem[] =>
  checkedValues.map((checked, index) => ({
    id: `item-${index}`,
    label: `Item ${index}`,
    checked,
  }))

describe('getGateStatus', () => {
  test('returns PASS when all items are true', () => {
    const items = createItems([true, true, true])

    expect(getGateStatus(items)).toBe('PASS')
  })

  test('returns FAIL when all items are set but at least one is false', () => {
    const items = createItems([true, false, true])

    expect(getGateStatus(items)).toBe('FAIL')
  })

  test('returns INCOMPLETE when at least one item is not set', () => {
    const items = createItems([true, null, false])

    expect(getGateStatus(items)).toBe('INCOMPLETE')
  })
})
