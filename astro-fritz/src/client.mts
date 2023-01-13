import fritz from 'fritz/window';
import { IMPORT, type ImportMessage } from './messages.mjs';

const worker = new Worker(new URL('astro-fritz/worker', import.meta.url), {
  type: 'module'
});

fritz.use(worker);

export default () => (metadata: any) => {
  let msg: ImportMessage = {
    type: IMPORT,
    url: metadata.url
  }
  worker.postMessage(msg);
};

class WorkerURL {
  public url;
  constructor(url: URL) {
    if((import.meta as any).env.PROD) {
      this.url = url.toString();
    } else {
      this.url = url.toString() + '?fritz-worker';
    }
  }
}

export {
  WorkerURL as Worker
};