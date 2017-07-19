const fs = require('fs');
const path = require('path');

const markdox = require('markdox');

const src = path.join(process.cwd(), 'src');
const dest = 'doc';
const files = fs.readdirSync(src).filter((file) => file !== 'umd.js' && /\.js$/.test(file));

if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest);
}


files.forEach((file) => {
    const output = path.join(dest, `${path.basename(file, '.js')}.md`);
    console.log(`Parsing: src/${file}...`); //eslint-disable-line no-console

    markdox.process(path.join(src, file), {
        output,
        template: path.join(__dirname, 'template.md.ejs')
    }, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`Documentation file generated at "${output}!"`); //eslint-disable-line no-console
    });
});