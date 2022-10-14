# write-pkg

> Write a `package.json` file

Writes atomically and creates directories for you as needed. Sorts dependencies when writing. Preserves the indentation if the file already exists.

## Install

```sh
npm install write-pkg
```

## Usage

```js
import path from 'node:path';
import {writePackage} from 'write-pkg';

await writePackage({foo: true});
console.log('done');

await writePackage(path.join('unicorn', 'package.json'), {foo: true});
console.log('done');
```

## API

### writePackage(path?, data, options?)

Returns a `Promise`.

### writePackageSync(path?, data, options?)

#### path

Type: `string`\
Default: `process.cwd()`

The path to where the `package.json` file should be written or its directory.

#### options

Type: `object`

##### indent

Type: `string | number`\
Default: Auto-detected or `'\t'`

The indentation to use for new files.

Accepts `'\t'` for tab indentation or a number of spaces.

If the file already exists, the existing indentation will be used.

##### normalize

Type: `boolean`\
Default: `true`

Remove empty `dependencies`, `devDependencies`, `optionalDependencies` and `peerDependencies` objects.

## write-pkg for enterprise

Available as part of the Tidelift Subscription.

The maintainers of write-pkg and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-write-pkg?utm_source=npm-write-pkg&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Related

- [read-pkg](https://github.com/sindresorhus/read-pkg) - Read a `package.json` file
- [write-json-file](https://github.com/sindresorhus/write-json-file) - Stringify and write JSON to a file atomically

