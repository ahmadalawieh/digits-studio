import {build} from 'esbuild';
import {mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

await mkdir('qa/editorial-build', {recursive: true});
await build({
  entryPoints: ['src/editorial-entry.jsx'], bundle: true, minify: true,
  outfile: 'dist/assets/editorial-motion.js', format: 'iife', target: ['es2020'],
  jsx: 'automatic', define: {'process.env.NODE_ENV': '"production"'}, legalComments: 'linked',
});
await build({
  entryPoints: ['src/render-editorial.jsx'], bundle: true, platform: 'node',
  outfile: 'qa/editorial-build/render.cjs', format: 'cjs', packages: 'external', jsx: 'automatic',
});
execFileSync(process.execPath, ['qa/editorial-build/render.cjs'], {stdio: 'inherit'});
await writeFile('dist/assets/editorial-motion-NOTICE.txt',
  'Framer Motion, React and React DOM are locally bundled for the editorial UI.\n' +
  'Original notices are retained in editorial-motion.js.LEGAL.txt; full licence texts are in editorial-motion-LICENSES.txt.\n' +
  'Sources: https://github.com/motiondivision/motion and https://github.com/facebook/react\n');
let licences='';
for(const dependency of ['react','react-dom','scheduler','framer-motion','motion-dom','motion-utils']){
  const directory='node_modules/'+dependency;
  const filename=(await readdir(directory)).find(name=>/^licen[cs]e(\.|$)/i.test(name));
  if(!filename)throw Error('Missing dependency licence: '+dependency);
  licences+='\n'+dependency+'\n'+(await readFile(directory+'/'+filename,'utf8'))+'\n';
}
await writeFile('dist/assets/editorial-motion-LICENSES.txt',licences);
console.log('Editorial motion bundle generated.');
