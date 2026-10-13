export function client(token = process.env.GH_TOKEN) {
  if (!token) throw new Error('GH_TOKEN is required; never put tokens in documents or arguments.');
  return async function api(path, { method = 'GET', body } = {}) {
    const response = await fetch(`https://api.github.com${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) throw new Error(`GitHub ${method} ${path}: ${response.status} ${data?.message || 'request failed'}`);
    return data;
  };
}

export async function paginate(api, path, key) {
  const result = [];
  for (let page = 1; page <= 100; page++) {
    const data = await api(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    const items = key ? data[key] : data;
    result.push(...items);
    if (items.length < 100) return result;
  }
  throw new Error('Pagination limit reached; refusing incomplete evidence.');
}
