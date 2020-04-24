// This enables error messages on hover
import 'monaco-editor/esm/vs/editor/contrib/hover/hover'
import 'monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {WorkerProxyService} from './worker_proxy_service';
import './lexer_rules';
import {ID} from './constants';


export const language: monaco.languages.ILanguageExtensionPoint  = {
  id: ID,
};

const wps = new WorkerProxyService();


// @ts-ignore
window.MonacoEnvironment = {
  getWorkerUrl: (id, label) => {
    // In kibana we will probably build this once and then load with raw-loader
    return './public_dist/bundle.amd.worker.js';
  }
};

monaco.languages.register(language);
monaco.languages.onLanguage(ID, async () => {
  return wps.setup();
});

const OWNER = 'CONSOLE_GRAMMAR_CHECKER';
export const registerGrammarChecker = (editor: monaco.editor.IEditor) => {
  const allDisposables: Array<monaco.IDisposable> = [];

  const updateAnnos = async () => {
    const { annotations } = await wps.getAnnos();
    const model = editor.getModel() as monaco.editor.ITextModel;
    monaco.editor.setModelMarkers(model, OWNER, annotations.map(({at, text, type}) => {
      const { column, lineNumber } = model.getPositionAt(at);
      return {
        startLineNumber: lineNumber,
        startColumn: column,
        endLineNumber: lineNumber,
        endColumn: column,
        message: text,
        severity: type === 'error' ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
      }
    }));
  };

  const onModelAdd = (model: monaco.editor.IModel) => {
    allDisposables.push(model.onDidChangeContent(async () => {
      updateAnnos();
    }));

    updateAnnos();
  };

  allDisposables.push(monaco.editor.onDidCreateModel(onModelAdd));
  monaco.editor.getModels().forEach(onModelAdd);
  return () => {
    wps.stop();
    allDisposables.forEach(d => d.dispose());
  }
};


