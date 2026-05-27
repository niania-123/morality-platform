import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, 'output')

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

// 章节标签的颜色
const TAG_COLORS = {
  morality: '#F4A3A3',
  law: '#C8A2C8',
  personality: '#A8D5B5',
  responsibility: '#FFD700',
  citizenship: '#87CEEB',
}

// 生成教案 Word 文档（纯文本格式，兼容 WPS）
export function generateTeachingPlan(courseData) {
  const { title, subtitle, grade, tags, slides, introCard } = courseData

  const tagLabels = {
    morality: '道德修养', law: '法治观念', personality: '健全人格',
    responsibility: '责任意识', citizenship: '公民意识',
  }

  // 从幻灯片内容中提取各部分
  const objectiveSlide = slides.find(s => s.type === 'objective')
  const contentSlides = slides.filter(s => ['content', 'activity', 'interaction'].includes(s.type))
  const valueSlide = slides.find(s => s.type === 'values')
  const homeworkSlide = slides.find(s => s.type === 'homework' || s.type === 'home_link')
  const summarySlide = slides.find(s => s.type === 'summary')

  const lines = []

  lines.push('═'.repeat(60))
  lines.push(`  小学道德与法治  教学设计（教案）`)
  lines.push('═'.repeat(60))
  lines.push('')
  lines.push(`课题：${title}`)
  lines.push(`年级：${grade}`)
  lines.push(`核心素养：${(tags || []).map(t => tagLabels[t] || t).join('、')}`)
  lines.push('')
  lines.push('─'.repeat(60))
  lines.push('一、教学目标（三维目标）')
  lines.push('─'.repeat(60))
  if (objectiveSlide?.content) {
    lines.push(objectiveSlide.content.split('\n').map(l => `  ${l}`).join('\n'))
  } else {
    lines.push('  1. 知识与技能：了解本课相关知识点')
    lines.push('  2. 过程与方法：通过活动体验和讨论，感受并理解')
    lines.push('  3. 情感态度价值观：培养良好的道德品质和行为习惯')
  }
  lines.push('')
  lines.push('─'.repeat(60))
  lines.push('二、教学重难点')
  lines.push('─'.repeat(60))
  lines.push('  重点：理解本课核心概念，能在生活中运用')
  lines.push('  难点：将所学道理内化为自觉行为')
  lines.push('')

  // 课前导入
  if (introCard) {
    lines.push('─'.repeat(60))
    lines.push('三、课前导入（约5分钟）')
    lines.push('─'.repeat(60))
    lines.push(`  暖场提问：${introCard.question}`)
    lines.push(`  热身游戏：${introCard.game}`)
    lines.push('')
  }

  // 教学过程
  lines.push('─'.repeat(60))
  lines.push('四、教学过程')
  lines.push('─'.repeat(60))

  if (contentSlides.length > 0) {
    contentSlides.forEach((slide, i) => {
      const stageNames = {
        content: '知识讲授', activity: '活动体验', interaction: '互动讨论',
        discussion: '思考探究', values: '价值引导', exercise: '巩固练习',
      }
      lines.push(`  环节${i + 1}【${stageNames[slide.type] || slide.title}】`)
      if (slide.content) {
        lines.push(`  ${slide.content.split('\n').join('\n  ')}`)
      }
      if (slide.note) {
        lines.push(`  （教师备注：${slide.note}）`)
      }
      lines.push('')
    })
  }
  lines.push('')

  // 价值引导
  if (valueSlide?.content) {
    lines.push('─'.repeat(60))
    lines.push('五、价值引领与小结')
    lines.push('─'.repeat(60))
    lines.push(valueSlide.content.split('\n').map(l => `  ${l}`).join('\n'))
    lines.push('')
  }

  // 课后作业
  if (homeworkSlide?.content) {
    lines.push('─'.repeat(60))
    lines.push('六、课后作业')
    lines.push('─'.repeat(60))
    lines.push(homeworkSlide.content.split('\n').map(l => `  ${l}`).join('\n'))
    lines.push('')
  }

  // 教学反思
  lines.push('─'.repeat(60))
  lines.push('七、教学反思（课后填写）')
  lines.push('─'.repeat(60))
  lines.push('')
  lines.push('  1. 学生参与度：__________')
  lines.push('  2. 教学目标达成情况：__________')
  lines.push('  3. 需要改进的环节：__________')
  lines.push('')
  lines.push('═'.repeat(60))
  lines.push(`  生成时间：${new Date().toLocaleString('zh-CN')}`)
  lines.push('  道德与法治课件平台 自动生成')
  lines.push('═'.repeat(60))

  const content = lines.join('\n')
  const fileName = `教案_${title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${Date.now()}.txt`
  const filePath = join(OUTPUT_DIR, fileName)
  writeFileSync(filePath, content, 'utf-8')

  return { fileName, filePath, content }
}
