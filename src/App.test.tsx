import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import App from './App'
import { createInitialProjectState } from './data/gates'

const getGateSection = (step: number) => {
  const title = screen.getByText(`Gate ${step}`)
  const section = title.closest('section')
  if (!section) {
    throw new Error('Gate section not found')
  }
  return section
}

beforeEach(() => {
  localStorage.clear()
})

test('initial gate 0 status is incomplete', () => {
  render(<App />)
  const gateZero = getGateSection(0)
  expect(within(gateZero).getByText('INCOMPLETO')).toBeInTheDocument()
})

test('gate 1 is blocked until gate 0 is pass', () => {
  render(<App />)
  const gateOne = getGateSection(1)
  expect(within(gateOne).getByText(/Bloccato/)).toBeInTheDocument()
  const [firstCheckbox] = within(gateOne).getAllByRole('checkbox')
  expect(firstCheckbox).toBeDisabled()
})

test('completing gate 0 unlocks gate 1', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByLabelText('Obiettivo del progetto scritto'))
  await user.click(
    screen.getByLabelText('Vincoli dichiarati (budget/tempo/tecnici)'),
  )
  await user.click(screen.getByLabelText('Fuori scope esplicitato'))

  const gateZero = getGateSection(0)
  expect(within(gateZero).getByText('PASS')).toBeInTheDocument()

  const gateOne = getGateSection(1)
  const [firstCheckbox] = within(gateOne).getAllByRole('checkbox')
  expect(firstCheckbox).toBeEnabled()
})

test('gate shows fail when all items are valued but not all true', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.click(screen.getByLabelText('Obiettivo del progetto scritto'))
  await user.click(screen.getByLabelText('Obiettivo del progetto scritto'))
  await user.click(
    screen.getByLabelText('Vincoli dichiarati (budget/tempo/tecnici)'),
  )
  await user.click(screen.getByLabelText('Fuori scope esplicitato'))

  const gateZero = getGateSection(0)
  expect(within(gateZero).getByText('FAIL')).toBeInTheDocument()
})

test('importing a JSON file updates the gate status', async () => {
  const user = userEvent.setup()
  render(<App />)

  const state = createInitialProjectState()
  state.gates[0].items = state.gates[0].items.map((item) => ({
    ...item,
    checked: true,
  }))
  const file = new File([JSON.stringify(state)], 'gate.json', {
    type: 'application/json',
  })

  const input = screen.getByLabelText('Carica JSON')
  await user.upload(input, file)

  const gateZero = getGateSection(0)
  expect(await within(gateZero).findByText('PASS')).toBeInTheDocument()
})

test('export creates a downloadable JSON file', async () => {
  const user = userEvent.setup()
  const createObjectURL = vi.fn(() => 'blob:mock')
  const revokeObjectURL = vi.fn()
  const original = URL.createObjectURL
  const originalRevoke = URL.revokeObjectURL
  URL.createObjectURL = createObjectURL
  URL.revokeObjectURL = revokeObjectURL

  render(<App />)
  await user.click(screen.getByRole('button', { name: /Scarica JSON/i }))

  expect(createObjectURL).toHaveBeenCalled()
  expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')

  URL.createObjectURL = original
  URL.revokeObjectURL = originalRevoke
})
