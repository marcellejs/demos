const { spawn } = require('child_process');
const fs = require('fs');
const fse = require('fs-extra');
const { join } = require('path');
var os = require('os');
const ejs = require('ejs');

const pkg = require('../package.json');

function pSpawn(...args) {
  return new Promise((resolve, reject) => {
    const process = spawn(...args);
    process.on('close', () => {
      resolve();
    });
    process.on('error', () => {
      reject();
    });
  });
}

function buildAll() {
  let p = Promise.resolve();
  pkg.workspaces.forEach((path) => {
    // ensure path has package.json
    if (!fs.existsSync(join(path, 'package.json'))) {
      return;
    }

    // npm binary based on OS
    var npmCmd = os.platform().startsWith('win') ? 'npm.cmd' : 'npm';

    // install folder
    p = p.then(() =>
      // prettier-ignore
      pSpawn(npmCmd, ['run', 'build', '--', `--base=/${path}`], {
        env: process.env,
        cwd: path,
        stdio: 'inherit',
        shell: true,
      })
    );
  });
  return p;
}

function copyFiles() {
  return pkg.workspaces.map((path) => {
    fse
      .copy(join(path, 'dist'), join('dist', path))
      .then(() => {
        console.log('success!');
      })
      .catch((err) => {
        console.error(err);
      });
  });
}

function writeIndexPage() {
  const demos = pkg.workspaces.map((path) => {
    const demoPkg = require(join(path, 'package.json'));
    return {
      name: demoPkg.name,
      description: demoPkg.description,
    };
  });
  ejs.renderFile(join(__dirname, 'index.ejs'), { demos }, function (err, str) {
    if (err) {
      console.err(err);
      process.exit(1);
    }
    fs.writeFileSync('dist/index.html', str);
  });
}

async function main() {
  await buildAll();
  await copyFiles();
  writeIndexPage();
}

main();
