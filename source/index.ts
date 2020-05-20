import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ID, registerGrammarChecker } from './language'
;(function setup() {
  const editorElement = document.querySelector<HTMLDivElement>('#my-editor')
  const editor = monaco.editor.create(editorElement, {
    language: ID,
    theme: 'vs',
  })
  registerGrammarChecker(editor)
  editor.getModel()!.setValue(`# A comment
POST /asd?test&a=b
{
    "test": "something",
    "test": "something",
    "test": "something",
    "test": "something",
    "test1": {
        "script": """ if while true false 1 24 5 """
    },
    "test_another": 123,
    "query": """sql
    select * from 'home'
    """,
    "query2": 123
}`)
})()
