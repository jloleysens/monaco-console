import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ID } from '../constants'

import { lexerRules as xjson } from './xjson'

import { globals } from './shared'

export function addEOL(
  reg: RegExp,
  actions: monaco.languages.IExpandedMonarchLanguageAction[],
  nextIfEOL: string
) {
  return [
    [
      reg,
      actions.map((action) => ({
        cases: {
          '@eos': { ...action, switchTo: nextIfEOL },
          '@default': action,
        },
      })),
    ],
  ]
}

const lexerRules: monaco.languages.IMonarchLanguage = {
  ...(globals as any),

  defaultToken: 'invalid',

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      [/^#!.*$/ as any, 'warning'],
      [/^#.*$/, 'comment'],
      [
        /(GET|PUT|POST|HEAD|DELETE)/,
        [
          {
            token: 'type.identifier',
            switchTo: 'methodSep',
          },
        ],
      ],

      [
        /{/,
        {
          token: '@bracket',
          next: 'xjson',
        },
      ],
      [/}/, { token: '@close', next: '@pop' }],

      // whitespace
      { include: '@whitespace' },
    ],

    methodSep: [
      ...addEOL(
        /(https?:\/\/[^?\/,]+)/,
        [{ token: 'url.protocol_host' }],
        'root'
      ),
      ...addEOL(/(\/)/, [{ token: 'url.slash', switchTo: 'url' }], 'root'),
      ...addEOL(/(\s+)/, [{ token: 'whitespace', switchTo: 'url' }], 'root'),
    ],

    url: [
      ...addEOL(/([^?\/,\s]+)/, [{ token: 'url.part' }], 'root'),
      ...addEOL(/(,)/, [{ token: 'url.comma' }], 'root'),
      ...addEOL(/(\/)/, [{ token: 'url.slash' }], 'root'),
      ...addEOL(
        /(\?)/,
        [
          {
            token: 'url.questionmark',
            next: 'urlParams',
          },
        ],
        'root'
      ),
    ],

    xjson: xjson.tokenizer.root,
    string_literal: xjson.tokenizer.string_literal,
    string: xjson.tokenizer.string,
    my_painless: xjson.tokenizer.my_painless,
    my_sql: xjson.tokenizer.my_sql,

    urlParams: [
      ...addEOL(
        /([^&=]+)(=)([^&]*)/,
        [
          { token: 'url.param' },
          { token: 'url.equal' },
          { token: 'url.value' },
        ],
        'root'
      ),
      ...addEOL(/([a-zA-Z0-9]+)/, [{ token: 'url.param' }], 'root'),
      ...addEOL(/(&)/, [{ token: 'url.amp' }], 'root'),
    ],

    whitespace: [[/[ \t\r\n]+/, { token: 'whitespace' }]],
  },
}

monaco.languages.register({ id: ID })
monaco.languages.setMonarchTokensProvider(ID, lexerRules)
monaco.languages.setLanguageConfiguration(ID, {
  brackets: [
    ['{', '}'],
    ['[', ']'],
  ],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '"', close: '"' },
  ],
})
