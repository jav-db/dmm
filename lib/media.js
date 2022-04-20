import { dirname, decryptor } from './utils.js'

const BR_RE = /_b(\d+)/
const CHUNK = 'chunklist'

/**
 * retrieves playlist and chunk info from given URL
 * @param {string} url
 * @param {number} bitrate
 */
export const getMedia = async (url, bitrate = 0) => {
	const plResp = await fetch(url)
	const plText = await plResp.text()
	const playlist = plText.split('\n')

	const chunklist = bitrate
		? playlist.find((p) => p.startsWith(`${CHUNK}_b${bitrate}.m3u8`))
		: playlist.findLast((p) => p.startsWith(CHUNK))

	if (!chunklist) throw new Error(`cannot find chunklist: ${plText}`)

	const clResp = await fetch(`${dirname(plResp.url)}/${chunklist}`)
	const clText = await clResp.text()
	const chunks = clText.split('\n').filter((ln) => ln.startsWith('media'))

	if (!chunks.length) throw new Error(`no chunks found: ${clText}`)

	/** @param {ArrayBuffer} buf */
	let decrypt = async (buf) => buf

	const base = dirname(clResp.url)

	return {
		/** base URL of chunks */
		base,

		/** list of media chunks */
		chunks,

		/** number of media chunks */
		length: chunks.length,

		/** media bitrate */
		bitrate: bitrate || parseInt(BR_RE.exec(chunklist)?.[1]),

		/**
		 * use DRM key for decryption
		 * @param {Parameters<decryptor>[0]} key DRM key
		 */
		useKey: async (key) => {
			decrypt = await decryptor(key)
			return decrypt
		},

		/** download and decrypt media chunks */
		async *[Symbol.asyncIterator]() {
			for (const c of chunks) {
				const r = await fetch(`${base}/${c}`)
				yield await decrypt(await r.arrayBuffer())
			}
		},
	}
}
