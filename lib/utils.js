const name = 'AES-CBC'
const DECRYPT = ['decrypt']

const iv = new ArrayBuffer(16)
const algo = { name, length: 128 }

let subtle = globalThis.crypto?.subtle

/**
 * specify SubtleCrypto instance
 * @param {SubtleCrypto} sub
 */
export const useSubtle = (sub) => {
	subtle = sub
}

/**
 * convert base64 encoded data into buffer
 * @param {string} data
 */
export const fromB64 = (data) => {
	try {
		return Buffer.from(data, 'base64')
	} catch (err) {
		const s = atob(data)
		return Uint8Array.from(s, (_, i) => s.charCodeAt(i)).buffer
	}
}

/**
 * create a decryptor for given DRM key
 * @param {string | ArrayBufferLike} key
 */
export const decryptor = async (key) => {
	const buf = (typeof key === 'string') ? fromB64(key) : key
	const dKey = await subtle.importKey('raw', buf, algo, false, DECRYPT)

	/** @param {ArrayBuffer} data */
	return (data) => subtle.decrypt({ name, iv }, dKey, data)
}

/**
 * get the directory path of a url
 * @param {string} url
 */
export const dirname = (url) => {
	const u = new URL(url)
	return `${u.origin}${u.pathname.split('/').slice(0, -1).join('/')}`
}
