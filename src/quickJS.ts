import { QuickJSAsyncWASMModule, newQuickJSAsyncWASMModuleFromVariant, shouldInterruptAfterDeadline } from 'quickjs-emscripten-core'
import { AsyncArena } from './sync/index.js'

import { provideConsole } from './provideConsole.js'
import { provideEnv } from './provideEnv.js'
import { provideFs } from './provideFs.js'
import { provideHttp } from './provideHttp.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

import type { ErrorResponse } from './types/ErrorResponse.js'
import type { InitResponseType } from './types/InitResponseType.js'
import type { OkResponse } from './types/OkResponse.js'

import type { IFs } from 'memfs'
import { createTimeInterval } from './createTimeInterval.js'
import { createVirtualFileSystem } from './createVirtualFileSystem.js'
import { getModuleLoader } from './getModuleLoader.js'
import { getTypescriptSupport } from './getTypescriptSupport.js'
import { modulePathNormalizer } from './modulePathNormalizer.js'
import type { OkResponseCheck } from './types/OkResponseCheck.js'
import { RuntimeValueTransformer } from './runtimeValueTransformer.js'
import { patchCustomEval } from './patchCustomEval.js'
import { patchCustomGlobals } from './patchCustomGlobals.js'

/**
 * Loads and creates a QuickJS instance
 * @param wasmVariantName name of the variant
 * @returns
 */
export const quickJS = async (wasmVariantName = '@jitl/quickjs-ng-wasmfile-release-asyncify') => {
	const module: QuickJSAsyncWASMModule = await newQuickJSAsyncWASMModuleFromVariant(import(wasmVariantName))

	const createRuntime = async (runtimeOptions: RuntimeOptions = {}, existingFs?: IFs): Promise<InitResponseType> => {
		const vm = module.newContext()

		const transformer = new RuntimeValueTransformer(vm)
		patchCustomEval(vm, transformer)
		if (Object.keys(runtimeOptions.globals ?? {}).length) {
			patchCustomGlobals(vm, transformer, runtimeOptions.globals as Record<string, unknown>)
		}

		const fs = existingFs ?? createVirtualFileSystem(runtimeOptions).fs

		const { transpileVirtualFs, transpileFile } = await getTypescriptSupport(runtimeOptions.transformTypescript)
		transpileVirtualFs(fs)

		vm.runtime.setModuleLoader(getModuleLoader(fs, runtimeOptions), modulePathNormalizer)

		const handle = vm.unwrapResult(
			await vm.evalCodeAsync(`
				import 'node:buffer'
      	import 'node:util'
      `,
				undefined,
				{ type: 'module' },
			),
		)
		handle.dispose()

		const arena = new AsyncArena(vm, { isMarshalable: true })

		provideFs(arena, runtimeOptions, fs)
		provideConsole(arena, runtimeOptions)
		const { dispose: disposeEnvironment } = provideEnv(arena, runtimeOptions)
		provideHttp(arena, { ...runtimeOptions }, { fs: runtimeOptions.allowFs ? fs : undefined })

		await arena.evalCodeAsync(`
          import 'node:util'
          import 'node:buffer'
          ${runtimeOptions.enableTestUtils ? "import 'test'" : ''}
        `)

		const dispose = () => {
			let err: unknown
			try {
				disposeEnvironment()
			} catch (error) {
				err = error
				console.error('Failed to dispose environment')
			}
			try {
				arena.dispose()
			} catch (error) {
				err = error
				console.error('Failed to dispose arena')
			}

			try {
				vm.dispose()
			} catch (error) {
				err = error
				console.error('Failed to dispose context')
			}

			if (err) {
				throw err
			}
		}

		/**
		 * Execute code once and cleanup after execution.
		 *
		 * The result of the code execution must be exported with export default.
		 * If the code is async, it needs to be awaited on export.
		 *
		 * @example
		 * ```js
		 * const result = await evalCode('export default await asyncFunction()')
		 * ```
		 */
		const evalCode: InitResponseType['evalCode'] = async (code, filename = '/src/index.js', evalOptions?) => {
			const getMaxTimeout = () => {
				let maxTimeout: number | undefined
				if (runtimeOptions.executionTimeout || evalOptions?.executionTimeout) {
					if (runtimeOptions.executionTimeout) {
						maxTimeout = runtimeOptions.executionTimeout
					}
					if (evalOptions?.executionTimeout) {
						if (maxTimeout) {
							maxTimeout = maxTimeout > evalOptions.executionTimeout ? evalOptions.executionTimeout : maxTimeout
						} else {
							maxTimeout = evalOptions.executionTimeout
						}
					}
				}
				return maxTimeout ? maxTimeout * 1_000 : undefined
			}

			if (getMaxTimeout()) {
				vm.runtime.setInterruptHandler(shouldInterruptAfterDeadline(Date.now() + (getMaxTimeout() as number)))
			}

			using eventLoopinterval = createTimeInterval(() => {
				vm.runtime.executePendingJobs()
			}, 0)

			try {
				const jsCode = transpileFile(code)
				const evalResult = arena.evalCodeAsync(jsCode, filename, {
					strict: true,
					strip: true,
					backtraceBarrier: true,
					...evalOptions,
					type: 'module',
				})

				const result = await Promise.race([
					(async () => {
						const res = await evalResult
						eventLoopinterval?.clear()
						return JSON.parse(JSON.stringify(res))
					})(),
					new Promise((_resolve, reject) => {
						const maxTimeout = getMaxTimeout()
						if (maxTimeout) {
							setTimeout(() => {
								eventLoopinterval?.clear()
								const err = new Error('The script execution has exceeded the maximum allowed time limit.')
								err.name = 'ExecutionTimeout'
								err.stack = undefined
								reject(err)
							}, maxTimeout)
						}
					}),
				])

				return { ok: true, data: result.default } as OkResponse
			} catch (err) {
				const e = err as Error

				const errorReturn: ErrorResponse = {
					ok: false,
					error: {
						name: `${e.name}`,
						message: `${e.message}`,
						stack: e.stack ? `${e.stack}` : undefined,
					},
					isSyntaxError: e.name === 'SyntaxError',
				}

				return errorReturn
			} finally {
				try {
					dispose()
				} catch (error) {
					console.error('Failed to dispose', error)
				}
			}
		}

		/**
		 * Compile code only, but does not execute the code.
		 *
		 * @example
		 * ```js
		 * const result = await validateCode('export default await asyncFunction()')
		 * ```
		 */
		const validateCode: InitResponseType['validateCode'] = async (code, filename = '/src/index.js', evalOptions?) => {
			try {
				arena.evalCode(code, filename, {
					strict: true,
					strip: true,
					backtraceBarrier: true,
					...evalOptions,
					type: 'module',
					compileOnly: true,
				})
				return { ok: true } as OkResponseCheck
			} catch (err) {
				const e = err as Error

				const errorReturn: ErrorResponse = {
					ok: false,
					error: {
						name: `${e.name}`,
						message: `${e.message}`,
						stack: e.stack ? `${e.stack}` : undefined,
					},
					isSyntaxError: e.name === 'SyntaxError',
				}

				return errorReturn
			} finally {
				try {
					dispose()
				} catch (error) {
					console.error('Failed to dispose', error)
				}
			}
		}

		return { vm: arena, dispose, evalCode, validateCode, mountedFs: fs }
	}

	return { createRuntime }
}
