const API_BASE = '/api'

async function request(url, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    console.error('API Error:', url, err)
    throw err
  }
}

export const getStats = () => request('/stats')
export const getCourses = (params = {}) => {
  const query = new URLSearchParams()
  if (params.grade && params.grade !== '全部年级') query.set('grade', params.grade)
  if (params.tag && params.tag.length > 0) query.set('tag', params.tag.join(','))
  if (params.search) query.set('search', params.search)
  if (params.sort) query.set('sort', params.sort)
  query.set('page', params.page || 1)
  query.set('limit', params.limit || 50)
  return request(`/courses?${query.toString()}`)
}
export const getCourse = (id) => request(`/courses/${id}`)
export const getSuggestions = () => request('/suggestions')
export const getGrades = () => request('/grades')
export const getTags = () => request('/tags')
export const generateCourse = (data) => request('/generate', { method: 'POST', body: JSON.stringify(data) })

// 下载 PPTX 文件
export const downloadPPTX = (fileName, title) => {
  const url = `${API_BASE}/download/${encodeURIComponent(fileName)}`
  const a = document.createElement('a')
  a.href = url
  a.download = `${title || '课件'}.pptx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 下载教案文件
export const downloadDoc = (fileName, title) => {
  const url = `${API_BASE}/download/${encodeURIComponent(fileName)}`
  const a = document.createElement('a')
  a.href = url
  a.download = `${title || '教案'}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// 获取二维码
export const getShareQRCode = (id) => request(`/share/qrcode/${id}`)

// 记录下载次数
export const recordDownload = (id) => request(`/courses/${id}/download`, { method: 'POST' })
