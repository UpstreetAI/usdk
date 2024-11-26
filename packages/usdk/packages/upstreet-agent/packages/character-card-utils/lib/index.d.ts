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
import { z } from 'zod';
/**
 * A valid Character Card object following the V1 spec.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v1.md>
 *
 * ```
 * type V1 = {
 *  name: string
 *  description: string
 *  personality: string
 *  scenario: string
 *  first_mes: string
 *  mes_example: string
 * }
 * ```
 *
 * @category Typings
 */
export type V1 = z.infer<typeof v1>;
/**
 * A valid Character Card object following the {@link V2} spec.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md>
 *
 * ```
 * type V2 = {
 *   spec: 'chara_card_v2'
 *   spec_version: string
 *   data: {
 *     name: string
 *     description: string
 *     personality: string
 *     scenario: string
 *     first_mes: string
 *     mes_example: string
 *     extensions: Record<string, any>
 *     creator_notes: string
 *     system_prompt: string
 *     post_history_instructions: string
 *     alternate_greetings: string[]
 *     character_book?: CharacterBook
 *     tags: string[]
 *     creator: string
 *     character_version: string
 *     extensions: Record<string, any>
 *   }
 * }
 * ```
 *
 * @category Typings
 */
export type V2 = z.infer<typeof v2>;
/**
 * A valid Character Card object following the {@link V2} spec, with {@link V1} fields backfilled.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md>
 *
 * ```
 * type BackfilledV2 = {
 *   name: string
 *   description: string
 *   personality: string
 *   scenario: string
 *   first_mes: string
 *   mes_example: string
 *   spec: 'chara_card_v2'
 *   spec_version: string
 *   data: {
 *     name: string
 *     description: string
 *     personality: string
 *     scenario: string
 *     first_mes: string
 *     mes_example: string
 *     extensions: Record<string, any>
 *     creator_notes: string
 *     system_prompt: string
 *     post_history_instructions: string
 *     alternate_greetings: string[]
 *     character_book?: CharacterBook
 *     tags: string[]
 *     creator: string
 *     character_version: string
 *     extensions: Record<string, any>
 *   }
 * }
 * ```
 *
 * @category Typings
 */
export type BackfilledV2 = z.infer<typeof backfilledV2>;
/**
 * A valid Character Book object following the V2 spec.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md>
 *
 * ```
 * type CharacterBook = {
 *   name?: string
 *   description?: string
 *   scan_depth?: number
 *   token_budget?: number
 *   recursive_scanning?: boolean
 *   extensions: Record<string, any>
 *   entries: CharacterBookEntry[]
 * }
 * ```
 *
 * @category Typings
 */
export type CharacterBook = z.infer<typeof book>;
/**
 * A valid {@link CharacterBook} Entry object following the {@link V2} spec.
 *
 * <https://github.com/malfoyslastname/character-card-spec-v2/blob/main/spec_v2.md>
 *
 * ```
 * type CharacterBookEntry = {
 *   keys: string[]
 *   content: string
 *   extensions: Record<string, any>
 *   enabled: boolean
 *   insertion_order: number
 *   case_sensitive?: boolean
 *   name?: string
 *   priority?: number
 *   id?: number
 *   comment?: string
 *   selective?: boolean
 *   secondary_keys?: string[]
 *   constant?: boolean
 *   position?: 'before_char' | 'after_char'
 * }
 * ```
 *
 * @category Typings
 */
export type CharacterBookEntry = z.infer<typeof entry>;
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
export declare const parseToV2: (data: unknown) => V2;
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
export declare const safeParseToV2: (data: unknown) => z.SafeParseReturnType<V2, V2>;
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
export declare const v1ToV2: (v1Card: V1) => V2;
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
export declare const backfillV2: (v2Card: V2) => BackfilledV2;
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
export declare const backfillV2WithObsolescenceNotice: (v2Card: V2) => BackfilledV2;
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
export declare const v1: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    personality: z.ZodString;
    scenario: z.ZodString;
    first_mes: z.ZodString;
    mes_example: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
}, {
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
}>;
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
export declare const entry: z.ZodObject<{
    keys: z.ZodArray<z.ZodString, "many">;
    content: z.ZodString;
    extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
    enabled: z.ZodBoolean;
    insertion_order: z.ZodNumber;
    case_sensitive: z.ZodOptional<z.ZodBoolean>;
    name: z.ZodOptional<z.ZodString>;
    priority: z.ZodOptional<z.ZodNumber>;
    id: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
    selective: z.ZodOptional<z.ZodBoolean>;
    secondary_keys: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    constant: z.ZodOptional<z.ZodBoolean>;
    position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"before_char">, z.ZodLiteral<"after_char">]>>;
}, "strip", z.ZodTypeAny, {
    keys: string[];
    content: string;
    extensions: Record<string, any>;
    enabled: boolean;
    insertion_order: number;
    case_sensitive?: boolean | undefined;
    name?: string | undefined;
    priority?: number | undefined;
    id?: number | undefined;
    comment?: string | undefined;
    selective?: boolean | undefined;
    secondary_keys?: string[] | undefined;
    constant?: boolean | undefined;
    position?: "before_char" | "after_char" | undefined;
}, {
    keys: string[];
    content: string;
    extensions: Record<string, any>;
    enabled: boolean;
    insertion_order: number;
    case_sensitive?: boolean | undefined;
    name?: string | undefined;
    priority?: number | undefined;
    id?: number | undefined;
    comment?: string | undefined;
    selective?: boolean | undefined;
    secondary_keys?: string[] | undefined;
    constant?: boolean | undefined;
    position?: "before_char" | "after_char" | undefined;
}>;
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
export declare const book: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    scan_depth: z.ZodOptional<z.ZodNumber>;
    token_budget: z.ZodOptional<z.ZodNumber>;
    recursive_scanning: z.ZodOptional<z.ZodBoolean>;
    extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
    entries: z.ZodArray<z.ZodObject<{
        keys: z.ZodArray<z.ZodString, "many">;
        content: z.ZodString;
        extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
        enabled: z.ZodBoolean;
        insertion_order: z.ZodNumber;
        case_sensitive: z.ZodOptional<z.ZodBoolean>;
        name: z.ZodOptional<z.ZodString>;
        priority: z.ZodOptional<z.ZodNumber>;
        id: z.ZodOptional<z.ZodNumber>;
        comment: z.ZodOptional<z.ZodString>;
        selective: z.ZodOptional<z.ZodBoolean>;
        secondary_keys: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        constant: z.ZodOptional<z.ZodBoolean>;
        position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"before_char">, z.ZodLiteral<"after_char">]>>;
    }, "strip", z.ZodTypeAny, {
        keys: string[];
        content: string;
        extensions: Record<string, any>;
        enabled: boolean;
        insertion_order: number;
        case_sensitive?: boolean | undefined;
        name?: string | undefined;
        priority?: number | undefined;
        id?: number | undefined;
        comment?: string | undefined;
        selective?: boolean | undefined;
        secondary_keys?: string[] | undefined;
        constant?: boolean | undefined;
        position?: "before_char" | "after_char" | undefined;
    }, {
        keys: string[];
        content: string;
        extensions: Record<string, any>;
        enabled: boolean;
        insertion_order: number;
        case_sensitive?: boolean | undefined;
        name?: string | undefined;
        priority?: number | undefined;
        id?: number | undefined;
        comment?: string | undefined;
        selective?: boolean | undefined;
        secondary_keys?: string[] | undefined;
        constant?: boolean | undefined;
        position?: "before_char" | "after_char" | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    entries: {
        keys: string[];
        content: string;
        extensions: Record<string, any>;
        enabled: boolean;
        insertion_order: number;
        case_sensitive?: boolean | undefined;
        name?: string | undefined;
        priority?: number | undefined;
        id?: number | undefined;
        comment?: string | undefined;
        selective?: boolean | undefined;
        secondary_keys?: string[] | undefined;
        constant?: boolean | undefined;
        position?: "before_char" | "after_char" | undefined;
    }[];
    extensions: Record<string, any>;
    name?: string | undefined;
    description?: string | undefined;
    scan_depth?: number | undefined;
    token_budget?: number | undefined;
    recursive_scanning?: boolean | undefined;
}, {
    entries: {
        keys: string[];
        content: string;
        extensions: Record<string, any>;
        enabled: boolean;
        insertion_order: number;
        case_sensitive?: boolean | undefined;
        name?: string | undefined;
        priority?: number | undefined;
        id?: number | undefined;
        comment?: string | undefined;
        selective?: boolean | undefined;
        secondary_keys?: string[] | undefined;
        constant?: boolean | undefined;
        position?: "before_char" | "after_char" | undefined;
    }[];
    extensions: Record<string, any>;
    name?: string | undefined;
    description?: string | undefined;
    scan_depth?: number | undefined;
    token_budget?: number | undefined;
    recursive_scanning?: boolean | undefined;
}>;
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
export declare const v2: z.ZodObject<{
    /** Identifier for the Character Card spec used. Can only be 'chara_card_v2'. */
    spec: z.ZodLiteral<"chara_card_v2">;
    /** Non-breaking minor spec version. Expected to be '2.0' at this time. */
    spec_version: z.ZodString;
    data: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        personality: z.ZodString;
        scenario: z.ZodString;
        first_mes: z.ZodString;
        mes_example: z.ZodString;
        creator_notes: z.ZodString;
        system_prompt: z.ZodString;
        post_history_instructions: z.ZodString;
        alternate_greetings: z.ZodArray<z.ZodString, "many">;
        character_book: z.ZodOptional<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            scan_depth: z.ZodOptional<z.ZodNumber>;
            token_budget: z.ZodOptional<z.ZodNumber>;
            recursive_scanning: z.ZodOptional<z.ZodBoolean>;
            extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
            entries: z.ZodArray<z.ZodObject<{
                keys: z.ZodArray<z.ZodString, "many">;
                content: z.ZodString;
                extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
                enabled: z.ZodBoolean;
                insertion_order: z.ZodNumber;
                case_sensitive: z.ZodOptional<z.ZodBoolean>;
                name: z.ZodOptional<z.ZodString>;
                priority: z.ZodOptional<z.ZodNumber>;
                id: z.ZodOptional<z.ZodNumber>;
                comment: z.ZodOptional<z.ZodString>;
                selective: z.ZodOptional<z.ZodBoolean>;
                secondary_keys: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                constant: z.ZodOptional<z.ZodBoolean>;
                position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"before_char">, z.ZodLiteral<"after_char">]>>;
            }, "strip", z.ZodTypeAny, {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }, {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        }, {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        }>>;
        tags: z.ZodArray<z.ZodString, "many">;
        creator: z.ZodString;
        character_version: z.ZodString;
        extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        extensions: Record<string, any>;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        alternate_greetings: string[];
        tags: string[];
        creator: string;
        character_version: string;
        character_book?: {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        } | undefined;
    }, {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        extensions: Record<string, any>;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        alternate_greetings: string[];
        tags: string[];
        creator: string;
        character_version: string;
        character_book?: {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        extensions: Record<string, any>;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        alternate_greetings: string[];
        tags: string[];
        creator: string;
        character_version: string;
        character_book?: {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        } | undefined;
    };
    spec: "chara_card_v2";
    spec_version: string;
}, {
    data: {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        extensions: Record<string, any>;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        alternate_greetings: string[];
        tags: string[];
        creator: string;
        character_version: string;
        character_book?: {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        } | undefined;
    };
    spec: "chara_card_v2";
    spec_version: string;
}>;
/**
 * Same as {@link v2}, but specifically checks that the card also contains v1
 * fields backfilled. See typing {@link BackfilledV2}
 */
export declare const backfilledV2: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    personality: z.ZodString;
    scenario: z.ZodString;
    first_mes: z.ZodString;
    mes_example: z.ZodString;
    spec: z.ZodLiteral<"chara_card_v2">;
    spec_version: z.ZodString;
    data: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        personality: z.ZodString;
        scenario: z.ZodString;
        first_mes: z.ZodString;
        mes_example: z.ZodString;
        creator_notes: z.ZodString;
        system_prompt: z.ZodString;
        post_history_instructions: z.ZodString;
        alternate_greetings: z.ZodArray<z.ZodString, "many">;
        character_book: z.ZodOptional<z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            scan_depth: z.ZodOptional<z.ZodNumber>;
            token_budget: z.ZodOptional<z.ZodNumber>;
            recursive_scanning: z.ZodOptional<z.ZodBoolean>;
            extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
            entries: z.ZodArray<z.ZodObject<{
                keys: z.ZodArray<z.ZodString, "many">;
                content: z.ZodString;
                extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
                enabled: z.ZodBoolean;
                insertion_order: z.ZodNumber;
                case_sensitive: z.ZodOptional<z.ZodBoolean>;
                name: z.ZodOptional<z.ZodString>;
                priority: z.ZodOptional<z.ZodNumber>;
                id: z.ZodOptional<z.ZodNumber>;
                comment: z.ZodOptional<z.ZodString>;
                selective: z.ZodOptional<z.ZodBoolean>;
                secondary_keys: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                constant: z.ZodOptional<z.ZodBoolean>;
                position: z.ZodOptional<z.ZodUnion<[z.ZodLiteral<"before_char">, z.ZodLiteral<"after_char">]>>;
            }, "strip", z.ZodTypeAny, {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }, {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        }, {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        }>>;
        tags: z.ZodArray<z.ZodString, "many">;
        creator: z.ZodString;
        character_version: z.ZodString;
        extensions: z.ZodRecord<z.ZodString, z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        extensions: Record<string, any>;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        alternate_greetings: string[];
        tags: string[];
        creator: string;
        character_version: string;
        character_book?: {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        } | undefined;
    }, {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        extensions: Record<string, any>;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        alternate_greetings: string[];
        tags: string[];
        creator: string;
        character_version: string;
        character_book?: {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    data: {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        extensions: Record<string, any>;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        alternate_greetings: string[];
        tags: string[];
        creator: string;
        character_version: string;
        character_book?: {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        } | undefined;
    };
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    spec: "chara_card_v2";
    spec_version: string;
}, {
    data: {
        name: string;
        description: string;
        personality: string;
        scenario: string;
        first_mes: string;
        mes_example: string;
        extensions: Record<string, any>;
        creator_notes: string;
        system_prompt: string;
        post_history_instructions: string;
        alternate_greetings: string[];
        tags: string[];
        creator: string;
        character_version: string;
        character_book?: {
            entries: {
                keys: string[];
                content: string;
                extensions: Record<string, any>;
                enabled: boolean;
                insertion_order: number;
                case_sensitive?: boolean | undefined;
                name?: string | undefined;
                priority?: number | undefined;
                id?: number | undefined;
                comment?: string | undefined;
                selective?: boolean | undefined;
                secondary_keys?: string[] | undefined;
                constant?: boolean | undefined;
                position?: "before_char" | "after_char" | undefined;
            }[];
            extensions: Record<string, any>;
            name?: string | undefined;
            description?: string | undefined;
            scan_depth?: number | undefined;
            token_budget?: number | undefined;
            recursive_scanning?: boolean | undefined;
        } | undefined;
    };
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    spec: "chara_card_v2";
    spec_version: string;
}>;
