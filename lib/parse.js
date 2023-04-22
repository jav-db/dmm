export const CID_RE = /cid=([^\/]+)/
export const PAGE_RE = /page=(\d+)/
export const COUNT_RE = /(\d+)タイトル中/
export const ARTICLE_RE = /article=([^\/]+)\/id=([^\/]+)/

/**
 * @param {Document} doc
 * @param {string} sel
 * @return {NodeListOf<HTMLAnchorElement>}
 */
export const selectAnchors = (doc, sel) => doc.querySelectorAll(sel)

/**
 * @param {Document} doc
 * @param {string} sel
 * @return {string}
 */
export const selectText = (doc, sel) => doc.querySelector(sel)?.innerText ?? ''

/**
 * @param {Document} doc
 * @param {Record<string, string>} [opts]
 */
export const parseMeta = (doc, opts) => {
	const pageSel = opts?.pageSel ?? 'div.list-boxpagenation'
	const nameSel = opts?.nameSel ?? 'p.headwithelem span'

	const pg = new Set()
	for (const a of selectAnchors(doc, `${pageSel} a`)) {
		pg.add(parseInt(PAGE_RE.exec(a.href)?.[1]))
	}

	const countM = COUNT_RE.exec(selectText(doc, `${pageSel} p`))
	const name = selectText(nameSel).split('&nbsp;&gt;&nbsp;').at(-1)

	return {
		...(name ? { name } : null),
		count: parseInt(countM?.[1]) || 0,
		pages: pg.size ? Math.max(...pg) : 1,
	}
}
