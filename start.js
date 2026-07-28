const { spawn } = require('child_process');
const path = require('path');

const root = __dirname;
const backendDir = path.join(root, 'backend');
const frontendDir = path.join(root, 'frontend');

const nestBin = path.join(backendDir, 'node_modules', '@nestjs', 'cli', 'bin', 'nest.js');
const viteBin = path.join(frontendDir, 'node_modules', 'vite', 'bin', 'vite.js');

const backend = spawn('node', [nestBin, 'start', '--watch'], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: false,
});

const frontend = spawn('node', [viteBin, '--host'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: false,
});

console.log('\n  Backend (PID: ' + backend.pid + ') → http://localhost:3000');
console.log('  Frontend (PID: ' + frontend.pid + ') → http://localhost:5173\n');

process.on('SIGINT', () => { backend.kill(); frontend.kill(); process.exit(); });
process.on('SIGTERM', () => { backend.kill(); frontend.kill(); process.exit(); });
