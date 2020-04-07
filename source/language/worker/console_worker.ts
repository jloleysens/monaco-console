import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {createParser} from '../grammar';

export class ConsoleWorker {
  constructor(private ctx: monaco.worker.IWorkerContext) {
  }
  private parser: any;

  async parse() {
    if (!this.parser) {
      this.parser = createParser();
    }
    const [model] = this.ctx.getMirrorModels();
    return this.parser(model.getValue())
  }
}
