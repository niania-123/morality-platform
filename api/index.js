// Vercel Serverless Function 入口
const express = require('express')
const cors = require('cors')
const { generateCourseContent } = require('../server/ai-generator.js')
const { generatePPTXBuffer } = require('../server/ppt-generator-buffer.js')
const { generateTeachingPlanBuffer } = require('../server/doc-generator-buffer.js')
const { fetchSlideImages } = require('../server/pixabay.js')
const { generateShareQRCode } = require('../server/qr-generator.js')
const {
  getCourses, addCourse, findCourse, updateCourse,
  storeFile, getFile, initStore
} = require('../server/vercel-store.js')

const app = express()
initStore()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

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
  if (search) { const q = search.toLowerCase(); courses = courses.filter(c => c.title.toLowerCase().includes(q) || (c.desc || '').toLowerCase().includes(q) || c.grade.includes(q)) }
  if (sort === '最新') courses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  else if (sort === '热门') courses.sort((a, b) => b.downloads - a.downloads)
  const total = courses.length
  const start = (parseInt(page) - 1) * parseInt(limit)
  res.json({ courses: courses.slice(start, start + parseInt(limit)), pagination: { page: parseInt(page), limit: parseInt(limit), total } })
})

app.get('/api/courses/:id', (req, res) => {
  const course = findCourse(req.params.id)
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

    console.log('🖼️  正在获取配图...')
    const imageMap = await fetchSlideImages(courseContent.slides)
    if (imageMap.size > 0) {
      courseContent.slides.forEach(slide => {
        const key = `${slide.type}:${slide.topic || ''}`
        const imgUrl = imageMap.get(key)
        if (imgUrl) slide.imageUrl = imgUrl
      })
      console.log(`✅ 已获取 ${imageMap.size} 张配图`)
    }

    console.log('⏳ 正在生成 PPTX 文件...')
    const pptxResult = await generatePPTXBuffer(courseContent)
    console.log(`✅ PPTX 已生成 (${Math.round(pptxResult.fileSize/1024)}KB)`)

    storeFile(pptxResult.fileName, pptxResult.buffer, 'application/vnd.openxmlformats-officedocument.presentationml.presentation')

    let docResult = null
    if (options.doc !== false) {
      docResult = generateTeachingPlanBuffer({ ...courseContent, grade, title: courseContent.title || topic })
      storeFile(docResult.fileName, Buffer.from(docResult.content, 'utf-8'), 'text/plain; charset=utf-8')
      console.log(`✅ 教案已生成`)
    }

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
    addCourse(newCourse)
    console.log(`✅ 已保存到课件库`)

    res.json({ success: true, course: newCourse, message: '课件生成成功' })
  } catch (err) {
    console.error('❌ 生成失败:', err)
    res.status(500).json({ error: `生成失败：${err.message}` })
  }
})

app.get('/api/download/:fileName', (req, res) => {
  const file = getFile(req.params.fileName)
  if (!file) return res.status(404).json({ error: '文件不存在' })

  res.setHeader('Content-Type', file.contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(req.params.fileName)}"`)
  res.send(file.buffer)
})

app.get('/api/share/qrcode/:id', async (req, res) => {
  try {
    const course = findCourse(req.params.id)
    if (!course) return res.status(404).json({ error: '课件不存在' })
    const qr = await generateShareQRCode(course.id, course.title)
    res.json(qr)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/api/images/search', async (req, res) => {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: '请输入搜索关键词' })
  try {
    const { searchPixabay } = require('../server/pixabay.js')
    const result = await searchPixabay(q)
    if (!result) return res.json({ success: true, images: [] })
    res.json({ success: true, images: [result] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/courses/:id/download', (req, res) => {
  const course = findCourse(req.params.id)
  if (!course) return res.status(404).json({ error: '课件不存在' })
  updateCourse(req.params.id, (c) => ({ downloads: (c.downloads || 0) + 1 }))
  res.json({ success: true, downloads: course.downloads + 1 })
})

module.exports = app
