import OpenAI from 'openai'
import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const IMAGES_DIR = join(__dirname, 'images')

if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true })

// 水彩画风格的配图描述关键词
const WATERCOLOR_KEYWORDS = [
  'watercolor illustration', 'soft pastel colors', 'children book illustration',
  'hand-drawn style', 'gentle colors', 'whimsical', 'cute', 'kawaii style',
  'elementary school', 'educational', 'child-friendly', 'warm tones',
]

// 根据幻灯片类型生成配图描述
function buildImagePrompt(slideType, topic, grade) {
  const ageMap = {
    '一年级上': '6-7 year old',
    '一年级下': '6-7 year old',
    '二年级上': '7-8 year old',
    '二年级下': '7-8 year old',
  }
  const age = ageMap[grade] || '6-8 year old'

  const prompts = {
    cover: `Watercolor illustration for elementary school textbook cover about "${topic}", featuring ${age} children in a warm, welcoming classroom setting, soft pastel colors, hand-drawn style, cheerful atmosphere`,
    content: `Watercolor illustration depicting a scene about "${topic}" for ${age} children, educational context, soft colors, storybook style`,
    activity: `Watercolor illustration of ${age} children doing a classroom activity related to "${topic}", interactive and fun, hand-drawn style, pastel colors`,
    interaction: `Watercolor illustration of ${age} children raising hands and discussing "${topic}", warm classroom scene, friendly atmosphere`,
    discussion: `Watercolor illustration of ${age} children thinking and sharing ideas about "${topic}", thoughtful expressions, soft lighting`,
    values: `Watercolor illustration showing positive values of "${topic}", warm and encouraging scene for ${age} children, gentle colors`,
    home_link: `Watercolor illustration of family scene related to "${topic}", parent and child together, warm home setting, hand-drawn style`,
    homework: `Watercolor illustration of ${age} child doing homework related to "${topic}", cozy study corner, soft pastel`,
    summary: `Watercolor illustration celebrating learning about "${topic}", happy ${age} children, achievement and joy, bright pastel colors`,
  }

  return prompts[slideType] || `Watercolor illustration about "${topic}" for ${age} elementary school children, soft pastel colors, educational, hand-drawn`
}

// 使用 DALL-E 生成图片（需要 API Key）
async function generateWithDALLE(prompt, apiKey, slideNum) {
  const client = new OpenAI({ apiKey })
  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt: `${prompt}, ${WATERCOLOR_KEYWORDS.join(', ')}`,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  })

  const imageUrl = response.data[0].url
  const imageRes = await fetch(imageUrl)
  const imageBuffer = await imageRes.arrayBuffer()

  const fileName = `slide_${slideNum}_${Date.now()}.png`
  const filePath = join(IMAGES_DIR, fileName)
  writeFileSync(filePath, Buffer.from(imageBuffer))

  return {
    fileName,
    filePath,
    url: `/api/images/${fileName}`,
  }
}

// 降级方案：使用 picsum 占位图
function generatePlaceholder(slideNum) {
  const seed = `watercolor_${slideNum}_${Date.now()}`
  const url = `https://picsum.photos/seed/${seed}/1024/1024`
  return {
    fileName: null,
    filePath: null,
    url,
    isPlaceholder: true,
  }
}

// 主入口
export async function generateSlideImage(slideType, topic, grade, slideNum, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey && apiKey !== 'your-api-key-here' && options.useAI !== false) {
    try {
      const prompt = buildImagePrompt(slideType, topic, grade)
      return await generateWithDALLE(prompt, apiKey, slideNum)
    } catch (err) {
      console.warn(`AI 配图生成失败 (slide ${slideNum}):`, err.message)
    }
  }

  return generatePlaceholder(slideNum)
}

// 批量生成配图
export async function generateAllImages(slides, topic, grade, options = {}) {
  const results = []

  for (const slide of slides) {
    const image = await generateSlideImage(slide.type, topic, grade, slide.slideNum, options)
    results.push({ slideNum: slide.slideNum, ...image })
  }

  return results
}
