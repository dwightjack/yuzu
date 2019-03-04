const { resolve } = require('path');
const glob = require('fast-glob');
const execa = require('execa');

(async function() {
  const cwd = resolve(__dirname, '..');
  const packages = await glob(['packages/*'], {
    cwd,
    onlyDirectories: true,
  });
  console.log(packages);
  packages.forEach(async (package) => {
    console.log(`publishing ${package}`);
    try {
      await execa.shell(`npm publish ${package}`);
    } catch (err) {
      if (err) {
        console.log(err);
        return false;
      }
    }
  });
})();
