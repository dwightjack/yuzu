const fs = require('fs');
const chalk = require('chalk');
const { join } = require('path');
const glob = require('fast-glob');
const prettyBytes = require('pretty-bytes');
const gzipSize = require('gzip-size');

function printDiff(diff) {
  if (!diff) {
    return '';
  }
  const formatted = prettyBytes(diff, { signed: true });
  let str = ` (${formatted})`;

  if (diff > 1024) {
    str = chalk.red(str);
  } else if (diff < -10) {
    str = chalk.green(str);
  }
  return str;
}

(async () => {
  const CWD = process.cwd();
  const { name } = require(join(CWD, 'package.json'));
  const REPORT_FILENAME = join(CWD, '.size-report.json');

  const bundles = await glob(['*.js', '!index.js'], {
    cwd: join(CWD, 'dist'),
  });

  if (bundles.length === 0) {
    return;
  }

  const maxLength = bundles.reduce((n, s) => Math.max(n, s.length), 0);

  console.log(chalk.cyan(`\nGzipped size for package "${name}":`));

  const sizesAsync = bundles.map(async (file) => {
    return gzipSize.file(join(CWD, 'dist', file));
  });

  const sizes = await Promise.all(sizesAsync);
  const prevReport = fs.existsSync(REPORT_FILENAME)
    ? JSON.parse(fs.readFileSync(REPORT_FILENAME, 'utf8'))
    : {};
  const report = {};

  sizes.forEach((size, i) => {
    const file = bundles[i];
    const prevSize = prevReport[file];
    const diff = prevSize !== undefined && size - prevSize;
    report[file] = size;

    console.log(
      `  ${bundles[i].padStart(maxLength)} ⏤  ${prettyBytes(size)}${
        prevSize !== undefined ? printDiff(diff) : ''
      }`,
    );
  });

  fs.writeFileSync(REPORT_FILENAME, JSON.stringify(report), 'utf8');
})();
