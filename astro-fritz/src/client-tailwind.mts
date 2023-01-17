import fritz from 'fritz/window';

if((import.meta as any).env.DEV) {
  let exp = /\! tailwindcss/;
  for(let style of document.querySelectorAll('style[data-vite-dev-id]')) {
    if(exp.test(style.textContent ?? '')) {
      fritz.adopt(style as HTMLStyleElement);
      break;
    }
  }
}