# QuickJS - Execute JavaScript and TypeScript in a WebAssembly QuickJS Sandbox

This TypeScript package allows you to safely execute **JavaScript AND TypeScript code** within a WebAssembly sandbox using the QuickJS engine. Perfect for isolating and running untrusted code securely, it leverages the lightweight and fast QuickJS engine compiled to WebAssembly, providing a robust environment for code execution.

## Features

- **Security**: Run untrusted JavaScript and TypeScript code in a safe, isolated environment.
- **Basic Node.js modules**: Provides basic standard Node.js module support for common use cases.
- **File System**: Can mount a virtual file system.
- **Custom Node Modules**: Custom node modules are mountable.
- **Fetch Client**: Can provide a fetch client to make http(s) calls.
- **Test-Runner**: Includes a test runner and chai based `expect`.
- **Performance**: Benefit from the lightweight and efficient QuickJS engine.
- **Versatility**: Easily integrate with existing TypeScript projects.
- **Simplicity**: User-friendly API for executing and managing JavaScript and TypeScript code in the sandbox.

**[View the full documentation](https://sebastianwessel.github.io/quickjs/)**

**[Find examples in the repository](https://github.com/sebastianwessel/quickjs/tree/main/example)**

## Version 1: Rolling Release

### Fast Lane - Fast Pace

Welcome to the first version of our npm package! This release follows a rolling release model, prioritizing rapid development and quick iterations. The approach is designed to deliver features swiftly, gather feedback promptly, and implement fixes without delay. This means you get the latest features and improvements as soon as they are ready, ensuring you always have access to the cutting-edge functionality.

Key aspects of our rolling release model:

- **Ship Fast:** Release new features and updates as soon as they are developed.
- **Get Fast Feedback:** Your feedback is crucial. I listen and respond quickly to ensure the package meets your needs.
- **Fix Quickly:** Bugs and issues are addressed promptly, minimizing any disruptions.
- **Fast-Paced Development:** Our development cycle is agile, allowing us to adapt and evolve based on user input.

Stay tuned for frequent updates and enhancements.

## Basic Usage

Here's a simple example of how to use the package:

```typescript
import { quickJS } from '@sebastianwessel/quickjs'

// General setup like loading and init of the QuickJS wasm
// It is a ressource intensive job and should be done only once if possible 
const { createRuntime } = await quickJS()

// Create a runtime instance (sandbox)
// see all options with description here: src/types/RuntimeOptions.ts
const { evalCode } = await createRuntime({
  allowFetch: true, // inject fetch and allow the code to fetch data
  allowFs: true, // mount a virtual file system and provide node:fs module
  env: {
    MY_ENV_VAR: 'env var value'
  },
})


const result = await evalCode(`
import { join } as path from 'path'

const fn = async ()=>{
  console.log(join('src','dist')) // logs "src/dist" on host system

  console.log(env.MY_ENV_VAR) // logs "env var value" on host system

  const url = new URL('https://example.com')

  const f = await fetch(url)

  return f.text()
}
  
export default await fn()
`)

console.log(result) // { ok: true, data: '<!doctype html>\n<html>\n[....]</html>\n' }
```

## Runtime options:

```typescript
export type RuntimeOptions = {
	/**
	 * Either array of whitelisted domains or more generic function which filters by the whole Request | URL | string (first param of fetch())
	 */
	fetchFilter?: string[] | fetchFilterFn
	/**
	 * Custom module fetcher
	 */
	moduleFetcher?: (pkgName: string) => Promise<string>
	/**
	 * True to enable fetching using either default esm.sh fetcher or by privided moduleFetcher
	 */
	fetchModules?: boolean
	/**
	 * An optional object describing global entities which should be transferred into QJS env.
	 */
	globals?: Record<string, unknown>
	/**
	 * The maximum time in seconds a script can run.
	 * Unset or set to 0 for unlimited execution time.
	 */
	executionTimeout?: number
	/**
	 * Mount a virtual file system
	 * @link https://github.com/streamich/memfs
	 */
	mountFs?: NestedDirectoryJSON
	/**
	 * Mount custom node_modules in a virtual file system
	 * @link https://github.com/streamich/memfs
	 */
	nodeModules?: NestedDirectoryJSON
	/**
	 * Enable file capabilities
	 * If enabled, the package node:fs becomes available
	 */
	allowFs?: boolean
	/**
	 * Allow code to make http(s) calls.
	 * When enabled, the global fetch will be available
	 */
	allowFetch?: boolean
	/**
	 * The custom fetch adapter provided as host function in the QuickJS runtime
	 */
	fetchAdapter?: typeof fetch
	/**
	 * Includes test framework
	 * If enabled, the packages chai and mocha become available
	 * They are registered global
	 */
	enableTestUtils?: boolean
	/**
	 * Per default, the console log inside of QuickJS is passed to the host console log.
	 * Here, you can customize the handling and provide your own logging methods.
	 */
	console?: {
		log?: (message?: unknown, ...optionalParams: unknown[]) => void
		error?: (message?: unknown, ...optionalParams: unknown[]) => void
		warn?: (message?: unknown, ...optionalParams: unknown[]) => void
		info?: (message?: unknown, ...optionalParams: unknown[]) => void
		debug?: (message?: unknown, ...optionalParams: unknown[]) => void
		trace?: (message?: unknown, ...optionalParams: unknown[]) => void
		assert?: (condition?: boolean, ...data: unknown[]) => void
		count?: (label?: string) => void
		countReset?: (label?: string) => void
		dir?: (item?: unknown, options?: object) => void
		dirxml?: (...data: unknown[]) => void
		group?: (...label: unknown[]) => void
		groupCollapsed?: (...label: unknown[]) => void
		groupEnd?: () => void
		table?: (tabularData?: unknown, properties?: string[]) => void
		time?: (label?: string) => void
		timeEnd?: (label?: string) => void
		timeLog?: (label?: string, ...data: unknown[]) => void
		clear?: () => void
	}
	/**
	 * Key-value list of ENV vars, which should be available in QuickJS
	 * It is not limited to primitives like string and numbers.
	 * Objects, arrays and functions can be provided as well.
	 *
	 * @example
	 * ```js
	 * // in config
	 * {
	 *   env: {
	 *     My_ENV: 'my var'
	 *   }
	 * }
	 *
	 * // inside of QuickJS
	 * console.log(env.My_ENV) // outputs: my var
	 * ```
	 */
	env?: Record<string, unknown>
	/**
	 * The object is synchronized between host and guest system.
	 * This means, the values on the host, can be set by the guest system
	 */
	dangerousSync?: Record<string, unknown>
	/**
	 * Transpile all typescript files to javascript file in mountFs
	 * Requires dependency typescript to be installed
	 */
	transformTypescript?: boolean
	/**
	 * The Typescript compiler options for transpiling files from typescript to JavaScript
	 */
	transformCompilerOptions?: TS.CompilerOptions
}
```


## Credits

This lib is based on:

- [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten)
- [quickjs-emscripten-sync](https://github.com/reearth/quickjs-emscripten-sync)
- [memfs](https://github.com/streamich/memfs)
- [Chai](https://www.chaijs.com)

Tools used:

- [Bun](https://bun.sh)
- [Biome](https://biomejs.dev)
- [Hono](https://hono.dev)
- [poolifier-web-worker](https://github.com/poolifier/poolifier-web-worker)
- [tshy](https://github.com/isaacs/tshy)
- [autocannon](https://github.com/mcollina/autocannon)

## License

This project is licensed under the MIT License.

---

This package is ideal for developers looking to execute JavaScript code securely within a TypeScript application, ensuring both performance and safety with the QuickJS WebAssembly sandbox.
