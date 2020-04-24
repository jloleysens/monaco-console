import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {ID} from './constants';

const globals = {
  keywords: [
    'abstract', 'continue', 'for', 'new', 'switch', 'assert', 'goto', 'do',
    'if', 'private', 'this', 'break', 'protected', 'throw', 'else', 'public',
    'enum', 'return', 'catch', 'try', 'interface', 'static', 'class',
    'finally', 'const', 'super', 'while', 'true', 'false'
  ],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
}

const lexerRules: monaco.languages.IMonarchLanguage = ({
  ...globals as any,

  // operators: [
  //   '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=',
  //   '&&', '||', '++', '--', '+', '-', '*', '/', '&', '|', '^', '%',
  //   '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=',
  //   '%=', '<<=', '>>=', '>>>='
  // ],

  // we include these common regular expressions

  // C# style strings

  // The main tokenizer for our languages
  tokenizer: {
    root: [
      ['#!.*$' as any, 'warning'],
      [/^#.*$/, 'comment'],
      // identifiers and keywords
      // [/[a-z_$][\w$]*/, {
      //   cases: {
      //     '@method': 'keyword',
      //     '@keywords': 'keyword',
      //     '@default': 'identifier'
      //   }
      // }],
      [/[a-zA-Z]+/, {token: 'type.identifier', next: 'method_sep', log: 'method token $0'}],

      // whitespace
      {include: '@whitespace'},

      // delimiters and operators
      [/[{}()\[\]]/, '@brackets'],
      [/@symbols/, {
        cases: {
          '@default': ''
        }
      }],

      // @ annotations.
      // As an example, we emit a debugging log message on these tokens.
      // Note: message are supressed during the first load -- change some lines to see them.
      [/@\s*[a-zA-Z_\$][\w\$]*/, {token: 'annotation', log: 'annotation token: $0'}],

      // numbers
      [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
      [/0[xX][0-9a-fA-F]+/, 'number.hex'],
      [/\d+/, 'number'],

      // delimiter: after number because of .\d floats
      [/[;,.]/, 'delimiter'],

      // strings
      [/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
      [/"/, {token: 'string.quote', bracket: '@open', next: '@string'}],

      // characters
      [/'[^\\']'/, 'string'],
      [/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
      [/'/, 'string.invalid']
    ],

    method_sep: [
      [/\s+/, {token: 'whitespace', log: 'whitespace token $0'}],
      [/(https?:\/\/[^?\/,]+)/, { token: 'url.protocol_host', log: 'https token $0' }],
      [/\//, {token: 'url.slash', log: 'anno token $0', next: 'url'}],
    ],

    url: [
      [/[^?\/,\s]+/, { token: 'url.part', log: 'url.part token $0' }],
      [/,/, { token: 'url.comma', log: 'url.comma token $0' }],
      [/\//, {token: 'url.slash', log: 'anno token $0', next: 'url'}],
    ],

    // maybe_schema: [
    //   {}
    //   []
    //   { regex  }
    // ] ,

    comment: [
      [/[^\/*]+/, 'comment'],
      [/\/\*/, 'comment', '@push'],    // nested comment
      ["\\*/" as any, 'comment', '@pop'],
      [/[\/*]/, 'comment']
    ],

    string: [
      [/[^\\"]+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/"/, {token: 'string.quote', bracket: '@close', next: '@pop'}]
    ],

    whitespace: [
      [/[ \t\r\n]+/, 'whitespace'],
    ],
  },
});

monaco.languages.setMonarchTokensProvider(ID, lexerRules);