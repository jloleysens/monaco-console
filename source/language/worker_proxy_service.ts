import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {ConsoleWorker} from './worker';
import {AnnoTypes} from './grammar';

export interface Annotation {
  name?: string;
  type: AnnoTypes;
  text: string;
  at: number;
}

export interface AnnotationsResponse {
  annotations: Annotation[];
}

export class WorkerProxyService {
  private worker: monaco.editor.MonacoWebWorker<ConsoleWorker> | undefined;

  public async getAnnos(): Promise<AnnotationsResponse> {
    if (!this.worker) {
      throw new Error('Worker Proxy Service has not been setup!');
    }
    await this.worker.withSyncedResources(monaco.editor.getModels().map(({uri}) => uri));
    const proxy = await this.worker.getProxy();
    return proxy.parse();
  }

  public setup() {
    this.worker = monaco.editor.createWebWorker({
      moduleId: '',
      label: 'console',
      keepIdleModels: true,
    });
  }

  public stop() {
    this.worker.dispose();
  }
}