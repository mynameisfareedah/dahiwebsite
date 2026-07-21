const fs = require('fs');
const path = require('path');

const root = process.argv[2] || process.cwd();
const coveragePath = path.join(root, 'coverage', 'coverage-final.json');

if (!fs.existsSync(coveragePath)) {
  console.error('Coverage file not found:', coveragePath);
  process.exit(1);
}

const raw = fs.readFileSync(coveragePath, 'utf8');
const coverage = JSON.parse(raw);

const normalize = (p) => p.replace(/\\/g, '/');
const rel = (p) => normalize(path.relative(root, p));
const isProdSrc = (r) => r.startsWith('src/') && !r.includes('/__tests__/') && !r.endsWith('.test.js') && !r.endsWith('.test.jsx') && !r.endsWith('.test.ts') && !r.endsWith('.test.tsx') && !r.endsWith('.spec.js') && !r.endsWith('.spec.jsx') && !r.endsWith('.spec.ts') && !r.endsWith('.spec.tsx');

const entries = Object.entries(coverage)
  .map(([abs, data]) => {
    const r = rel(abs);
    const s = data.s || {};
    const totalStatements = Object.keys(s).length;
    const coveredStatements = Object.values(s).filter((n) => n > 0).length;
    const pct = totalStatements === 0 ? null : (coveredStatements / totalStatements) * 100;
    return {
      abs,
      rel: r,
      totalStatements,
      coveredStatements,
      pct,
      isProd: isProdSrc(r),
    };
  })
  .filter((e) => e.isProd)
  .sort((a, b) => a.rel.localeCompare(b.rel));

const tested = entries.filter((e) => e.totalStatements > 0 && e.coveredStatements > 0);
const untestedZero = entries.filter((e) => e.totalStatements > 0 && e.coveredStatements === 0);
const noExecutable = entries.filter((e) => e.totalStatements === 0);

const topLow = entries
  .filter((e) => e.totalStatements > 0)
  .sort((a, b) => a.pct - b.pct || a.rel.localeCompare(b.rel))
  .slice(0, 40)
  .map((e) => ({ rel: e.rel, pct: Number(e.pct.toFixed(2)), coveredStatements: e.coveredStatements, totalStatements: e.totalStatements }));

const report = {
  totals: {
    productionFilesInCoverage: entries.length,
    testedFiles: tested.length,
    untestedZeroFiles: untestedZero.length,
    noExecutableStatementFiles: noExecutable.length,
  },
  testedFiles: tested.map((e) => ({ rel: e.rel, pct: Number(e.pct.toFixed(2)), coveredStatements: e.coveredStatements, totalStatements: e.totalStatements })),
  untestedZeroFiles: untestedZero.map((e) => ({ rel: e.rel, totalStatements: e.totalStatements })),
  noExecutableStatementFiles: noExecutable.map((e) => ({ rel: e.rel })),
  lowestCoverageFiles: topLow,
};

process.stdout.write(JSON.stringify(report, null, 2));
