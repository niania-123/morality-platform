import PptxGenJS from 'pptxgenjs'
import path from 'path'
import fs from 'fs'
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

// ========== 预设水彩风儿童插画图片 ==========
// 使用精心挑选的免费图片，备用本地彩色形状组合

// 每个主题类型对应的水彩感图片组（来自 picsum.photos 特定图片ID）
// 这些图片已知是清新、适合儿童的图片
const WATERCOLOR_IMAGES = {
  // 按幻灯片类型，使用 picsum 特定ID（柔和色彩的自然、人物、儿童相关图片）
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

// 图片下载缓存目录
let CACHE_DIR = ''

function initCacheDir() {
  CACHE_DIR = path.join(process.cwd(), 'server', 'img-cache')
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
}

// 下载图片到本地缓存
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    const protocol = url.startsWith('https') ? https : http
    const req = protocol.get(url, { timeout: 8000 }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // 跟随重定向
        file.close()
        fs.unlinkSync(filePath)
        downloadImage(response.headers.location, filePath).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        file.close()
        fs.unlinkSync(filePath)
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      response.pipe(file)
      file.on('finish', () => { file.close(); resolve(filePath) })
    })
    req.on('error', (err) => {
      file.close()
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
      reject(err)
    })
    req.on('timeout', () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

// 获取指定幻灯片类型的图片（本地缓存 → picsum 下载 → 兜底形状）
async function getSlideImage(type, slideIndex = 0) {
  if (!CACHE_DIR) initCacheDir()

  const ids = WATERCOLOR_IMAGES[type] || WATERCOLOR_IMAGES.content
  const id = ids[slideIndex % ids.length]
  const cacheFile = path.join(CACHE_DIR, `slide_${type}_${id}.jpg`)

  // 已缓存，直接返回
  if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 1000) {
    return { type: 'file', path: cacheFile }
  }

  // 尝试下载（width:400 height:300，宽高比4:3适合PPT右侧）
  const url = `https://picsum.photos/id/${id}/400/300`
  try {
    await downloadImage(url, cacheFile)
    return { type: 'file', path: cacheFile }
  } catch (e) {
    console.warn(`图片下载失败(${id}): ${e.message}`)
    return null
  }
}

// ========== 辅助函数 ==========
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

// 在PPT中添加水彩风图片（带圆角边框装饰）
async function addWatercolorImage(slide, type, slideIndex, x, y, w, h, theme) {
  const imgResult = await getSlideImage(type, slideIndex)

  if (imgResult) {
    // 图片背景卡片（水彩纸效果）
    slide.addShape('roundRect', {
      x: x - 0.08, y: y - 0.08, w: w + 0.16, h: h + 0.16,
      fill: { color: theme.lightBg },
      shadow: { type: 'outer', blur: 8, offset: 3, color: '888888', opacity: 0.12 },
      rectRadius: 0.18,
    })
    // 插入图片
    slide.addImage({
      path: imgResult.path,
      x, y, w, h,
      rounding: true,
    })
    // 图片上方水彩感叠层（使颜色更柔和，接近水彩风格）
    slide.addShape('roundRect', {
      x, y, w, h,
      fill: { color: theme.primary, transparency: 88 },
      rectRadius: 0.15,
    })
  } else {
    // 兜底：彩色形状组合装饰块
    slide.addShape('roundRect', {
      x, y, w, h,
      fill: { color: theme.lightBg },
      shadow: { type: 'outer', blur: 6, offset: 2, color: '888888', opacity: 0.1 },
      rectRadius: 0.18,
    })
    // 装饰形状
    slide.addShape('oval', { x: x + w*0.1, y: y + h*0.1, w: w*0.5, h: w*0.5, fill: { color: theme.primary, transparency: 50 } })
    slide.addShape('oval', { x: x + w*0.4, y: y + h*0.4, w: w*0.4, h: w*0.4, fill: { color: theme.accent, transparency: 60 } })
    slide.addShape('oval', { x: x + w*0.15, y: y + h*0.5, w: w*0.3, h: w*0.3, fill: { color: theme.secondary, transparency: 55 } })
    // 中心emoji图标
    const icons = { cover:'🌈', intro:'🤔', objective:'🎯', content:'📖', activity:'🎨', interaction:'🙋', discussion:'💬', values:'🌟', exercise:'✏️', home_link:'🏠', homework:'📝', summary:'🎊' }
    slide.addText(icons[type] || '📚', {
      x, y: y + h*0.3, w, h: h*0.4,
      fontSize: 52, align: 'center', valign: 'middle',
    })
  }
}

// ========== 封面页 ==========
async function createCoverSlide(ppt, topic, grade, theme, imageKeyword) {
  const s = ppt.addSlide()
  s.background = { fill: theme.bg }

  // 顶部装饰圆
  s.addShape('oval', { x: -0.8, y: -0.8, w: 3.5, h: 3.5, fill: { color: theme.primary, transparency: 90 } })
  s.addShape('oval', { x: 7.5, y: 0.2, w: 2.8, h: 2.8, fill: { color: theme.accent, transparency: 92 } })
  s.addShape('oval', { x: -0.5, y: 3.8, w: 2, h: 2, fill: { color: theme.secondary, transparency: 94 } })

  // 右侧大图（封面用大图，更醒目）
  await addWatercolorImage(s, 'cover', 0, 5.8, 0.4, 3.8, 3.2, theme)

  // 左侧文字区
  // 标题装饰条
  s.addShape('roundRect', { x: 0.5, y: 1.6, w: 0.15, h: 1.6, fill: { color: theme.accent }, rectRadius: 0.07 })

  // 主标题
  s.addText(topic, {
    x: 0.85, y: 1.4, w: 4.8, h: 1.2,
    fontSize: 36, fontFace: 'Microsoft YaHei',
    color: theme.text, bold: true,
    valign: 'middle', wrap: true,
  })

  // 副标题
  s.addShape('roundRect', { x: 0.85, y: 2.7, w: 3.2, h: 0.5, fill: { color: theme.primary, transparency: 75 }, rectRadius: 0.12 })
  s.addText(`${grade} · 道德与法治`, {
    x: 0.85, y: 2.7, w: 3.2, h: 0.5,
    fontSize: 15, fontFace: 'Microsoft YaHei',
    color: theme.text, align: 'center', valign: 'middle',
  })

  // 底部装饰
  s.addShape('roundRect', { x: 0.85, y: 3.35, w: 4, h: 0.05, fill: { color: theme.accent, transparency: 40 }, rectRadius: 0.02 })

  // 小标语
  s.addText('🌟 快乐学习 健康成长', {
    x: 0.85, y: 3.5, w: 4, h: 0.4,
    fontSize: 12, fontFace: 'Microsoft YaHei',
    color: theme.textLight, align: 'left', valign: 'middle',
  })

  // 底部波浪装饰条
  s.addShape('roundRect', { x: 0, y: 5.05, w: 10, h: 0.45, fill: { color: theme.primary, transparency: 75 }, rectRadius: 0 })

  return s
}

// ========== 内容页（图文布局） ==========
async function createContentSlide(ppt, data, theme, slideIndex) {
  const s = ppt.addSlide()
  s.background = { fill: theme.bg }

  const type = data.type || 'content'
  const title = data.title || ''
  const content = data.content || ''

  // 标题栏
  addTitleBar(s, title, theme, 0.2)

  // 左侧文字区
  const displayText = truncateText(content, 9)
  s.addText(displayText, {
    x: 0.45, y: 1.05, w: 5.1, h: 3.6,
    fontSize: 14, fontFace: 'Microsoft YaHei',
    color: theme.text, lineSpacingMultiple: 1.35,
    valign: 'top', wrap: true,
  })

  // 右侧水彩图片
  await addWatercolorImage(s, type, slideIndex, 5.8, 1.05, 3.7, 2.85, theme)

  // 图片下方标签
  const labels = {
    intro: '🌈 今天的故事',
    objective: '🎯 学习目标',
    content: '📖 故事时间',
    activity: '🎨 活动时间',
    interaction: '🙋 一起来回答',
    discussion: '💬 讨论时间',
    values: '🌟 我们学到了',
    exercise: '✏️ 动手练习',
    home_link: '🏠 带回家',
    homework: '📝 课后任务',
    summary: '🎊 今日总结',
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

// ========== 双栏页（长内容） ==========
async function createTwoColumnSlide(ppt, data, theme, slideIndex) {
  const s = ppt.addSlide()
  s.background = { fill: theme.bg }

  addTitleBar(s, data.title || '', theme, 0.2)

  const content = data.content || ''
  const lines = content.split('\n').filter(l => l.trim())
  const mid = Math.ceil(lines.length / 2)

  // 左列卡片
  s.addShape('roundRect', { x: 0.4, y: 1.05, w: 4.4, h: 3.6, fill: { color: theme.cardBg }, shadow: { type: 'outer', blur: 6, offset: 2, color: '888888', opacity: 0.08 }, rectRadius: 0.12 })
  s.addText(truncateText(lines.slice(0, mid).join('\n'), 10), { x: 0.6, y: 1.2, w: 4.0, h: 3.3, fontSize: 13, fontFace: 'Microsoft YaHei', color: theme.text, lineSpacingMultiple: 1.3, valign: 'top', wrap: true })

  // 右列水彩图
  await addWatercolorImage(s, data.type || 'content', slideIndex, 5.1, 1.05, 4.4, 2.3, theme)

  // 右列底部文字卡片
  if (mid < lines.length) {
    s.addShape('roundRect', { x: 5.1, y: 3.45, w: 4.4, h: 1.2, fill: { color: theme.lightBg }, rectRadius: 0.1 })
    s.addText(truncateText(lines.slice(mid).join('\n'), 4), { x: 5.3, y: 3.55, w: 4.0, h: 1.0, fontSize: 12, fontFace: 'Microsoft YaHei', color: theme.text, lineSpacingMultiple: 1.2, valign: 'top', wrap: true })
  }

  addFooterDecoration(s, theme)
  s.addText(`${slideIndex}`, { x: 9.0, y: 5.1, w: 0.5, h: 0.3, fontSize: 10, color: theme.textLight, align: 'right' })

  return s
}

// ========== 结尾页 ==========
async function createEndingSlide(ppt, topic, theme, pageNum) {
  const s = ppt.addSlide()
  s.background = { fill: theme.bg }

  // 装饰圆
  s.addShape('oval', { x: 7.5, y: -0.5, w: 3, h: 3, fill: { color: theme.primary, transparency: 90 } })
  s.addShape('oval', { x: -1, y: 3, w: 2.5, h: 2.5, fill: { color: theme.secondary, transparency: 92 } })

  // 中心大图
  await addWatercolorImage(s, 'summary', pageNum, 3.2, 0.5, 3.6, 2.6, theme)

  s.addText('谢谢小朋友们！', { x: 1, y: 3.15, w: 8, h: 0.7, fontSize: 28, fontFace: 'Microsoft YaHei', color: theme.text, bold: true, align: 'center' })
  s.addText(`今天我们学习了「${topic}」`, { x: 1, y: 3.9, w: 8, h: 0.5, fontSize: 14, fontFace: 'Microsoft YaHei', color: theme.textLight, align: 'center' })
  s.addText('下次课见 🌈', { x: 1, y: 4.45, w: 8, h: 0.45, fontSize: 14, fontFace: 'Microsoft YaHei', color: theme.textLight, align: 'center' })
  s.addText(`${pageNum}`, { x: 9.0, y: 5.1, w: 0.5, h: 0.3, fontSize: 10, color: theme.textLight, align: 'right' })
}

// ========== 主生成函数 ==========

export async function generatePPTX(data) {
  const topic = data.topic || data.title || '课件'
  const grade = data.grade || ''
  const pages = data.pages || 10
  const slideData = data.slides

  initCacheDir()

  const ppt = new PptxGenJS()
  ppt.layout = 'LAYOUT_WIDE'
  ppt.author = '道德与法治课件平台'
  ppt.title = `${topic} - ${grade}`

  let allSlides = slideData || generateDefaultSlides(topic, grade, pages)

  // 封面
  await createCoverSlide(ppt, topic, grade, getTheme(0), data.imageKeyword)

  // 内容页
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

  // 结尾页
  await createEndingSlide(ppt, topic, getTheme(allSlides.length + 1), allSlides.length + 2)

  // 保存文件
  const outputDir = path.join(process.cwd(), 'server', 'output')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const safeName = topic.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_').substring(0, 20)
  const fileName = `${safeName}_${Date.now()}.pptx`
  const filePath = path.join(outputDir, fileName)
  await ppt.writeFile({ fileName: filePath })

  const stats = fs.statSync(filePath)

  return {
    fileName,
    filePath,
    fileSize: stats.size,
    slideCount: allSlides.length + 2,
  }
}

// ========== 默认幻灯片（无 AI 内容时的兜底）==========

function generateDefaultSlides(topic, grade, pageCount) {
  const short = topic.length > 6 ? topic.substring(0, 6) : topic
  const templates = [
    { type: 'intro', title: `课前暖场·${topic}`, content: `🤔 暖场提问\n小朋友们，你们在家有没有帮爸爸妈妈做过家务呢？\n做了什么？当时有什么感受？\n\n🎲 热身游戏\n「快问快答」：老师说一个生活小场景\n小朋友们快速举手说出你会怎么做！` },
    { type: 'objective', title: '今天学什么', content: `🎯 今天我们要学习：\n\n1. 了解「${short}」的意义\n2. 学会正确的做法\n3. 在生活中主动实践\n\n准备好和老师一起出发了吗？` },
    { type: 'content', title: '主题故事', content: `📖 今天的小故事\n\n小明每天早上起床，床铺总是乱乱的。\n妈妈说："自己的事情要自己做哦！"\n小明学着妈妈的样子，仔细地把被子叠整齐。\n看着整整齐齐的床，他心里特别高兴！\n\n你们觉得小明做得怎么样？` },
    { type: 'interaction', title: '想一想·说一说', content: `🙋 举手回答时间\n\n问题1：你在生活中做过「${short}」吗？\n感觉怎么样？\n\n问题2：你觉得做「${short}」难不难？\n有什么小妙招可以分享吗？\n\n勇敢说出你的想法，老师给你点赞！` },
    { type: 'activity', title: '课堂活动', content: `🎨 活动时间\n\n活动一：角色扮演 🎭\n3-4位小朋友上台，演一演关于「${short}」的小场景！\n\n活动二：主题绘画 🖌️\n画出你心目中「${short}」的样子\n贴在教室的"成长墙"上` },
    { type: 'discussion', title: '小组讨论', content: `💬 和同桌讨论2分钟：\n\n如果每个人都做到「${short}」，\n我们的班级会变成什么样？\n我们的家会变成什么样？\n\n每组派一个代表来分享！` },
    { type: 'values', title: '我们学到了', content: `🌟 今天的收获\n\n「${short}」是一种很棒的品质\n\n从小养成好习惯\n就像小树苗有了肥沃的土壤 🌱\n会越来越茁壮成长！\n\n我们从今天开始，一起做吧！` },
    { type: 'exercise', title: '动手练一练', content: `✏️ 小练习时间\n\n练习1：判断对错\n老师说场景，对的举手✋，错的摇头🙅\n\n练习2：完成一句话\n「我学到了___，以后我要___」\n\n练习3：给同学点赞\n找一位做得好的同学，给他一个大拇指👍` },
    { type: 'home_link', title: '带回家的任务', content: `🏠 今天的家庭任务\n\n把今天学到的「${short}」告诉爸爸妈妈！\n\n亲子互动：\n和爸爸妈妈一起做一件关于「${short}」的事\n把你们的成果拍照或画下来\n明天带到学校分享！` },
    { type: 'summary', title: '今天总结', content: `🎊 今天的学习总结\n\n✅ 我们知道了「${short}」是什么\n✅ 学会了怎么做\n✅ 以后要在生活中坚持做\n\n每个小朋友今天都很棒！\n给自己一个大大的 👍 吧！` },
  ]
  const result = []
  for (let i = 0; i < pageCount; i++) result.push(templates[i % templates.length])
  return result
}
