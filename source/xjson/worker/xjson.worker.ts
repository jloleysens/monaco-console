import * as worker from 'monaco-editor/esm/vs/editor/editor.worker'
import { XJsonWorker } from './xjson_worker'

self.onmessage = () => {
  worker.initialize((ctx: any, createData: any) => {
    return new XJsonWorker(ctx)
  })
}
