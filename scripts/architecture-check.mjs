#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const out = { root: process.cwd(), config: null, json: false, strict: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--root') out.root = path.resolve(argv[++i]);
    else if (arg === '--config') out.config = path.resolve(argv[++i]);
    else if (arg === '--json') out.json = true;
    else if (arg === '--strict') out.strict = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: architecture-check.mjs [--root PATH] [--config FILE] [--json] [--strict]\n\n` +
        `Default behavior is conservative: entrypoint line-count findings are warnings.\n` +
        `Repository-specific import boundaries and optional component cohesion-review surfaces come from .architecture-guardrails.json.\n` +
        `--strict exits non-zero for warnings as well as errors.`);
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return out;
}

function normalize(p) {
  return p.split(path.sep).join('/').replace(/^\.\//, '');
}

function globToRegExp(glob) {
  let s = normalize(glob).replace(/[.+^${}()|[\]\\]/g, '\\$&');
  s = s.replace(/\*\*/g, '§§DOUBLESTAR§§');
  s = s.replace(/\*/g, '[^/]*');
  s = s.replace(/§§DOUBLESTAR§§/g, '.*');
  return new RegExp(`^${s}$`);
}

function matchesAny(file, globs = []) {
  const n = normalize(file);
  return globs.some((g) => globToRegExp(g).test(n));
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadConfig(args) {
  const defaultConfig = {
    entrypoints: [
      { path: 'src/App.tsx', warnLines: 350 },
      { path: 'src/App.jsx', warnLines: 350 },
      { path: 'src/main.tsx', warnLines: 250 },
      { path: 'src/main.jsx', warnLines: 250 }
    ],
    aliases: {},
    boundaryRules: [],
    cohesionReview: []
  };

  const candidate = args.config ?? path.join(args.root, '.architecture-guardrails.json');
  if (!fs.existsSync(candidate)) return { config: defaultConfig, source: null };

  const user = readJson(candidate);
  return {
    source: candidate,
    config: {
      entrypoints: user.entrypoints ?? defaultConfig.entrypoints,
      aliases: user.aliases ?? {},
      boundaryRules: user.boundaryRules ?? [],
      cohesionReview: user.cohesionReview ?? []
    }
  };
}

function walk(dir, root, out = []) {
  const skip = new Set(['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt', '.output']);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, root, out);
    else if (/\.(?:[cm]?[jt]sx?|vue)$/.test(entry.name)) out.push(normalize(path.relative(root, full)));
  }
  return out;
}

function extractImports(source) {
  const specs = [];
  const patterns = [
    /\bfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(source))) specs.push(m[1]);
  }
  return [...new Set(specs)];
}

function resolveImport(fromFile, spec, aliases, root) {
  let target = null;

  if (spec.startsWith('.')) {
    target = path.resolve(root, path.dirname(fromFile), spec);
  } else {
    for (const [prefix, mapped] of Object.entries(aliases)) {
      if (spec.startsWith(prefix)) {
        target = path.resolve(root, mapped, spec.slice(prefix.length));
        break;
      }
    }
  }

  if (!target) return null;
  return normalize(path.relative(root, target));
}

function lineCount(file) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text) return 0;
  return text.split(/\r?\n/).length;
}

function main() {
  const args = parseArgs(process.argv);
  const { config, source } = loadConfig(args);
  const findings = [];

  for (const ep of config.entrypoints ?? []) {
    const abs = path.join(args.root, ep.path);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    const lines = lineCount(abs);
    if (ep.warnLines && lines > ep.warnLines) {
      findings.push({
        severity: 'warn',
        rule: 'entrypoint-size-smell',
        file: normalize(ep.path),
        message: `${normalize(ep.path)} has ${lines} lines (warning threshold ${ep.warnLines}). Treat this as an ownership review signal, not an automatic split command.`
      });
    }
  }

  const cohesionRules = config.cohesionReview ?? [];
  if (cohesionRules.length) {
    const files = walk(args.root, args.root);
    for (const rule of cohesionRules) {
      const matched = files.filter((file) => matchesAny(file, rule.files ?? []));
      for (const file of matched) {
        const lines = lineCount(path.join(args.root, file));
        const warnLines = rule.warnLines ?? 500;
        const strongLines = rule.strongWarnLines ?? 800;
        if (lines > strongLines) {
          findings.push({
            severity: 'warn',
            rule: rule.name ?? 'component-cohesion-strong-smell',
            file,
            message: `${file} has ${lines} lines (strong review threshold ${strongLines}). Perform feature-internal ownership/cohesion review; this is not an automatic split command.`
          });
        } else if (lines > warnLines) {
          findings.push({
            severity: 'warn',
            rule: rule.name ?? 'component-cohesion-review',
            file,
            message: `${file} has ${lines} lines (review threshold ${warnLines}). Review semantic workflow/component ownership; line count alone is not a split reason.`
          });
        }
      }
    }
  }

  const rules = config.boundaryRules ?? [];
  if (rules.length) {
    const files = walk(args.root, args.root);
    for (const file of files) {
      const applicable = rules.filter((rule) => matchesAny(file, rule.from ?? []));
      if (!applicable.length) continue;

      const abs = path.join(args.root, file);
      const imports = extractImports(fs.readFileSync(abs, 'utf8'));
      for (const spec of imports) {
        const resolved = resolveImport(file, spec, config.aliases ?? {}, args.root);
        if (!resolved) continue;

        for (const rule of applicable) {
          if (matchesAny(resolved, rule.denyImports ?? [])) {
            findings.push({
              severity: rule.severity === 'error' ? 'error' : 'warn',
              rule: rule.name ?? 'boundary-rule',
              file,
              import: spec,
              resolved,
              message: `${file} imports ${spec} -> ${resolved}, which violates ${rule.name ?? 'a configured boundary rule'}.`
            });
          }
        }
      }
    }
  }

  const errors = findings.filter((f) => f.severity === 'error').length;
  const warnings = findings.filter((f) => f.severity === 'warn').length;
  const result = {
    root: args.root,
    config: source,
    errors,
    warnings,
    findings
  };

  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`Architecture check: ${errors} error(s), ${warnings} warning(s)`);
    if (source) console.log(`Config: ${source}`);
    else console.log('Config: defaults only (no repository-specific boundary rules)');
    for (const f of findings) console.log(`[${f.severity.toUpperCase()}] ${f.rule}: ${f.message}`);
  }

  if (errors > 0 || (args.strict && warnings > 0)) process.exit(1);
}

try {
  main();
} catch (err) {
  console.error(`architecture-check failed: ${err.message}`);
  process.exit(2);
}
