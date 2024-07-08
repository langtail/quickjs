import { memfs } from 'memfs'
import type { Arena } from './sync/index.js'
import type { RuntimeOptions } from './types/RuntimeOptions.js'

export const provideFs = (vm: Arena, options: RuntimeOptions) => {
	if (!options.allowFs) {
		return
	}

	const { vol, fs } = memfs(options.mountFs ?? { src: {} }, '/')

	vm.expose({
		__fs: {
			access: (...params: Parameters<typeof vol.access>) => vol.access(...params),
			accessSync: (...params: Parameters<typeof vol.accessSync>) => vol.accessSync(...params),
			appendFile: (...params: Parameters<typeof vol.appendFile>) => vol.appendFile(...params),
			appendFileSync: (...params: Parameters<typeof vol.appendFileSync>) => vol.appendFileSync(...params),
			chmod: (...params: Parameters<typeof vol.chmod>) => vol.chmod(...params),
			chmodSync: (...params: Parameters<typeof vol.chmodSync>) => vol.chmodSync(...params),
			chown: (...params: Parameters<typeof vol.chown>) => vol.chown(...params),
			chownSync: (...params: Parameters<typeof vol.chownSync>) => vol.chownSync(...params),
			close: (...params: Parameters<typeof vol.close>) => vol.close(...params),
			closeSync: (...params: Parameters<typeof vol.closeSync>) => vol.closeSync(...params),
			copyFile: (...params: Parameters<typeof vol.copyFile>) => vol.copyFile(...params),
			copyFileSync: (...params: Parameters<typeof vol.copyFileSync>) => vol.copyFileSync(...params),
			createReadStream: (...params: Parameters<typeof vol.createReadStream>) => vol.createReadStream(...params),
			createWriteStream: (...params: Parameters<typeof vol.createWriteStream>) => vol.createWriteStream(...params),
			exists: (...params: Parameters<typeof vol.exists>) => vol.exists(...params),
			existsSync: (...params: Parameters<typeof vol.existsSync>) => vol.existsSync(...params),
			fchmod: (...params: Parameters<typeof vol.fchmod>) => vol.fchmod(...params),
			fchmodSync: (...params: Parameters<typeof vol.fchmodSync>) => vol.fchmodSync(...params),
			fchown: (...params: Parameters<typeof vol.fchown>) => vol.fchown(...params),
			fchownSync: (...params: Parameters<typeof vol.fchownSync>) => vol.fchownSync(...params),
			fdatasync: (...params: Parameters<typeof vol.fdatasync>) => vol.fdatasync(...params),
			fdatasyncSync: (...params: Parameters<typeof vol.fdatasyncSync>) => vol.fdatasyncSync(...params),
			fstat: (...params: Parameters<typeof vol.fstat>) => vol.fstat(...params),
			fstatSync: (...params: Parameters<typeof vol.fstatSync>) => vol.fstatSync(...params),
			fsync: (...params: Parameters<typeof vol.fsync>) => vol.fsync(...params),
			fsyncSync: (...params: Parameters<typeof vol.fsyncSync>) => vol.fsyncSync(...params),
			ftruncate: (...params: Parameters<typeof vol.ftruncate>) => vol.ftruncate(...params),
			ftruncateSync: (...params: Parameters<typeof vol.ftruncateSync>) => vol.ftruncateSync(...params),
			futimes: (...params: Parameters<typeof vol.futimes>) => vol.futimes(...params),
			futimesSync: (...params: Parameters<typeof vol.futimesSync>) => vol.futimesSync(...params),
			lchmod: (...params: Parameters<typeof vol.lchmod>) => vol.lchmod(...params),
			lchmodSync: (...params: Parameters<typeof vol.lchmodSync>) => vol.lchmodSync(...params),
			lchown: (...params: Parameters<typeof vol.lchown>) => vol.lchown(...params),
			lchownSync: (...params: Parameters<typeof vol.lchownSync>) => vol.lchownSync(...params),
			link: (...params: Parameters<typeof vol.link>) => vol.link(...params),
			linkSync: (...params: Parameters<typeof vol.linkSync>) => vol.linkSync(...params),
			lstat: (...params: Parameters<typeof vol.lstat>) => vol.lstat(...params),
			lstatSync: (...params: Parameters<typeof vol.lstatSync>) => vol.lstatSync(...params),
			mkdir: (...params: Parameters<typeof vol.mkdir>) => vol.mkdir(...params),
			mkdirSync: (...params: Parameters<typeof vol.mkdirSync>) => vol.mkdirSync(...params),
			mkdtemp: (...params: Parameters<typeof vol.mkdtemp>) => vol.mkdtemp(...params),
			mkdtempSync: (...params: Parameters<typeof vol.mkdtempSync>) => vol.mkdtempSync(...params),
			open: (...params: Parameters<typeof vol.open>) => vol.open(...params),
			openSync: (...params: Parameters<typeof vol.openSync>) => vol.openSync(...params),
			readdir: (...params: Parameters<typeof vol.readdir>) => vol.readdir(...params),
			readdirSync: (...params: Parameters<typeof vol.readdirSync>) => vol.readdirSync(...params),
			read: (...params: Parameters<typeof vol.read>) => vol.read(...params),
			readSync: (...params: Parameters<typeof vol.readSync>) => vol.readSync(...params),
			readFile: (...params: Parameters<typeof vol.readFile>) => vol.readFile(...params),
			readFileSync: (...params: Parameters<typeof vol.readFileSync>) => vol.readFileSync(...params).toString(),
			readlink: (...params: Parameters<typeof vol.readlink>) => vol.readlink(...params),
			readlinkSync: (...params: Parameters<typeof vol.readlinkSync>) => vol.readlinkSync(...params),
			realpath: (...params: Parameters<typeof vol.realpath>) => vol.realpath(...params),
			realpathSync: (...params: Parameters<typeof vol.realpathSync>) => vol.realpathSync(...params),
			rename: (...params: Parameters<typeof vol.rename>) => vol.rename(...params),
			renameSync: (...params: Parameters<typeof vol.renameSync>) => vol.renameSync(...params),
			rmdir: (...params: Parameters<typeof vol.rmdir>) => vol.rmdir(...params),
			rmdirSync: (...params: Parameters<typeof vol.rmdirSync>) => vol.rmdirSync(...params),
			stat: (...params: Parameters<typeof vol.stat>) => vol.stat(...params),
			statSync: (...params: Parameters<typeof vol.statSync>) => vol.statSync(...params),
			symlink: (...params: Parameters<typeof vol.symlink>) => vol.symlink(...params),
			symlinkSync: (...params: Parameters<typeof vol.symlinkSync>) => vol.symlinkSync(...params),
			truncate: (...params: Parameters<typeof vol.truncate>) => vol.truncate(...params),
			truncateSync: (...params: Parameters<typeof vol.truncateSync>) => vol.truncateSync(...params),
			unlink: (...params: Parameters<typeof vol.unlink>) => vol.unlink(...params),
			unlinkSync: (...params: Parameters<typeof vol.unlinkSync>) => vol.unlinkSync(...params),
			utimes: (...params: Parameters<typeof vol.utimes>) => vol.utimes(...params),
			utimesSync: (...params: Parameters<typeof vol.utimesSync>) => vol.utimesSync(...params),
			write: (...params: Parameters<typeof vol.write>) => vol.write(...params),
			writeSync: (...params: Parameters<typeof vol.writeSync>) => vol.writeSync(...params),
			writeFile: (...params: Parameters<typeof vol.writeFile>) => vol.writeFile(...params),
			writeFileSync: (...params: Parameters<typeof vol.writeFileSync>) => {
				vol.writeFileSync(...params)
			},
		},
	})

	return { fs }
}
