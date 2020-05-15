import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ID } from './constants'

const globals = {
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
}

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
      [/#!.*$/ as any, 'warning'],
      [/^#.*$/, 'comment'],
      [
        /(GET|PUT|POST|HEAD|DELETE)/,
        [
          {
            token: 'type.identifier',
            log: 'method token $0',
            switchTo: 'methodSep',
          },
        ],
      ],

      [/{/, { token: '@bracket', next: 'xjson' }],
      [/}/, { token: '@bracket' }],

      // whitespace
      { include: '@whitespace' },

      // delimiters and operators
      // [/[{}\[\]]/, '@brackets'],

      // @ annotations.
      // As an example, we emit a debugging log message on these tokens.
      // Note: message are supressed during the first load -- change some lines to see them.
      [
        /@\s*[a-zA-Z_\$][\w\$]*/,
        { token: 'annotation', log: 'annotation token: $0' },
      ],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

      // characters
      [/'[^\\']'/, 'string'],
      [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
      [/'/, 'string.invalid'],
    ],

    methodSep: [
      ...addEOL(
        /(\s+)/,
        [{ token: 'whitespace', log: 'whitespace token $0' }],
        'root'
      ),
      ...addEOL(
        /(https?:\/\/[^?\/,]+)/,
        [{ token: 'url.protocol_host', log: 'https token $0' }],
        'root'
      ),
      ...addEOL(
        /(\/)/,
        [{ token: 'url.slash', log: 'url.slash token $0', switchTo: 'url' }],
        'root'
      ),
    ],

    url: [
      ...addEOL(
        /([^?\/,\s]+)/,
        [{ token: 'url.part', log: 'url.part token $0' }],
        'root'
      ),
      ...addEOL(
        /(,)/,
        [{ token: 'url.comma', log: 'url.comma token $0' }],
        'root'
      ),
      ...addEOL(
        /(\/)/,
        [{ token: 'url.slash', log: 'url.slash token $0' }],
        'root'
      ),
      ...addEOL(
        /(\?)/,
        [
          {
            token: 'url.questionmark',
            log: 'url.questionmark token $0',
            next: 'urlParams',
          },
        ],
        'root'
      ),
    ],

    urlParams: [
      ...addEOL(
        /([^&=]+)(=)([^&]*)/,
        [
          { token: 'url.param', log: 'url.param token $1' },
          { token: 'url.equal', log: 'url.equal token $2' },
          { token: 'url.value', log: 'ok', switchTo: 'root' },
        ],
        'root'
      ),
      ...addEOL(
        /([a-zA-Z0-9]+)/,
        [{ token: 'url.param', log: 'url.param token $0' }],
        'root'
      ),
      ...addEOL(/(&)/, [{ token: 'url.amp', log: 'url.amp token $0' }], 'root'),
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
    ],

    whitespace: [
      [/[ \t\r\n]+/, { token: 'whitespace', log: 'whitespace token $0' }],
    ],

    xjson: [
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
      [/['](?:(?:\\.)|(?:[^'\\]))*?[']/, { token: 'invalid' }],
      [/.+?/, { token: 'text' }],
      [/\/\/.*$/, { token: 'invalid' }],
    ],

    string_literal: [
      [
        /"""/,
        { token: 'punctuation.end_triple_quote', next: '@pop', log: 'test' },
      ],
      [/./, { token: 'multi_string' }],
    ],
  },
}

monaco.languages.setMonarchTokensProvider(ID, lexerRules)
