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
    "test": "something"
}`)
})()
