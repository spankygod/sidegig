import test from 'node:test'
import assert from 'node:assert/strict'
import {
  findContactDetailViolation,
  findContactDetailViolationInFields,
  formatModerationViolation,
  normalizeUserText
} from './policy'

test('normalizeUserText trims and collapses whitespace', () => {
  assert.equal(normalizeUserText('  hello   raket\nteam  '), 'hello raket team')
})

test('findContactDetailViolation detects obvious contact details', () => {
  assert.equal(findContactDetailViolation('message me at test@example.com'), 'email address')
  assert.equal(findContactDetailViolation('see www.example.com now'), 'external link')
  assert.equal(findContactDetailViolation('call 0917 123 4567'), 'phone number')
  assert.equal(findContactDetailViolation('available tomorrow morning'), null)
})

test('findContactDetailViolationInFields reports the first violating field', () => {
  const violation = findContactDetailViolationInFields([
    { label: 'Title', value: 'clean yard' },
    { label: 'Description', value: 'call 09171234567 for details' }
  ])

  assert.deepEqual(violation, {
    field: 'Description',
    reason: 'phone number'
  })
  assert.equal(formatModerationViolation(violation!), 'Description cannot include a phone number')
})
