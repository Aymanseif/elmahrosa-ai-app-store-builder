const fs = require("fs");
const path = require("path");

// Sentinel Shield: first-cut static security audit.
// Scans source code for common dangerous patterns and returns a
// 0-100 score plus a structured report of findings.

const SEVERITY_WEIGHT = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
};

const RULES = [
  {
    id: "SEC-001",
    severity: "critical",
    message: "Hardcoded API key, token, or secret",
    pattern: /(AKIA[0-9A-Z]{16}|sk-(test|live)-[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{16,}|xox[baprs]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})/g,
  },
  {
    id: "SEC-002",
    severity: "high",
    message: "Dynamic code execution (eval / new Function)",
    pattern: /\b(eval|new Function)\s*\([^)]+\)/g,
  },
  {
    id: "SEC-003",
    severity: "high",
    message: "Shell command execution",
    pattern: /\b(child_process\.)?(exec|execSync|spawn|spawnSync)\s*\(/g,
  },
  {
    id: "SEC-004",
    severity: "high",
    message: "Plaintext (HTTP) endpoint over network",
    pattern: /"http:\/\/(?!localhost|127\.0\.0\.1)[^"]+"/g,
  },
  {
    id: "SEC-005",
    severity: "medium",
    message: "Likely SQL injection via string concatenation",
    pattern: /\b(SELECT|INSERT|UPDATE|DELETE)\b[^;"']*['"]\s*\+\s*[^"']/gi,
  },
  {
    id: "SEC-006",
    severity: "medium",
    message: "Hardcoded credential assignment",
    pattern: /\b(password|passwd|secret|api[_-]?key)\s*[:=]\s*['"][^'"]{1,20}['"]/gi,
  },
  {
    id: "SEC-007",
    severity: "low",
    message: "Insecure deserialization (JSON.parse of untrusted input)",
    pattern: /JSON\.parse\s*\(/g,
  },
];

const parse = async (code) => {
  if (typeof code !== "string" || code.trim() === "") {
    throw new Error("Sentinel Shield: audit expects a non-empty source string");
  }

  const findings = [];

  for (const rule of RULES) {
    let match;
    while ((match = rule.pattern.exec(code)) !== null) {
      findings.push({
        rule: rule.id,
        severity: rule.severity,
        message: rule.message,
        snippet: code.substring(Math.max(0, match.index - 40), match.index + match[0].length + 40),
      });
    }
  }

  // Start at 100 and deduct per finding, floored at 0.
  const score = Math.max(
    0,
    100 - findings.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0)
  );

  return { score, report: findings };
};

const audit = async (code) => parse(code);

const auditFile = async (filePath) => {
  const code = fs.readFileSync(path.resolve(filePath), "utf8");
  const result = await parse(code);
  result.report.forEach((f) => {
    f.file = filePath;
  });
  return result;
};

const auditDirectory = async (dir) => {
  const results = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
        continue;
      }
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.(js|jsx|ts|tsx|py|java|kt|go|rb|php)$/.test(entry.name)) {
        results.push(auditFile(full));
      }
    }
  };
  walk(path.resolve(dir));
  const reports = await Promise.all(results);
  const all = reports.flatMap((r) => r.report);
  const score = Math.max(
    0,
    100 - all.reduce((sum, f) => sum + SEVERITY_WEIGHT[f.severity], 0)
  );
  return { score, report: all };
};

module.exports = { audit, auditFile, auditDirectory };