import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const src = path.join(root, 'dist-singlefile', 'index.html');
const publicDescargas = path.join(root, 'public', 'descargas');
const distDescargas = path.join(root, 'dist', 'descargas');

if (!fs.existsSync(publicDescargas)) fs.mkdirSync(publicDescargas, { recursive: true });
if (!fs.existsSync(distDescargas)) fs.mkdirSync(distDescargas, { recursive: true });

if (fs.existsSync(src)) {
  fs.copyFileSync(src, path.join(publicDescargas, 'index.html'));
  fs.copyFileSync(src, path.join(distDescargas, 'index.html'));
  fs.copyFileSync(src, path.join(root, 'dist', 'index-standalone.html'));
  console.log('✅ Archivo index.html autónomo copiado correctamente en public/descargas/ y dist/');
} else {
  console.warn('⚠️ No se encontró dist-singlefile/index.html');
}
