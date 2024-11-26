import * as Cards from '../'

const v1Card: Cards.V1 = {
  name: 'John',
  description: '{{char}} is a man.',
  personality: 'cruel',
  scenario: '{{char}} hates {{user}}',
  first_mes: 'Hi!',
  mes_example: '',
}

const v2CardFromV1: Cards.V2 = {
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    name: 'John',
    description: '{{char}} is a man.',
    personality: 'cruel',
    scenario: '{{char}} hates {{user}}',
    first_mes: 'Hi!',
    mes_example: '',
    creator_notes: '',
    system_prompt: '',
    post_history_instructions: '',
    alternate_greetings: [],
    character_book: undefined,
    tags: [],
    creator: '',
    character_version: '',
    extensions: {},
  },
}

const v2Card: Cards.V2 = {
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    name: 'Mary',
    description: '{{char}} is a woman.',
    personality: 'generous',
    scenario: '{{char}} loves {{user}}',
    first_mes: 'Hello!',
    mes_example: '',
    creator_notes: 'My first card.',
    system_prompt: '',
    post_history_instructions: 'Your message must start with the word "Sweetie".',
    alternate_greetings: ['Heeeey!'],
    character_book: undefined,
    tags: ['female', 'oc'],
    creator: 'darkpriest',
    character_version: '',
    extensions: {},
  },
}

const v2CardWithBackfilledV1Fields: Cards.BackfilledV2 = {
  name: 'Mary',
  description: '{{char}} is a woman.',
  personality: 'generous',
  scenario: '{{char}} loves {{user}}',
  first_mes: 'Hello!',
  mes_example: '',
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    name: 'Mary',
    description: '{{char}} is a woman.',
    personality: 'generous',
    scenario: '{{char}} loves {{user}}',
    first_mes: 'Hello!',
    mes_example: '',
    creator_notes: 'My first card.',
    system_prompt: '',
    post_history_instructions: 'Your message must start with the word "Sweetie".',
    alternate_greetings: ['Heeeey!'],
    character_book: undefined,
    tags: ['female', 'oc'],
    creator: 'darkpriest',
    character_version: '',
    extensions: {},
  },
}

const v2CardWithBackfilledObsolescenceNotice: Cards.BackfilledV2 = {
  name: 'This is a V2 Character Card. Please update your frontend.',
  description: 'This is a V2 Character Card. Please update your frontend.',
  personality: 'This is a V2 Character Card. Please update your frontend.',
  scenario: 'This is a V2 Character Card. Please update your frontend.',
  first_mes: 'This is a V2 Character Card. Please update your frontend.',
  mes_example: 'This is a V2 Character Card. Please update your frontend.',
  spec: 'chara_card_v2',
  spec_version: '2.0',
  data: {
    name: 'Mary',
    description: '{{char}} is a woman.',
    personality: 'generous',
    scenario: '{{char}} loves {{user}}',
    first_mes: 'Hello!',
    mes_example: '',
    creator_notes: 'My first card.',
    system_prompt: '',
    post_history_instructions: 'Your message must start with the word "Sweetie".',
    alternate_greetings: ['Heeeey!'],
    character_book: undefined,
    tags: ['female', 'oc'],
    creator: 'darkpriest',
    character_version: '',
    extensions: {},
  },
}

const bookEntry: Cards.CharacterBookEntry = {
  keys: ['king'],
  content: 'king=old',
  extensions: {},
  enabled: true,
  insertion_order: 1,
}

const book: Cards.CharacterBook = {
  entries: [bookEntry],
  extensions: {},
}

test('parseToV2', () => {
  expect(Cards.parseToV2(v1Card)).toEqual(v2CardFromV1)
  expect(Cards.parseToV2(v2Card)).toEqual(v2Card)
  expect(() => Cards.parseToV2({ ...v2Card, spec: 'x' })).toThrow()
})

test('safeParseToV2', () => {
  expect(Cards.safeParseToV2(v1Card)).toEqual({ success: true, data: v2CardFromV1 })
  expect(Cards.safeParseToV2(v2Card)).toEqual({ success: true, data: v2Card })
  expect(Cards.safeParseToV2({ ...v2Card, spec: 'x' }).success).toBe(false)
})

test('v1ToV2', () => {
  expect(Cards.v1ToV2(v1Card)).toEqual(v2CardFromV1)
})

test('backfillV2', () => {
  expect(Cards.backfillV2(v2Card)).toEqual(v2CardWithBackfilledV1Fields)
})

test('backfillV2WithObsolescenceNotice', () => {
  expect(Cards.backfillV2WithObsolescenceNotice(v2Card)).toEqual(
    v2CardWithBackfilledObsolescenceNotice,
  )
})

test('v1', () => {
  expect(Cards.v1.safeParse(v1Card).success).toBe(true)
  expect(Cards.v1.safeParse(v2CardWithBackfilledV1Fields).success).toBe(true)
  expect(Cards.v1.safeParse({}).success).toBe(false)
  expect(Cards.v1.safeParse(v2Card).success).toBe(false)
})

test('v2', () => {
  expect(Cards.v2.safeParse(v1Card).success).toBe(false)
  expect(Cards.v2.safeParse(v2CardWithBackfilledV1Fields).success).toBe(true)
  expect(Cards.v2.safeParse({}).success).toBe(false)
  expect(Cards.v2.safeParse(v2Card).success).toBe(true)
})

test('entry', () => {
  expect(Cards.entry.safeParse(bookEntry).success).toBe(true)
  expect(Cards.entry.safeParse(v1Card).success).toBe(false)
})

test('book', () => {
  expect(Cards.book.safeParse(book).success).toBe(true)
  expect(Cards.book.safeParse(v1Card).success).toBe(false)
})
