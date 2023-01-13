import { IMPORT, type ImportMessage } from './messages.mjs';

addEventListener('message', ev => {
  if(ev.data?.type === IMPORT) {
    const data = ev.data as ImportMessage;
    import(data.url);
  }
});