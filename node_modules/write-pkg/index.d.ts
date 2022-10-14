import {JsonObject} from 'type-fest';

export interface Options {
	/**
	The indentation to use for new files.

	Accepts `'\t'` for tab indentation or a number of spaces.

	If the file already exists, the existing indentation will be used.

	Default: Auto-detected or `'\t'`
	*/
	readonly indent?: string | number;

	/**
	Remove empty `dependencies`, `devDependencies`, `optionalDependencies` and `peerDependencies` objects.

	@default true
	*/
	readonly normalize?: boolean;
}

/**
Write a `package.json` file.

Writes atomically and creates directories for you as needed. Sorts dependencies when writing. Preserves the indentation if the file already exists.

@param path - The path to where the `package.json` file should be written or its directory.

@example
```
import path from 'node:path';
import {writePackage} from 'write-pkg';

await writePackage({foo: true});
console.log('done');

await writePackage(path.join('unicorn', 'package.json'), {foo: true});
console.log('done');
```
*/
export function writePackage(path: string, data: JsonObject, options?: Options): Promise<void>;
export function writePackage(data: JsonObject, options?: Options): Promise<void>;

/**
Synchronously write a `package.json` file.

Writes atomically and creates directories for you as needed. Sorts dependencies when writing. Preserves the indentation if the file already exists.

@param path - The path to where the `package.json` file should be written or its directory.

@example
```
import path from 'node:path';
import {writePackageSync} from 'write-pkg';

writePackageSync({foo: true});
console.log('done');

writePackageSync(path.join('unicorn', 'package.json'), {foo: true});
console.log('done');
```
*/
export function writePackageSync(path: string, data: JsonObject, options?: Options): void;
export function writePackageSync(data: JsonObject, options?: Options): void;
