const documentation = require('documentation');
const path = require('path');
const fs = require('fs');
const glob = require('fast-glob');

const dest = path.resolve(__dirname, '..', 'doc');

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest);
}

glob
  .sync('es/*.js', {
    cwd: path.resolve(__dirname, '..'),
    absolute: true,
    ignore: ['es/index.js'],
  })
  .forEach((file) => {
    const filename = file
      .split('/')
      .pop()
      .replace('.js', '.md');

    documentation
      .build(file, {
        shallow: true,
      })
      .then(documentation.formats.md)
      .then((output) => {
        // output is a string of Markdown data
        fs.writeFileSync(path.join(dest, filename), output);
      });
  });
