import * as worker from 'monaco-editor/esm/vs/editor/editor.worker'
import { ConsoleWorker } from './console_worker'

self.onmessage = () => {
  worker.initialize((ctx: any, createData: any) => {
    return new ConsoleWorker(ctx)
  })
}
