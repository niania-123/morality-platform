// PPTX Buffer 生成器 - 不依赖文件系统，用于 Vercel Serverless
import PptxGenJS from 'pptxgenjs'
import https from 'https'
import http from 'http'

// ========== 水彩主题配色 ==========
const THEMES = [
  {
    name: '樱花粉',
    bg: 'FFF5F5', primary: 'F8A4B8', accent: 'FF6B8A', secondary: 'FFB3C6',
    text: '5A3E4B', textLight: '8B6E7B', lightBg: 'FFF0F3', cardBg: 'FFFFFF',
  },
  {
    name: '薄荷绿',
    bg: 'F0FAF4', primary: '7DC9A0', accent: '4CAF7D', secondary: 'A8E6C1',
    text: '3D5A4E', textLight: '6B8F7B', lightBg: 'E8F8F0', cardBg: 'FFFFFF',
  },
  {
    name: '天空蓝',
    bg: 'F0F7FF', primary: '7EB8E0', accent: '5199D4', secondary: 'A8D4F5',
    text: '3D4E5A', textLight: '6B7F8F', lightBg: 'E6F0FA', cardBg: 'FFFFFF',
  },
]

const WATERCOLOR_IMAGES = {
  cover:      [1041, 106, 128, 119, 167, 237, 292, 218],
  intro:      [669, 684, 703, 715, 736, 754],
  objective:  [416, 445, 452, 461, 480, 495],
  content:    [525, 534, 543, 550, 563, 571],
  activity:   [581, 596, 607, 617, 624, 635],
  interaction:[645, 657, 663, 678, 689, 694],
  discussion: [700, 712, 718, 726, 732, 741],
  values:     [748, 756, 765, 771, 780, 788],
  exercise:   [793, 802, 811, 815, 826, 835],
  home_link:  [840, 846, 851, 860, 873, 882],
  homework:   [892, 905, 914, 920, 929, 934],
  summary:    [938, 945, 951, 960, 969, 978],
}

function getTheme(slideIndex) {
  return THEMES[slideIndex % THEMES.length]
}

function truncateText(text, maxLines) {
  if (!text) return text
  const lines = text.split('\n')
  if (lines.length <= maxLines) return text
  return lines.slice(0, maxLines).join('\n')
}

function addTitleBar(slide, title, theme, yPos) {
  slide.addShape('roundRect', {
    x: 0.4, y: yPos, w: 9.2, h: 0.65,
    fill: { color: theme.primary, transparency: 80 },
    rectRadius: 0.12,
  })
  slide.addText(title, {
    x: 0.6, y: yPos + 0.04, w: 8.8, h: 0.57,
    fontSize: 20, fontFace: 'Microsoft YaHei',
    color: theme.text, bold: true,
    valign: 'middle',
  })
}

function addFooterDecoration(slide, theme) {
  const colors = [theme.primary, theme.accent, theme.secondary, theme.primary]
  colors.forEach((c, i) => {
    slide.addShape('oval', {
      x: 3.5 + i * 0.7, y: 5.15, w: 0.2, h: 0.2,
      fill: { color: c, transparency: 30 },
    })
  })
}

// 下载图片到Buffer
function downloadImageBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const req = protocol.get(url, { timeout: 8000 }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImageBuffer(response.headers.location).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      const chunks = []
      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => resolve(Buffer.concat(chunks)))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

// 获取图片Buffer（不缓存到文件系统）
async function getSlideImageBuffer(type, slideIndex = 0) {
  const ids = WATERCOLOR_IMAGES[type] || WATERCOLOR_IMAGES.content
  const id = ids[slideIndex % ids.length]
  const url = `https://picsum.photos/id/${id}/400/300`
  try {
    const buffer = await downloadImageBuffer(url)
    return { type: 'buffer', buffer }
  } catch (e) {
    console.warn(`图片下载失败(${id}): ${e.message}`)
    return null
  }
}

async function addWatercolorImage(slide, type, slideIndex, x, y, w, h, theme) {
  const imgResult = await getSlideImageBuffer(type, slideIndex)

  if (imgResult) {
    slide.addShape('roundRect', {
      x: x - 0.08, y: y - 0.08, w: w + 0.16, h: h + 0.16,
      fill: { color: theme.lightBg },
      shadow: { type: 'outer', blur: 8, offset: 3, color: '888888', opacity: 0.12 },
      rectRadius: 0.18,
    })
    slide.addImage({
      data: imgResult.buffer.toString('base64'),
      x, y, w, h,
      rounding: true,
    })
    slide.addShape('roundRect', {
      x, y, w, h,
      fill: { color: theme.primary, transparency: 88 },
      rectRadius: 0.15,
    })
  } else {
    slide.addShape('roundRect', {
      x, y, w, h,
      fill: { color: theme.lightBg },
      shadow: { type: 'outer', blur: 6, offset: 2, color: '888888', opacity: 0.1 },
      rectRadius: 0.18,
    })
    slide.addShape('oval', { x: x + w*0.1, y: y + h*0.1, w: w*0.5, h: w*0.5, fill: { color: theme.primary, transparency: 50 } })
    slide.addShape('oval', { x: x + w*0.4, y: y + h*0.4, w: w*0.4, h: w*0.4, fill: { color: theme.accent, transparency: 60 } })
    slide.addShape('oval', { x: x + w*0.15, y: y + h*0.5, w: w*0.3, h: w*0.3, fill: { color: theme.secondary, transparency: 55 } })
    const icons = { cover:'🌈', intro:'🤔', objective:'🎯', content:'📖', activity:'🎨', interaction:'🙋', discussion:'💬', values:'🌟', exercise:'✏️', home_link:'🏠', homework:'📝', summary:'🎊' }
    slide.addText(icons[type] || '📚', {
      x, y: y + h*0.3, w, h: h*0.4,
      fontSize: 52, align: 'center', valign: 'middle',
    })
  }
}

async function createCoverSlide(ppt, topic, grade, theme) {
  const s = ppt.addSlide()
  s.background = { fill: theme.bg }
  s.addShape('oval', { x: -0.8, y: -0.8, w: 3.5, h: 3.5, fill: { color: theme.primary, transparency: 90 } })
  s.addShape('oval', { x: 7.5, y: 0.2, w: 2.8, h: 2.8, fill: { color: theme.accent, transparency: 92 } })
  s.addShape('oval', { x: -0.5, y: 3.8, w: 2, h: 2, fill: { color: theme.secondary, transparency: 94 } })
  await addWatercolorImage(s, 'cover', 0, 5.8, 0.4, 3.8, 3.2, theme)
  s.addShape('roundRect', { x: 0.5, y: 1.6, w: 0.15, h: 1.6, fill: { color: theme.accent }, rectRadius: 0.07 })
  s.addText(topic, {
    x: 0.85, y: 1.4, w: 4.8, h: 1.2,
    fontSize: 36, fontFace: 'Microsoft YaHei',
    color: theme.text, bold: true,
    valign: 'middle', wrap: true,
  })
  s.addShape('roundRect', { x: 0.85, y: 2.7, w: 3.2, h: 0.5, fill: { color: theme.primary, transparency: 75 }, rectRadius: 0.12 })
  s.addText(`${grade} · 道德与法治`, {
    x: 0.85, y: 2.7, w: 3.2, h: 0.5,
    fontSize: 15, fontFace: 'Microsoft YaHei',
    color: theme.text, align: 'center', valign: 'middle',
  })
  s.addShape('roundRect', { x: 0.85, y: 3.35, w: 4, h: 0.05, fill: { color: theme.accent, transparency: 40 }, rectRadius: 0.02 })
  s.addText('🌟 快乐学习 健康成长', {
    x: 0.85, y: 3.5, w: 4, h: 0.4,
    fontSize: 12, fontFace: 'Microsoft YaHei',
    color: theme.textLight, align: 'left', valign: 'middle',
  })
  s.addShape('roundRect', { x: 0, y: 5.05, w: 10, h: 0.45, fill: { color: theme.primary, transparency: 75 }, rectRadius: 0 })
  return s
}

async function createContentSlide(ppt, data, theme, slideIndex) {
  const s = ppt.addSlide()
  s.background = { fill: theme.bg }
  const type = data.type || 'content'
  const title = data.title || ''
  const content = data.content || ''
  addTitleBar(s, title, theme, 0.2)
  const displayText = truncateText(content, 9)
  s.addText(displayText, {
    x: 0.45, y: 1.05, w: 5.1, h: 3.6,
    fontSize: 14, fontFace: 'Microsoft YaHei',
    color: theme.text, lineSpacingMultiple: 1.35,
    valign: 'top', wrap: true,
  })
  await addWatercolorImage(s, type, slideIndex, 5.8, 1.05, 3.7, 2.85, theme)
  const labels = {
    intro: '🌈 今天的故事', objective: '🎯 学习目标', content: '📖 故事时间',
    activity: '🎨 活动时间', interaction: '🙋 一起来回答', discussion: '💬 讨论时间',
    values: '🌟 我们学到了', exercise: '✏️ 动手练习', home_link: '🏠 带回家',
    homework: '📝 课后任务', summary: '🎊 今日总结',
  }
  const label = labels[type]
  if (label) {
    s.addShape('roundRect', { x: 5.8, y: 4.0, w: 3.7, h: 0.4, fill: { color: theme.primary, transparency: 72 }, rectRadius: 0.1 })
    s.addText(label, { x: 5.8, y: 4.0, w: 3.7, h: 0.4, fontSize: 12, fontFace: 'Microsoft YaHei', color: theme.text, align: 'center', valign: 'middle' })
  }
  addFooterDecoration(s, theme)
  s.addText(`${slideIndex}`, { x: 9.0, y: 5.1, w: 0.5, h: 0.3, fontSize: 10, color: theme.textLight, align: 'right' })
  return s
}

async function createTwoColumnSlide(ppt, data, theme, slideIndex) {
  const s = ppt.addSlide()
  s.background = { fill: theme.bg }
  addTitleBar(s, data.title || '', theme, 0.2)
  const content = data.content || ''
  const lines = content.split('\n').filter(l => l.trim())
  const mid = Math.ceil(lines.length / 2)
  s.addShape('roundRect', { x: 0.4, y: 1.05, w: 4.4, h: 3.6, fill: { color: theme.cardBg }, shadow: { type: 'outer', blur: 6, offset: 2, color: '888888', opacity: 0.08 }, rectRadius: 0.12 })
  s.addText(truncateText(lines.slice(0, mid).join('\n'), 10), { x: 0.6, y: 1.2, w: 4.0, h: 3.3, fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.text, lineSpacingMultiple: 1.3, valign: 'top', wrap: true })
  await addWatercolorImage(s, data.type || 'content', slideIndex, 5.1, 1.05, 4.4, 2.3, theme)
  if (mid < lines.length) {
    s.addShape('roundRect', { x: 5.1, y: 3.45, w: 4.4, h: 1.2, fill: { color: theme.lightBg }, rectRadius: 0.1 })
    s.addText(truncateText(lines.slice(mid).join('\n'), 4), { x: 5.3, y: 3.55, w: 4.0, h: 1.0, fontSize: 12, fontFace: 'Microsoft YaHei', color: theme.text, lineSpacingMultiple: 1.2, valign: 'top', wrap: true })
  }
  addFooterDecoration(s, theme)
  s.addText(`${slideIndex}`, { x: 9.0, y: 5.1, w: 0.5, h: 0.3, fontSize: 10, color: theme.textLight, align: 'right' })
  return s
}

async function createEndingSlide(ppt, topic, theme, pageNum) {
  const s = ppt.addSlide()
  s.background = { fill: theme.bg }
  s.addShape('oval', { x: 7.5, y: -0.5, w: 3, h: 3, fill: { color: theme.primary, transparency: 90 } })
  s.addShape('oval', { x: -1, y: 3, w: 2.5, h: 2.5, fill: { color: theme.secondary, transparency: 92 } })
  await addWatercolorImage(s, 'summary', pageNum, 3.2, 0.5, 3.6, 2.6, theme)
  s.addText('谢谢小朋友们！', { x: 1, y: 3.15, w: 8, h: 0.7, fontSize: 28, fontFace: 'Microsoft YaHei', color: theme.text, bold: true, align: 'center' })
  s.addText(`今天我们学习了「${topic}」`, { x: 1, y: 3.9, w: 8, h: 0.5, fontSize: 14, fontFace: 'Microsoft YaHei', color: theme.textLight, align: 'center' })
  s.addText('下次课见 🌈', { x: 1, y: 4.45, w: 8, h: 0.45, fontSize: 14, fontFace: 'Microsoft YaHei', color: theme.textLight, align: 'center' })
  s.addText(`${pageNum}`, { x: 9.0, y: 5.1, w: 0.5, h: 0.3, fontSize: 10, color: theme.textLight, align: 'right' })
}

// ========== 默认幻灯片 ==========
function generateDefaultSlides(topic, grade, pageCount) {
  const short = topic.length > 6 ? topic.substring(0, 6) : topic
  return Array.from({ length: pageCount }, (_, i) => ({
    slideNum: i + 1,
    type: ['content', 'activity', 'interaction', 'discussion', 'values'][i % 5],
    title: `${short}·第${i + 1}部分`,
    content: `这里是关于「${topic}」的内容...`,
    topic,
    note: `「${topic}」第${i + 1}页教师备注`,
  }))
}

// ========== 主生成函数（返回 Buffer）==========
export async function generatePPTXBuffer(data) {
  const topic = data.topic || data.title || '课件'
  const grade = data.grade || ''
  const slideData = data.slides

  const ppt = new PptxGenJS()
  ppt.layout = 'LAYOUT_WIDE'
  ppt.author = '道德与法治课件平台'
  ppt.title = `${topic} - ${grade}`

  let allSlides = slideData || generateDefaultSlides(topic, grade, data.pages || 10)

  await createCoverSlide(ppt, topic, grade, getTheme(0))

  for (let idx = 0; idx < allSlides.length; idx++) {
    const slide = allSlides[idx]
    const theme = getTheme(idx + 1)
    const contentLen = (slide.content || '').length
    if (contentLen > 220) {
      await createTwoColumnSlide(ppt, slide, theme, idx + 2)
    } else {
      await createContentSlide(ppt, slide, theme, idx + 2)
    }
  }

  await createEndingSlide(ppt, topic, getTheme(allSlides.length + 1), allSlides.length + 2)

  // 生成 Buffer
  const buffer = await ppt.write({ outputType: 'nodebuffer' })

  return {
    fileName: `${topic.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 20)}_${Date.now()}.pptx`,
    buffer,
    fileSize: buffer.length,
    slideCount: allSlides.length + 2,
  }
}
