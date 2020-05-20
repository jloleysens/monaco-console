import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

const ID = 'xjson'

import './painless'
import './esql'

import { globals } from './shared'

export const lexerRules: monaco.languages.IMonarchLanguage = {
  ...(globals as any),

  defaultToken: 'invalid',

  tokenizer: {
    whitespace: [[/[ \t\r\n]+/, { token: 'whitespace' }]],

    root: [
      [
        /("(?:[^"]*_)?script"|"inline"|"source")(\s*?)(:)(\s*?)(""")/,
        [
          'variable',
          'whitespace',
          'ace.punctuation.colon',
          'whitespace',
          {
            token: 'punctuation.start_triple_quote',
            nextEmbedded: 'painless',
            next: 'my_painless',
          },
        ],
      ],

      [
        /(:)(\s*?)(""")(sql)/,
        [
          'ace.punctuation.colon',
          'whitespace',
          'punctuation.start_triple_quote',
          {
            token: 'punctuation.start_triple_quote.lang_marker',
            nextEmbedded: 'esql',
            next: 'my_sql',
          },
        ],
      ],

      [/{/, { token: 'paren.lparen', next: '@push' }],
      [/}/, { token: 'paren.rparen', next: '@pop' }],
      [/[[(]/, { token: 'paren.lparen' }],
      [/[\])]/, { token: 'paren.rparen' }],
      [/,/, { token: 'punctuation.comma' }],
      [/:/, { token: 'punctuation.colon' }],
      [/\s+/, { token: 'whitespace' }],
      [/["](?:(?:\\.)|(?:[^"\\]))*?["]\s*(?=:)/, { token: 'variable' }],
      [/"""/, { token: 'string_literal', next: 'string_literal' }],
      [/0[xX][0-9a-fA-F]+\b/, { token: 'constant.numeric' }],
      [
        /[+-]?\d+(?:(?:\.\d*)?(?:[eE][+-]?\d+)?)?\b/,
        { token: 'constant.numeric' },
      ],
      [/(?:true|false)\b/, { token: 'constant.language.boolean' }],
      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
      [
        /"/,
        {
          token: 'string.quote',
          bracket: '@open',
          next: '@string',
        },
      ],

      [/['](?:(?:\\.)|(?:[^'\\]))*?[']/, { token: 'invalid' }],
      [/.+?/, { token: 'text' }],
      [/\/\/.*$/, { token: 'invalid' }],
    ],

    my_painless: [
      [
        /"""/,
        {
          token: 'punctuation.end_triple_quote',
          nextEmbedded: '@pop',
          next: '@pop',
        },
      ],
    ],

    my_sql: [
      [
        /"""/,
        {
          token: 'punctuation.end_triple_quote',
          nextEmbedded: '@pop',
          next: '@pop',
        },
      ],
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    string_literal: [
      [/"""/, { token: 'punctuation.end_triple_quote', next: '@pop' }],
      [/./, { token: 'multi_string' }],
    ],
  },
}

monaco.languages.setMonarchTokensProvider(ID, lexerRules)
monaco.languages.register({
  id: ID,
})
