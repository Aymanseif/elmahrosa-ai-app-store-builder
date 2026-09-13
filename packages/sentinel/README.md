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

### audit(code: string): Promise<{ score: number, report: object }>

Performs a security audit on the provided source code and returns a score (0-100) and a detailed report.

## Development

The library is written in plain JavaScript. No build step is required.

## License

MIT