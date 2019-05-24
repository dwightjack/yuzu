const documentation = require('documentation');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const ts = require('typescript');
const mkdir = require('make-dir');
const glob = require('fast-glob');
const rimraf = require('rimraf');
const cpy = require('cpy');

const writeAsync = promisify(fs.writeFile);
const readAsync = promisify(fs.readFile);

const root = path.join(__dirname, '..', 'packages');
const docs = path.join(__dirname, '..', 'docs');
const src = path.join(__dirname, '..', '.docs');
const packages = fs
  .readdirSync(root)
  .filter((item) => fs.lstatSync(path.join(root, item)).isDirectory());

packages.forEach(async (package) => {
  const baseFolder = path.join(root, package);
  const docsFolder = path.join(baseFolder, 'docs');
  const dest = path.join(docs, 'packages', package);
  const destApi = path.join(dest, 'api');
  const tmp = path.join(baseFolder, 'tmp');
  const pkg = require(path.join(baseFolder, 'package.json'));

  rimraf.sync(dest);
  rimraf.sync(tmp);

  await mkdir(dest);
  await mkdir(destApi);
  await mkdir(tmp);

  //copy some files
  await cpy(['**/*.*'], docs, {
    parents: true,
    dot: true,
    cwd: src,
  });
  if (!fs.existsSync(docsFolder)) {
    await cpy(['README.md', 'images/**/*.*'], dest, {
      parents: true,
      cwd: baseFolder,
    });
    console.log('-> Base documentation copied!');
  } else {
    await cpy(['**/*.*'], dest, {
      parents: true,
      cwd: docsFolder,
    });
    console.log('-> Documentation files copied!');
  }

  //add the version number to the main readme
  const readmeFile = path.join(dest, 'README.md');
  const readmeSrc = await readAsync(readmeFile, 'utf8');
  writeAsync(
    readmeFile,
    readmeSrc.replace(/^(# .+)/, `$1 <sub>${pkg.version}<sub>`),
    'utf8',
  );

  // generate API
  let files = await glob('src/*.ts', {
    cwd: baseFolder,
    absolute: true,
  });

  let moduleLinks = '';

  if (package !== 'utils' && files.length > 1) {
    files = files.filter((f) => !/index(|\.umd)\.ts$/.test(f));
    moduleLinks = files
      .map((f) => {
        const base = path.basename(f, '.ts');
        return ` - [${base}](packages/${package}/api/${base})`;
      })
      .join('\n');
  }

  //create a readme
  const readme = `
# ${pkg.name}

### Exposed modules

${moduleLinks}
`.trim();

  await writeAsync(path.join(destApi, 'README.md'), readme, 'utf8');

  // create a custom sidebar
  const sidebar = await readAsync(path.join(docs, '_sidebar.md'), 'utf8');
  await writeAsync(
    path.join(destApi, '_sidebar.md'),
    sidebar.replace(`<!-- ${pkg.name} -->`, moduleLinks.trim()),
    'utf8',
  );

  const renders = files.map(async (file) => {
    const basename = path.basename(file, '.ts');
    const tmppath = path.join(tmp, `${basename}.js`);
    const filepath = path.join(destApi, `${basename}.md`);

    const src = await readAsync(file, 'utf8');
    const { outputText } = ts.transpileModule(src, {
      compilerOptions: {
        module: ts.ModuleKind.ES2015,
        target: ts.ScriptTarget.ESNext,
        removeComments: false,
      },
    });

    try {
      await writeAsync(tmppath, outputText, 'utf8');
      const raw = await documentation.build(tmppath, {
        shallow: true,
      });

      if (raw[0] && raw[0].members) {
        raw[0].members.static.forEach((m) => {
          m.name = `<static> ${m.name}`;
        });
      }

      let output = await documentation.formats.md(raw);

      if (package === 'utils' && !file.includes('events')) {
        output = output.replace(/^##/m, '#');
      } else {
        output = output.replace(/^##/gm, '#');
        output = output.replace(/^## Parameters/gm, '### Parameters');
      }

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
