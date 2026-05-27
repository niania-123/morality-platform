import express from 'express'
import cors from 'cors'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { generateCourseContent } from './ai-generator.js'
import { generatePPTX } from './ppt-generator.js'
import { generateAllImages } from './image-generator.js'
import { generateShareQRCode } from './qr-generator.js'
import { generateTeachingPlan } from './doc-generator.js'
import { fetchSlideImages } from './pixabay.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001

const OUTPUT_DIR = join(__dirname, 'output')
const IMAGES_DIR = join(__dirname, 'images')
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })
if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true })

app.use(cors())
app.use(express.json({ limit: '10mb' }))

function getCourses() {
  return JSON.parse(readFileSync(join(__dirname, 'db/courses.json'), 'utf-8'))
}
function saveCourses(courses) {
  writeFileSync(join(__dirname, 'db/courses.json'), JSON.stringify(courses, null, 2), 'utf-8')
}

// ===== 基础 API =====

app.get('/api/stats', (req, res) => {
  const courses = getCourses()
  res.json({
    totalCourses: courses.length,
    totalDownloads: courses.reduce((sum, c) => sum + c.downloads, 0),
    newCount: courses.filter(c => c.isNew).length,
    hotCount: courses.filter(c => c.isHot).length,
    competencies: 5, templates: 6, genSpeed: '30s',
  })
})

app.get('/api/courses', (req, res) => {
  const { grade, tag, search, sort, page = 1, limit = 20 } = req.query
  let courses = getCourses()
  if (grade && grade !== '全部年级') courses = courses.filter(c => c.grade === grade)
  if (tag) { const tags = tag.split(','); courses = courses.filter(c => tags.some(t => c.tags.includes(t))) }
  if (search) { const q = search.toLowerCase(); courses = courses.filter(c => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.grade.includes(q)) }
  if (sort === '最新') courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  else if (sort === '热门') courses.sort((a, b) => b.downloads - a.downloads)
  const total = courses.length
  const start = (parseInt(page) - 1) * parseInt(limit)
  res.json({ courses: courses.slice(start, start + parseInt(limit)), pagination: { page: parseInt(page), limit: parseInt(limit), total } })
})

app.get('/api/courses/:id', (req, res) => {
  const courses = getCourses()
  const course = courses.find(c => c.id === parseInt(req.params.id))
  if (!course) return res.status(404).json({ error: '课件不存在' })
  res.json(course)
})

app.get('/api/suggestions', (req, res) => {
  const courses = getCourses()
  const suggestions = {}
  courses.forEach(c => { if (!suggestions[c.grade]) suggestions[c.grade] = []; suggestions[c.grade].push({ title: c.title, emoji: c.emoji, desc: c.desc }) })
  res.json(suggestions)
})

app.get('/api/grades', (req, res) => {
  const courses = getCourses()
  const grades = [...new Set(courses.map(c => c.grade))]
  res.json(grades.map(g => ({ name: g, count: courses.filter(c => c.grade === g).length, emoji: g.includes('一') ? '🌸' : '🌈' })))
})

app.get('/api/tags', (req, res) => {
  res.json([
    { key: 'morality', label: '🧡 道德修养', color: 'coral' },
    { key: 'law', label: '💜 法治观念', color: 'purple' },
    { key: 'personality', label: '💚 健全人格', color: 'green' },
    { key: 'responsibility', label: '💛 责任意识', color: 'yellow' },
    { key: 'citizenship', label: '💙 公民意识', color: 'blue' },
  ])
})

// ===== AI 生成课件 =====
app.post('/api/generate', async (req, res) => {
  const { topic, grade, pages = 12, options = {} } = req.body
  if (!topic) return res.status(400).json({ error: '请输入选题' })

  try {
    console.log(`\n🎨 开始生成课件：「${topic}」 ${grade} ${pages}页`)
    const courseContent = await generateCourseContent(topic, grade, pages, options)
    console.log(`✅ 内容生成完成，共 ${courseContent.slides.length} 页`)

    // 获取 Pixabay 配图（如有 API Key）
    console.log('🖼️  正在获取配图...')
    const imageMap = await fetchSlideImages(courseContent.slides)
    if (imageMap.size > 0) {
      courseContent.slides.forEach(slide => {
        const key = `${slide.type}:${slide.topic || ''}`
        const imgUrl = imageMap.get(key)
        if (imgUrl) slide.imageUrl = imgUrl
      })
      console.log(`✅ 已获取 ${imageMap.size} 张配图`)
    } else {
      console.log('ℹ️  未获取配图（未设置 PIXABAY_API_KEY 或无搜索结果），将使用内置SVG插图')
    }

    // 生成 PPTX
    console.log('⏳ 正在生成 PPTX 文件...')
    const pptxResult = await generatePPTX(courseContent)
    console.log(`✅ PPTX 已生成：${pptxResult.fileName} (${Math.round(pptxResult.fileSize/1024)}KB)`)

    // 生成教案
    let docResult = null
    if (options.doc !== false) {
      docResult = generateTeachingPlan({ ...courseContent, grade, title: courseContent.title || topic })
      console.log(`✅ 教案已生成：${docResult.fileName}`)
    }

    // 保存到数据库
    const courses = getCourses()
    const tagLabels = { morality: '🧡 道德修养', law: '💜 法治观念', personality: '💚 健全人格', responsibility: '💛 责任意识', citizenship: '💙 公民意识' }
    const newCourse = {
      id: Date.now(),
      title: courseContent.title || topic,
      grade, semester: grade.includes('下') ? '下' : '上', volume: grade.includes('下') ? '下册' : '上册',
      emoji: '✨', pages: courseContent.slides.length,
      tags: courseContent.tags || ['morality', 'personality'],
      tagLabels: (courseContent.tags || []).map(t => tagLabels[t] || t),
      desc: `AI 生成课件：${topic}`, isNew: true, isHot: false, downloads: 0,
      createdAt: new Date().toISOString(),
      fileUrl: `/api/download/${pptxResult.fileName}`, fileName: pptxResult.fileName,
      docFileName: docResult?.fileName || null, docFileUrl: docResult ? `/api/download/${docResult.fileName}` : null,
      generatedByAI: true,
      hasIntroCard: options.intro !== false && !!courseContent.introCard,
      hasDoc: options.doc !== false && !!docResult,
      hasTags: options.tags !== false,
      slides: courseContent.slides, introCard: courseContent.introCard,
    }
    courses.unshift(newCourse)
    saveCourses(courses)
    console.log(`✅ 已保存到课件库`)

    res.json({ success: true, course: newCourse, message: '课件生成成功' })
  } catch (err) {
    console.error('❌ 生成失败:', err)
    res.status(500).json({ error: `生成失败：${err.message}` })
  }
})

// ===== 下载 PPTX / 教案 =====
app.get('/api/download/:fileName', (req, res) => {
  // 先在 output 目录找，再在 images 目录找
  const filePath = join(OUTPUT_DIR, req.params.fileName)
  if (existsSync(filePath)) return res.download(filePath)
  res.status(404).json({ error: '文件不存在' })
})

// ===== 二维码分享 =====
app.get('/api/share/qrcode/:id', async (req, res) => {
  try {
    const courses = getCourses()
    const course = courses.find(c => c.id === parseInt(req.params.id))
    if (!course) return res.status(404).json({ error: '课件不存在' })
    const qr = await generateShareQRCode(course.id, course.title)
    res.json(qr)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 图片搜索 =====
app.get('/api/images/search', async (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: '请输入搜索关键词' })
  try {
    const { searchPixabay } = await import('./pixabay.js')
    const result = await searchPixabay(q)
    if (!result) return res.json({ success: true, images: [] })
    res.json({ success: true, images: [result] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ===== 图片服务 =====
app.use('/images', express.static(IMAGES_DIR))
app.use('/output', express.static(OUTPUT_DIR))

// ===== 课件下载计数 =====
app.post('/api/courses/:id/download', (req, res) => {
  const courses = getCourses()
  const idx = courses.findIndex(c => c.id === parseInt(req.params.id))
  if (idx === -1) return res.status(404).json({ error: '课件不存在' })
  courses[idx].downloads = (courses[idx].downloads || 0) + 1
  saveCourses(courses)
  res.json({ success: true, downloads: courses[idx].downloads })
})

app.listen(PORT, () => {
  console.log(`\n🚀 后端 API 服务已启动: http://localhost:${PORT}`)
  console.log(`📚 课件接口: /api/courses`)
  console.log(`✨ 生成接口: /api/generate`)
  console.log(`📥 下载接口: /api/download/:fileName`)
  console.log(`📱 二维码: /api/share/qrcode/:id`)
  console.log(`\n💡 设置 OPENAI_API_KEY 启用 GPT AI + DALL-E 配图\n`)
})
