import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// process.cwd() is the package root when run via npm scripts
const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');

type Target = 'firefox' | 'chromium';

function clean() {
  fs.rmSync(DIST, { recursive: true, force: true });
}

function copyFile(src: string, dest: string) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

async function buildTarget(target: Target) {
  const outDir = path.join(DIST, target);
  fs.mkdirSync(outDir, { recursive: true });

  // Bundle popup.ts and options.ts
  await esbuild.build({
    entryPoints: [
      path.join(ROOT, 'src', 'popup.ts'),
      path.join(ROOT, 'src', 'options.ts'),
    ],
    bundle: true,
    outdir: outDir,
    platform: 'browser',
    target: 'es2020',
    format: 'iife',
    minify: true,
  });

  // Copy HTML files
  copyFile(path.join(ROOT, 'popup.html'), path.join(outDir, 'popup.html'));
  copyFile(path.join(ROOT, 'options.html'), path.join(outDir, 'options.html'));

  // Copy manifest
  const manifestSrc = path.join(ROOT, `manifest.${target}.json`);
  const manifestDest = path.join(outDir, 'manifest.json');
  fs.copyFileSync(manifestSrc, manifestDest);

  // Copy icons
  copyDir(path.join(ROOT, 'icons'), path.join(outDir, 'icons'));

  // Zip
  const zipName = `${target}.zip`;
  execSync(`cd "${outDir}" && zip -r "../${zipName}" .`, { stdio: 'inherit' });

  console.log(`Built dist/${target}/ and dist/${zipName}`);
}

async function main() {
  clean();
  await Promise.all([buildTarget('firefox'), buildTarget('chromium')]);
  console.log('Build complete.');
}

main().catch(err => { console.error(err); process.exit(1); });
