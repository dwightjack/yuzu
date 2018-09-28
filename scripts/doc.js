const documentation = require('documentation');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const ts = require('typescript');
const mkdir = require('make-dir');
const glob = require('fast-glob');
const rimraf = require('rimraf');

const writeAsync = promisify(fs.writeFile);
const readAsync = promisify(fs.readFile);

const root = path.join(__dirname, '..', 'packages');
const docs = path.join(__dirname, '..', 'docs');
const packages = fs.readdirSync(root);

packages.forEach(async (package) => {
  const baseFolder = path.join(root, package);
  const dest = path.join(docs, 'packages', package);
  const destApi = path.join(dest, 'api');
  const tmp = path.join(baseFolder, 'tmp');

  rimraf.sync(dest);
  rimraf.sync(tmp);

  await mkdir(dest);
  await mkdir(destApi);
  await mkdir(tmp);

  //copy the README
  const localReadme = path.join(baseFolder, 'README.md');
  if (fs.existsSync(localReadme)) {
    const contents = await readAsync(localReadme, 'utf8');
    await writeAsync(path.join(dest, 'README.md'), contents, 'utf8');
  }

  // generate API
  let files = await glob('src/*.ts', {
    cwd: baseFolder,
    absolute: true,
  });

  if (files.length > 1) {
    files = files.filter((f) => !f.endsWith('index.ts'));
  }

  //write sidebar

  const renders = files.map(async (file) => {
    const basename = path.basename(file, '.ts');
    const tmppath = path.join(tmp, `${basename}.js`);
    const filepath = path.join(destApi, `${basename}.md`);

    const src = await readAsync(file, 'utf8');
    const { outputText } = ts.transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.ES2015,
        target: ts.ScriptTarget.ESNext,
      },
    });

    try {
      await writeAsync(tmppath, outputText, 'utf8');
      const raw = await documentation.build(tmppath, {
        shallow: true,
      });

      const output = await documentation.formats.md(raw);
      await writeAsync(filepath, output);
      console.log(`-> File ${filepath} generated.`);
    } catch (e) {
      console.error(e);
    }
  });

  await Promise.all(renders);
  rimraf.sync(tmp);
  console.log(`Documentation build complete for ${package}!`);
});
