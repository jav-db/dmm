const credentials = 'include'

/**
 * @param {Record<string, string | number>} params
 */
export const API = (params) => fetch(`/service/digitalapi/-/html5`, {
	method: 'POST', credentials,
	headers: { 'content-type': 'application/json' },
	body: JSON.stringify({ format: 'json', ...params }),
}).then((r) => r.json())

/**
 * @param {string} action
 * @param {Record<string, string | number>} opts
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
	const res = await fetch(`/service/-/drm_iphone?${qs}`, { credentials })
	return await res.arrayBuffer()
}

export class DMMError extends Error {
	constructor(resp) {
		super(resp.message)
		this.code = resp.code
	}
}
