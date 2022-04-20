/** @type {(s: string) => Document} */
let parseHTML = () => null

try {
	const parser = new DOMParser()
	parseHTML = (str) => parser.parseFromString(str, 'text/html')
} catch (err) {
}

const COUNT_RE = /(\d+)タイトル中/
const ARTICLE_RE = /article=([^\/]+)\/id=([^\/]+)/

export const CID_RE = /cid=([^\/]+)/
export const PAGE_RE = /page=(\d+)/

/**
 * @param {string} path
 */
export const getPage = async (path) => {
	const resp = await fetch(path)
	return parseHTML(await resp.text())
}

/**
 * @param {Document} doc
 */
export function* parseMakersPage(doc) {
	for (const a of doc.querySelectorAll('td.header a')) {
		const m = ARTICLE_RE.exec(a.href)?.[2]
		if (!m) continue
		yield {
			id: parseInt(m) || m,
			name: a.innerText.trim(),
		}
	}
}

/**
 * @param {Document} doc
 */
export function* parseArticlePage(doc, meta = false) {
	if (meta) {
		const pg = new Set()
		for (const a of doc.querySelectorAll('div.list-boxpagenation a')) {
			pg.add(parseInt(PAGE_RE.exec(a.href)?.[1]))
		}
		const countM = COUNT_RE.exec(doc.querySelector('div.list-boxpagenation p')?.innerText || '')
		const name = doc.querySelector('p.headwithelem span').innerHTML.split('&nbsp;&gt;&nbsp;').at(-1)
		yield {
			meta: {
				name,
				count: parseInt(countM?.[1]) || 0,
				pages: pg.size ? Math.max(...pg) : 1,
			},
		}
	}

	for (const a of doc.querySelectorAll('p.ttl a')) {
		const { pathname: url } = new URL(a.href)
		yield {
			video: {
				url,
				cid: CID_RE.exec(url)?.[1],
				title: a.innerText.trim(),
			},
		}
	}
}

/**
 * @param {Document} doc
 */
export const parseVideoPage = (doc) => {
	/** @type {Map<string, string>} */
	const info = new Map()
	for (const tr of doc.querySelectorAll('div.inner-productInfo-column table tr')) {
		const [a, b] = tr.querySelectorAll('td')
		info.set(a.innerText.trim().slice(0, -1), b.innerHTML.trim())
	}
	return info
}

/** @param {typeof parseHTML} p */
export const useParser = (p) => {
	parseHTML = p
}
