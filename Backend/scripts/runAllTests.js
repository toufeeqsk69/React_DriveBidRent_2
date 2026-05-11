import { execSync, spawnSync } from 'child_process';
import { writeFileSync } from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');          // Backend/
const CLIENT = path.resolve(ROOT, '..', 'client');   // client/
const REPORT_PATH = path.join(ROOT, 'combined-test-report.html');
const generateReport = process.argv.includes('--report');

/* ─── Helpers ──────────────────────────────────────────────────── */
function runCommand(cmd, cwd, label) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Running ${label} tests …`);
  console.log(`${'═'.repeat(60)}\n`);

  if (!generateReport) {
    // Console-only mode: inherit stdio so output streams to terminal
    try {
      execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' }, timeout: 120_000 });
      return { success: true, output: '' };
    } catch {
      return { success: false, output: '' };
    }
  }

  // Report mode: capture both stdout AND stderr
  const parts = cmd.split(' ');
  const result = spawnSync(parts[0], parts.slice(1), {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, FORCE_COLOR: '0' },
    timeout: 120_000,
    shell: true,
  });

  const combined = [result.stdout || '', result.stderr || ''].join('\n').trim();
  const success = result.status === 0;

  return { success, output: combined };
}

function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001b\[[0-9;]*m/g, '');
}

/* ─── Run both test suites ─────────────────────────────────────── */
console.log('\n🚀  DriveBidRent — Combined Test Runner\n');

// 1) Backend tests (Jest)
const backendCmd = 'node --experimental-vm-modules node_modules/jest/bin/jest.js --detectOpenHandles --silent';
const backend = runCommand(backendCmd, ROOT, 'Backend (Jest)');

// 2) Frontend tests (Vitest)
const frontendCmd = 'npx vitest run --reporter=verbose';
const frontend = runCommand(frontendCmd, CLIENT, 'Frontend (Vitest)');

/* ─── Summary ──────────────────────────────────────────────────── */
console.log(`\n${'═'.repeat(60)}`);
console.log('Test Summary');
console.log(`${'═'.repeat(60)}`);
console.log(`  Backend  : ${backend.success ? '✅ PASSED' : '❌ SOME FAILURES'}`);
console.log(`  Frontend : ${frontend.success ? '✅ PASSED' : '❌ SOME FAILURES'}`);
console.log(`${'═'.repeat(60)}\n`);

/* ─── Generate combined HTML report ───────────────────────────── */
if (generateReport) {
  const escapeHtml = (str) => str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const backendOutput = escapeHtml(stripAnsi(backend.output));
  const frontendOutput = escapeHtml(stripAnsi(frontend.output));
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });



  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DriveBidRent - Combined Test Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #e2e8f0;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border-bottom: 1px solid #1e293b;
      padding: 40px 48px 32px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #f8fafc;
    }
    .header h1 span { color: #f97316; }
    .header .meta {
      margin-top: 8px;
      font-size: 13px;
      color: #64748b;
      font-weight: 500;
    }
    .summary-bar {
      display: flex;
      gap: 16px;
      padding: 24px 48px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }
    .summary-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 24px;
      border-radius: 14px;
      font-weight: 700;
      font-size: 14px;
      flex: 1;
      justify-content: center;
    }
    .pill-pass { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.2); }
    .pill-fail { background: rgba(239,68,68,0.12); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
    .status-icon {
      display: inline-block;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      margin-right: 4px;
      vertical-align: middle;
    }
    .icon-pass { background: #34d399; }
    .icon-fail { background: #f87171; }
    .tabs {
      display: flex;
      gap: 0;
      padding: 0 48px;
      background: #1e293b;
      border-bottom: 1px solid #334155;
    }
    .tab {
      padding: 14px 28px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;
      user-select: none;
    }
    .tab:hover { color: #94a3b8; }
    .tab.active { color: #f97316; border-bottom-color: #f97316; }
    .panel { display: none; padding: 32px 48px; }
    .panel.active { display: block; }
    .console-output {
      background: #0c0e14;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 28px 32px;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 12.5px;
      line-height: 1.8;
      white-space: pre-wrap;
      word-break: break-word;
      color: #94a3b8;
      max-height: 600px;
      overflow-y: auto;
    }
    .console-output::-webkit-scrollbar { width: 6px; }
    .console-output::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: #475569;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #1e293b;
    }
    .footer {
      text-align: center;
      padding: 32px;
      color: #475569;
      font-size: 12px;
      font-weight: 500;
    }
    @media (max-width: 768px) {
      .header, .summary-bar, .tabs, .panel { padding-left: 20px; padding-right: 20px; }
      .summary-bar { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>DriveBidRent - <span>Test Report</span></h1>
    <p class="meta">Generated on ${timestamp} | Backend (Jest) + Frontend (Vitest)</p>
  </div>

  <div class="summary-bar">
    <div class="summary-pill ${backend.success ? 'pill-pass' : 'pill-fail'}">
      <span class="status-icon ${backend.success ? 'icon-pass' : 'icon-fail'}"></span>
      Backend Tests - ${backend.success ? 'ALL PASSED' : 'HAS FAILURES'}
    </div>
    <div class="summary-pill ${frontend.success ? 'pill-pass' : 'pill-fail'}">
      <span class="status-icon ${frontend.success ? 'icon-pass' : 'icon-fail'}"></span>
      Frontend Tests - ${frontend.success ? 'ALL PASSED' : 'HAS FAILURES'}
    </div>
  </div>

  <div class="tabs">
    <div class="tab active" data-panel="backend">Backend (Jest)</div>
    <div class="tab" data-panel="frontend">Frontend (Vitest)</div>

  </div>

  <div id="panel-backend" class="panel active">
    <div class="section-label">Console Output - Backend Test Suites</div>
    <div class="console-output">${backendOutput || 'No output captured.'}</div>
  </div>

  <div id="panel-frontend" class="panel">
    <div class="section-label">Console Output - Frontend Vitest Suites</div>
    <div class="console-output">${frontendOutput || 'No output captured.'}</div>
  </div>



  <div class="footer">
    DriveBidRent ${new Date().getFullYear()} | Combined Test Report
  </div>

  <script>
    // Tab switching via event delegation (no inline handlers)
    document.querySelector('.tabs').addEventListener('click', function(e) {
      var tab = e.target.closest('.tab');
      if (!tab) return;
      var panelName = tab.getAttribute('data-panel');
      document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      document.querySelectorAll('.panel').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById('panel-' + panelName);
      if (panel) panel.classList.add('active');
    });

  </script>
</body>
</html>`;

  writeFileSync(REPORT_PATH, html, 'utf-8');
  console.log('Combined report saved: ' + REPORT_PATH);
  console.log('View at: http://localhost:8000/test-reports\\n');
}

// Exit with failure code if either suite failed
if (!backend.success || !frontend.success) {
  process.exit(1);
}
