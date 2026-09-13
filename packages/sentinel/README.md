# @elmahrosa/sentinel

Security audit library for Elmahrosa AI App Store Builder.

## Installation

This is an internal package and is installed via the monorepo's package manager.

## Usage

```js
const { audit } = require('@elmahrosa/sentinel');
// or
import { audit } from '@elmahrosa/sentinel';

const result = await audit(sourceCode);
console.log(result.score);
```

## API

### audit(code: string): Promise<{ score, report }>

Performs a static security audit on the provided source string and returns a
score (0-100) and a report array of findings:

```js
{
  score: 62,
  report: [
    { rule: "SEC-003", severity: "high", message: "Shell command execution", snippet: "..." }
  ]
}
```

### auditFile(filePath: string): Promise<{ score, report }>

Reads a single file and audits its contents. Findings include the `file` path.

### auditDirectory(dir: string): Promise<{ score, report }>

Walks a directory tree (skipping `node_modules`, `.git`, `.next`) and audits all
source files (`*.js, *.jsx, *.ts, *.tsx, *.py, *.java, *.kt, *.go, *.rb, *.php`).

Rules are defined in `lib/index.js` as `RULES` — extend the array to add checks.

## Development

The library is written in plain JavaScript. No build step is required.

## License

MIT