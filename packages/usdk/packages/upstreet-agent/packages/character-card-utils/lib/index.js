"use strict";
/**
 * @packageDocumentation
 *
 * ### Installing
 *
 * ```
 * npm install character-card-utils
 * ```
 *
 * ### Importing
 *
 * #### ES6
 *
 * ```
 * import * as Cards from 'character-card-utils'
 * ```
 *
 * #### CommonJS
 *
 * ```
 * const Cards = require('character-card-utils')
 * ```
 *
 * ### Parsing/validating arbitrary JSON
 *
 * Refer to the documentation for {@link parseToV2} and {@link safeParseToV2}.
 * Those functions automatically convert {@link V1} cards to {@link V2}.
 *
 * For more specific parsers, refer to the documentation for {@link v1}, {@link v2}, {@link book}, and {@link entry}.
 *
 * ### Utilities
 *
 * - {@link v1ToV2} converts a {@link V1} card into a {@link V2} card, populating V2-only fields with sensible defaults
 * - {@link backfillV2} makes a V2 card backward-compatible with V1-only frontends by backfilling V1 fields.
 * - {@link backfillV2WithObsolescenceNotice} backfills every V1 fields with "This is a V2 Character Card. Please update your frontend."
 *
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.backfilledV2 = exports.v2 = exports.book = exports.entry = exports.v1 = exports.backfillV2WithObsolescenceNotice = exports.backfillV2 = exports.v1ToV2 = exports.safeParseToV2 = exports.parseToV2 = void 0;
var zod_1 = require("zod");
/**
 * Takes unknown data, and returns a {@link V2 | `Cards.V2`}.
 *
 * If the input is a {@link V1} card, it will be converted to {@link V2}. If the input is neither V2 nor V1, it will throw a ZodError.
 *
 * For an alternative which doesn't throw on failure, see {@link safeParseToV2}
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * Cards.parseToV2(validV2Card) //=> return type Cards.V2
 * Cards.parseToV2(validV1Card) //=> return type Cards.V2
 * Cards.parseToV2(invalidCard) //=> throws ZodError
 * ```
 *
 * @category Helper functions
 */
var parseToV2 = function (data) {
    var v2ParsingAttempt = exports.v2.safeParse(data);
    if (v2ParsingAttempt.success)
        return v2ParsingAttempt.data;
    var v1ParsingAttempt = exports.v1.safeParse(data);
    if (v1ParsingAttempt.success)
        return (0, exports.v1ToV2)(v1ParsingAttempt.data);
    throw v2ParsingAttempt.error;
};
exports.parseToV2 = parseToV2;
/**
 * Takes unknown data, and on success returns a `{ success: true, data: Cards.V2 }`.
 *
 * On error, it instead returns a `{ success: false; error: ZodError }`.
 *
 * If the input is a {@link V1} card, it will be converted to {@link V2}.
 *
 * For an alternative which directly returns a `Cards.V2` but throws on failure, see {@link parseToV2}
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * Cards.safeParseToV2(validV2Card) //=> return type { success: true; data: Cards.V2 }
 * Cards.safeParseToV2(validV1Card) //=> return type { success: true; data: Cards.V2 }
 * Cards.safeParseToV2(invalidCard) //=> return type { success: false; error: ZodError }
 * ```
 *
 * @category Helper functions
 */
var safeParseToV2 = function (data) {
    var v2ParsingAttempt = exports.v2.safeParse(data);
    if (v2ParsingAttempt.success)
        return v2ParsingAttempt;
    var v1ParsingAttempt = exports.v1.safeParse(data);
    if (v1ParsingAttempt.success)
        return exports.v2.safeParse((0, exports.v1ToV2)(v1ParsingAttempt.data));
    return v2ParsingAttempt;
};
exports.safeParseToV2 = safeParseToV2;
/**
 * Converts a {@link V1 | `Cards.V1`} to a {@link V2 | `Cards.V2`}, populating V2 fields with appropriate defaults.
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * const v1Card: Cards.V1 = {
 *   name: 'John',
 *   description: '{{char}} is a man.',
 *   personality: 'cruel',
 *   scenario: '{{char}} hates {{user}}',
 *   first_mes: 'Hi!',
 *   mes_example: '',
 * }
 *
 * const v2CardFromV1: Cards.V2 = {
 *   spec: 'chara_card_v2',
 *   spec_version: '2.0',
 *   data: {
 *     name: 'John',
 *     description: '{{char}} is a man.',
 *     personality: 'cruel',
 *     scenario: '{{char}} hates {{user}}',
 *     first_mes: 'Hi!',
 *     mes_example: '',
 *     creator_notes: '',
 *     system_prompt: '',
 *     post_history_instructions: '',
 *     alternate_greetings: [],
 *     character_book: undefined,
 *     tags: [],
 *     creator: '',
 *     character_version: '',
 *     extensions: {},
 *   },
 * }
 *
 * expect(Cards.v1ToV2(v1Card)).toEqual(v2CardFromV1)
 * ```
 *
 * @category Helper functions
 */
var v1ToV2 = function (v1Card) { return ({
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: __assign(__assign({}, v1Card), { creator_notes: '', system_prompt: '', post_history_instructions: '', alternate_greetings: [], character_book: undefined, tags: [], creator: '', character_version: '', extensions: {} }),
}); };
exports.v1ToV2 = v1ToV2;
/**
 * Takes a {@link V2} card, and backfills {@link V1} fields into it.
 *
 * Useful right before exporting a card, for backwards compatibility.
 *
 * Note: long-term, we would like to abandon V1 fields completely.
 *
 * To backfill an obsolescence notice instead, see: {@link backfillV2WithObsolescenceNotice}
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * const v2Card = {
 *   spec: 'chara_card_v2',
 *   spec_version: '2.0',
 *   data: {
 *     name: 'Mary',
 *     description: '{{char}} is a woman.',
 *     personality: 'generous',
 *     scenario: '{{char}} loves {{user}}',
 *     first_mes: 'Hello!',
 *     mes_example: '',
 *     creator_notes: 'My first card.',
 *     system_prompt: '',
 *     post_history_instructions: 'Your message must start with the word "Sweetie".',
 *     alternate_greetings: ['Heeeey!'],
 *     character_book: undefined,
 *     tags: ['female', 'oc'],
 *     creator: 'darkpriest',
 *     character_version: '',
 *     extensions: {},
 *   },
 * }
 *
 * const v2CardWithBackfilledV1Fields: Cards.BackfilledV2 = {
 *   name: 'Mary',
 *   description: '{{char}} is a woman.',
 *   personality: 'generous',
 *   scenario: '{{char}} loves {{user}}',
 *   first_mes: 'Hello!',
 *   mes_example: '',
 *   spec: 'chara_card_v2',
 *   spec_version: '2.0',
 *   data: {
 *     name: 'Mary',
 *     description: '{{char}} is a woman.',
 *     personality: 'generous',
 *     scenario: '{{char}} loves {{user}}',
 *     first_mes: 'Hello!',
 *     mes_example: '',
 *     creator_notes: 'My first card.',
 *     system_prompt: '',
 *     post_history_instructions: 'Your message must start with the word "Sweetie".',
 *     alternate_greetings: ['Heeeey!'],
 *     character_book: undefined,
 *     tags: ['female', 'oc'],
 *     creator: 'darkpriest',
 *     character_version: '',
 *     extensions: {},
 *   },
 * }
 *
 * expect(Cards.backfillV2(v2Card)).toEqual(v2CardWithBackfilledV1Fields) * ```
 *
 * @category Helper functions
 */
var backfillV2 = function (v2Card) { return (__assign(__assign({}, v2Card), { name: v2Card.data.name, description: v2Card.data.description, personality: v2Card.data.personality, scenario: v2Card.data.scenario, first_mes: v2Card.data.first_mes, mes_example: v2Card.data.mes_example })); };
exports.backfillV2 = backfillV2;
/**
 * Takes a V2 card, and backfills every V1 fields with the obsolescence notice:
 * "This is a V2 Character Card. Please update your frontend."
 *
 * To backfill the V1 fields with the actual data, see: {@link backfillV2}
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * const v2Card = {
 *   spec: 'chara_card_v2',
 *   spec_version: '2.0',
 *   data: {
 *     name: 'Mary',
 *     description: '{{char}} is a woman.',
 *     personality: 'generous',
 *     scenario: '{{char}} loves {{user}}',
 *     first_mes: 'Hello!',
 *     mes_example: '',
 *     creator_notes: 'My first card.',
 *     system_prompt: '',
 *     post_history_instructions: 'Your message must start with the word "Sweetie".',
 *     alternate_greetings: ['Heeeey!'],
 *     character_book: undefined,
 *     tags: ['female', 'oc'],
 *     creator: 'darkpriest',
 *     character_version: '',
 *     extensions: {},
 *   },
 * }
 *
 * const v2CardWithBackfilledObsolescenceNotice: Cards.BackfilledV2 = {
 *   name: 'This is a V2 Character Card. Please update your frontend.',
 *   description: 'This is a V2 Character Card. Please update your frontend.',
 *   personality: 'This is a V2 Character Card. Please update your frontend.',
 *   scenario: 'This is a V2 Character Card. Please update your frontend.',
 *   first_mes: 'This is a V2 Character Card. Please update your frontend.',
 *   mes_example: 'This is a V2 Character Card. Please update your frontend.',
 *   spec: 'chara_card_v2',
 *   spec_version: '2.0',
 *   data: {
 *     name: 'Mary',
 *     description: '{{char}} is a woman.',
 *     personality: 'generous',
 *     scenario: '{{char}} loves {{user}}',
 *     first_mes: 'Hello!',
 *     mes_example: '',
 *     creator_notes: 'My first card.',
 *     system_prompt: '',
 *     post_history_instructions: 'Your message must start with the word "Sweetie".',
 *     alternate_greetings: ['Heeeey!'],
 *     character_book: undefined,
 *     tags: ['female', 'oc'],
 *     creator: 'darkpriest',
 *     character_version: '',
 *     extensions: {},
 *   },
 * }
 *
 * expect(Cards.backfillV2WithObsolescenceNotice(v2Card)).toEqual(
 *   v2CardWithBackfilledObsolescenceNotice
 * )
 * ```
 *
 * @category Helper functions
 */
var backfillV2WithObsolescenceNotice = function (v2Card) {
    var obsolescenceNotice = 'This is a V2 Character Card. Please update your frontend.';
    return __assign(__assign({}, v2Card), { name: obsolescenceNotice, description: obsolescenceNotice, personality: obsolescenceNotice, scenario: obsolescenceNotice, first_mes: obsolescenceNotice, mes_example: obsolescenceNotice });
};
exports.backfillV2WithObsolescenceNotice = backfillV2WithObsolescenceNotice;
/**
 * A parser object made with the {@link https://www.npmjs.com/package/zod | zod} library which can be used to validate
 * or parse Character Cards using the {@link V1} spec.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v1.md>
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * // parsing
 * Cards.v1.parse(v1Card) //=> return type Cards.V1
 * Cards.v1.parse(v2CardWithV1FieldsBackfilled) //=> return type Cards.V1
 * Cards.v1.parse(incorrectlyFormattedCard) //=> throws ZodError
 * Cards.v1.parse(v2Card) //=> throws ZodError
 *
 * // exception-free parsing
 * Cards.v1.safeParse(v1Card) // => return type { success: true; data: Cards.V1 }
 * Cards.v1.safeParse(v2CardWithV1FieldsBackfilled) //=> return type { success: true; data: Cards.V1 }
 * Cards.v1.safeParse(incorrectlyFormattedCard) //=> return type { success: false; error: ZodError }
 * Cards.v1.safeParse(v2Card) //=> return type { success: false; error: ZodError }
 * ```
 *
 * @category Zod parsers
 */
exports.v1 = zod_1.z.object({
    name: zod_1.z.coerce.string(),
    description: zod_1.z.coerce.string(),
    personality: zod_1.z.coerce.string(),
    scenario: zod_1.z.coerce.string(),
    first_mes: zod_1.z.coerce.string(),
    mes_example: zod_1.z.coerce.string(),
});
/**
 * A parser object made with the {@link https://www.npmjs.com/package/zod | zod} library which can be used to validate
 * or parse {@link CharacterBookEntry} objects, which are used inside the {@link V2} spec.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md>
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * // parsing
 * Cards.entry.parse(validEntry) //=> return type CharacterBookEntry
 * Cards.entry.parse(invalidEntry) //=> throws ZodError
 *
 * // exception-free parsing
 * Cards.entry.safeParse(validEntry) // => return type { success: true; data: CharacterBookEntry }
 * Cards.entry.safeParse(invalidEntry) //=> return type { success: false; error: ZodError }
 * ```
 *
 * @category Zod parsers
 */
exports.entry = zod_1.z.object({
    keys: zod_1.z.array(zod_1.z.coerce.string()), // Cast elements to strings in the array
    content: zod_1.z.coerce.string(),             // Cast to string
    extensions: zod_1.z.record(zod_1.z.any()),   // Allow any record
    enabled: zod_1.z.coerce.boolean(),            // Cast to boolean
    insertion_order: zod_1.z.coerce.number(),     // Cast to number
    case_sensitive: zod_1.z.coerce.boolean().optional(), // Optional boolean cast
    name: zod_1.z.coerce.string().optional(),            // Optional string cast
    priority: zod_1.z.coerce.number().optional(),        // Optional number cast
    id: zod_1.z.coerce.number().optional(),              // Optional number cast
    comment: zod_1.z.coerce.string().optional(),         // Optional string cast
    selective: zod_1.z.coerce.boolean().optional(),      // Optional boolean cast
    secondary_keys: zod_1.z.array(zod_1.z.coerce.string()).optional(), // Optional array of strings cast
    constant: zod_1.z.coerce.boolean().optional(),       // Optional boolean cast
    position: zod_1.z.union([
        zod_1.z.literal('before_char'),
        zod_1.z.literal('after_char'),
    ]).optional(),                                 // Keep union unchanged since it does not need coercion
});
/**
 * A parser object made with the {@link https://www.npmjs.com/package/zod | zod} library which can be used to validate
 * or parse {@link CharacterBook} objects, which are used inside the {@link V2} spec.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md>
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * // parsing
 * Cards.book.parse(validBook) //=> return type CharacterBook
 * Cards.book.parse(incorrectlyFormattedBook) //=> throws ZodError
 *
 * // exception-free parsing
 * Cards.book.safeParse(validBook) // => return type { success: true; data: CharacterBook }
 * Cards.book.safeParse(invalidBook) //=> return type { success: false; error: ZodError }
 * ```
 *
 * @category Zod parsers
 */
exports.book = zod_1.z.object({
    name: zod_1.z.coerce.string().optional(),
    description: zod_1.z.coerce.string().optional(),
    scan_depth: zod_1.z.coerce.number().optional(),
    token_budget: zod_1.z.coerce.number().optional(),
    recursive_scanning: zod_1.z.coerce.boolean().optional(),
    extensions: zod_1.z.record(zod_1.z.any()),
    entries: zod_1.z.array(exports.entry),
});
/**
 * A parser object made with the {@link https://www.npmjs.com/package/zod | zod} library which can be used to validate
 * or parse {@link V2 | Character Cards using the V2 spec}.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md>
 *
 * @example
 * ```
 * import * as Cards from 'character-card-utils'
 *
 * // parsing
 * Cards.v2.parse(v2Card) //=> return type V2
 * Cards.v2.parse(v2CardWithV1FieldsBackfilled) //=> return type V2
 * Cards.v2.parse(incorrectlyFormattedCard) //=> throws ZodError
 * Cards.v2.parse(v1Card) //=> throws ZodError
 *
 * // exception-free parsing
 * Cards.v1.safeParse(v1Card) // => return type { success: true; data: V2 }
 * Cards.v1.safeParse(v2CardWithV1FieldsBackfilled) //=> return type { success: true; data: V2 }
 * Cards.v1.safeParse(incorrectlyFormattedCard) //=> return type { success: false; error: ZodError }
 * Cards.v1.safeParse(v1Card) //=> return type { success: false; error: ZodError }
 * ```
 *
 * @category Zod parsers
 */
exports.v2 = zod_1.z.object({
    /** Identifier for the Character Card spec used. Can only be 'chara_card_v2'. */
    spec: zod_1.z.literal('chara_card_v2'),
    /** Non-breaking minor spec version. Expected to be '2.0' at this time. */
    spec_version: zod_1.z.coerce.string(),
    data: exports.v1.merge(zod_1.z.object({
        creator_notes: zod_1.z.coerce.string(),
        system_prompt: zod_1.z.coerce.string(),
        post_history_instructions: zod_1.z.coerce.string(),
        alternate_greetings: zod_1.z.array(zod_1.z.coerce.string()),
        character_book: exports.book.optional(),
        tags: zod_1.z.array(zod_1.z.coerce.string()),
        creator: zod_1.z.coerce.string(),
        character_version: zod_1.z.coerce.string(),
        extensions: zod_1.z.record(zod_1.z.any()),
    })),
});
/**
 * Same as {@link v2}, but specifically checks that the card also contains v1
 * fields backfilled. See typing {@link BackfilledV2}
 */
exports.backfilledV2 = exports.v1.merge(exports.v2);
