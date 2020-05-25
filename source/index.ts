import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ID, registerGrammarChecker } from './xjson'
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

  // To get the tokens on a line efficiently we use some of monacos internals
  function getTokensAtLine(model, lineNumber) {
    // Force line's state to be accurate
    model.getLineTokens(lineNumber, /*inaccurateTokensAcceptable*/ false)
    // Get the tokenization state at the beginning of this line
    var freshState = model._tokenization._tokenizationStateStore._beginState[
      lineNumber - 1
    ].clone()
    // Get the human readable tokens on this line
    return model._tokenization._tokenizationSupport.tokenize(
      model.getLineContent(lineNumber),
      freshState,
      0
    ).tokens
  }

  // Watch tokens on line 9
  editor.getModel()!.onDidChangeContent(() => {
    var tokens = getTokensAtLine(editor.getModel(), 9)
    console.log(tokens)
  })
})()
