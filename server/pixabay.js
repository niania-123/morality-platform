/**
 * Pixabay 免费插图搜索模块
 * 使用 Pixabay API 根据关键词搜索儿童风格插画
 * 免费额度：每月 5000 次请求
 */

import https from 'https'

// Pixabay API Key（免费注册获取）
// 注册地址：https://pixabay.com/api/docs/
const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY || ''

// 幻灯片类型 → 英文搜索关键词映射（用 vector 类型确保搜出来都是插画）
const SLIDE_TYPE_KEYWORDS = {
  cover: 'children cute cartoon happy kids playing',
  intro: 'school classroom children friends learning',
  objective: 'learning goal target star achievement kids reward',
  content: null, // 动态根据 topic 生成
  activity: 'kids playing activity fun children outdoor',
  interaction: 'children raising hands classroom question',
  discussion: 'children talking discussion group friends',
  values: 'children friendship love heart sharing',
  exercise: 'children writing homework practice study',
  home_link: 'family home parent child together happy',
  homework: 'homework calendar checkmark kids school',
  summary: 'children celebration award success star',
}

// 常见中文主题词 → 英文搜索词（去掉 illustration 后缀，vector 模式自动返回插画）
const TOPIC_KEYWORDS = {
  '叠被子': 'child making bed blanket pillow bedroom morning',
  '整理书包': 'child organizing school bag books tidy',
  '洗手': 'child washing hands soap water hygiene',
  '刷牙': 'child brushing teeth dental hygiene bathroom',
  '早起': 'child morning wake up alarm clock sun',
  '早睡': 'child sleeping bed night moon stars dream',
  '排队': 'children standing in line queue school',
  '穿衣': 'child getting dressed clothes wardrobe',
  '洗袜': 'child washing socks laundry clean',
  '叠衣': 'child folding clothes tidy neat closet',
  '礼貌': 'children polite greeting bow respect',
  '分享': 'children sharing toys food together',
  '诚实': 'child honest truth telling character',
  '勇敢': 'child brave courage adventure hero',
  '友谊': 'children friendship hugging playing together',
  '环保': 'children recycling environment nature green',
  '规则': 'children following rules signs school',
  '安全': 'child safety traffic crosswalk road',
  '感恩': 'child thankful grateful heart family parent',
  '尊重': 'children respecting elders helping care',
}

/**
 * 搜索 Pixabay 图片
 * @param {string} query - 搜索关键词（英文）
 * @param {object} opts - 可选参数
 * @returns {Promise<{imageUrl: string, tags: string[], fullData: object}|null>}
 */
export function searchPixabay(query, opts = {}) {
  if (!PIXABAY_API_KEY) {
    console.log('⚠️  未设置 PIXABAY_API_KEY，跳过图片搜索')
    return Promise.resolve(null)
  }

  return new Promise((resolve) => {
    const params = new URLSearchParams({
      key: PIXABAY_API_KEY,
      q: query,
      image_type: 'vector',        // 矢量插画，确保都是插画而非照片
      safesearch: 'true',
      per_page: '3',
      orientation: opts.orientation || 'horizontal',
      min_width: '400',
      min_height: '300',
    })

    const url = `https://pixabay.com/api/?${params}`

    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.totalHits > 0 && json.hits?.length > 0) {
            const hit = json.hits[0]
            resolve({
              imageUrl: hit.largeImageURL || hit.webformatURL,
              thumbnailUrl: hit.previewURL,
              tags: hit.tags?.split(',').map(t => t.trim()) || [],
              fullData: hit,
            })
          } else {
            console.log(`📭 Pixabay 无结果：「${query}」`)
            resolve(null)
          }
        } catch (e) {
          console.error('❌ Pixabay 解析失败:', e.message)
          resolve(null)
        }
      })
    }).on('error', (e) => {
      console.error('❌ Pixabay 请求失败:', e.message)
      resolve(null)
    })
  })
}

/**
 * 根据幻灯片类型和主题，构建搜索关键词
 */
export function buildSearchQuery(type, topic = '') {
  // content 类型：根据中文主题词映射
  if (type === 'content' && topic) {
    // 先尝试精确匹配主题词
    for (const [cn, en] of Object.entries(TOPIC_KEYWORDS)) {
      if (topic.includes(cn)) return en
    }
    // 没有匹配的主题词，用通用词
    return `children education ${type} school learning`
  }

  // 其他类型：用预设关键词
  return SLIDE_TYPE_KEYWORDS[type] || 'children education school learning cute'
}

/**
 * 批量获取幻灯片配图
 * @param {Array} slides - 幻灯片数组 [{type, topic}]
 * @returns {Promise<Map>} type → imageUrl 的映射
 */
export async function fetchSlideImages(slides) {
  const imageMap = new Map()
  if (!PIXABAY_API_KEY) return imageMap

  // 去重：相同 type+topic 只搜索一次
  const searched = new Set()

  for (const slide of slides) {
    const key = `${slide.type}:${slide.topic || ''}`
    if (searched.has(key)) continue
    searched.add(key)

    const query = buildSearchQuery(slide.type, slide.topic)
    const result = await searchPixabay(query)

    if (result) {
      imageMap.set(key, result.imageUrl)
      console.log(`🖼️  配图成功 [${slide.type}]: ${query}`)
      // 稍微延迟，避免频率限制
      await new Promise(r => setTimeout(r, 200))
    }
  }

  return imageMap
}
