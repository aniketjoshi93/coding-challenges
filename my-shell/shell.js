// shell.js
const readline = require('readline');
const { exec } = require('child_process');
const path = require('path');
const os = require('os');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'my-shell> '
});

let currentDir = process.cwd();

rl.prompt();

rl.on('line', (line) => {
  const input = line.trim();
  const [command, ...args] = input.split(' ');

  switch (command) {
    case 'exit':
      rl.close();
      break;
    case 'cd':
      if (args.length > 0) {
        const newDir = path.resolve(currentDir, args[0]);
        try {
          process.chdir(newDir);
          currentDir = newDir;
        } catch (err) {
          console.error(`cd: ${err.message}`);
        }
      }
      break;
    default:
      exec(input, { cwd: currentDir }, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error: ${stderr}`);
        } else {
          console.log(stdout);
        }
        rl.prompt();
      });
      return;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Exiting my-shell');
  process.exit(0);
});