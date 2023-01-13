import fs from 'node:fs';

const root = new URL('../', import.meta.url);

fs.mkdirSync(new URL('types', root), { recursive: true });

function moveIfExists(name) {
  try {
    fs.renameSync(new URL(name, root), new URL(`types/${name}`, root), { recursive: true });
  } catch {}
}

[
  'message-types.d.ts',
  'types.d.ts',
  'util.d.ts',
].forEach(moveIfExists);

moveIfExists('node');
moveIfExists('worker');
moveIfExists('window');