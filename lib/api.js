export const resetFetch = () => {
	const fr = document.createElement('iframe')
	fr.style = 'display:none'
	const ft = document.body.appendChild(fr).contentWindow.fetch
	globalThis.fetch = ft
	return ft
}

/**
 * @template T
 * @param {Record<string, string | number>} params
 * @return {Promise<T>}
 */
export const API = async (params) => {
	const res = await fetch(`/service/digitalapi/-/html5`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ format: 'json', ...params }),
	})
	return await res.json()
}

/**
 * @template T
 * @param {string} action
 * @param {Record<string, string | number>} opts
 * @return {Promise<T>}
 */
export const shopAPI = async (action, opts) => {
	const res = await API({ action, ...opts })
	if (res.code) throw new DMMError(res)
	return res.list.item
}

/**
 * @param {string} ld
 */
export const getDRM = async (ld, luid = 'cojp') => {
	const qs = new URLSearchParams({ ld, luid })
	const res = await fetch(`/service/-/drm_iphone?${qs}`, {
		credentials: 'include',
	})
	return await res.arrayBuffer()
}

export class DMMError extends Error {
	/** @param {{ message?: string, code?: unknown }} resp */
	constructor(resp) {
		super(resp.message)
		this.code = resp.code
	}
}
