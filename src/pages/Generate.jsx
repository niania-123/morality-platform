import React, { useState } from 'react'
import '../styles/generate.css'
import { IllustCover, IllustStory, IllustThinking, IllustDiscussion, IllustActivity, IllustHome, IllustReward, IllustRainbow, IllustHonest, IllustSteps } from '../components/Illustrations'

// 根据幻灯片 type 渲染对应插图组件（纯本地SVG，无外部依赖）
function SlideIllustration({ type, theme, topic = '' }) {
  const p = { c1: theme.primary, c2: theme.accent, c3: theme.secondary }
  const habitsKeywords = ['叠被子', '整理', '洗手', '刷牙', '早起', '早睡', '穿衣', '排队', '洗袜', '叠衣']
  const isHabitContent = type === 'content' && habitsKeywords.some(k => topic && topic.includes(k))
  if (isHabitContent) return <IllustSteps {...p} topic={topic} />

  const map = {
    cover:       <IllustCover {...p} />,
    intro:       <IllustActivity {...p} />,
    objective:   <IllustReward {...p} />,
    content:     <IllustStory {...p} />,
    activity:    <IllustActivity {...p} />,
    interaction: <IllustThinking {...p} />,
    discussion:  <IllustDiscussion {...p} />,
    values:      <IllustHonest {...p} />,
    exercise:    <IllustStory {...p} />,
    home_link:   <IllustHome {...p} />,
    homework:    <IllustStory {...p} />,
    summary:     <IllustReward {...p} />,
  }
  return map[type] || <IllustRainbow {...p} />
}

const SLIDE_TYPE_LABEL = {
  cover:       '🌈 封面',
  intro:       '🎉 暖场互动',
  objective:   '🎯 学习目标',
  content:     '📖 小故事',
  activity:    '🎨 活动',
  interaction: '🤔 想一想',
  discussion:  '💬 讨论',
  values:      '🤝 价值引导',
  exercise:    '✏️ 练一练',
  home_link:   '🏠 带回家',
  homework:    '📝 课后挑战',
  summary:     '🌟 今日总结',
}

const THEMES = [
  { bg: '#FFF5F5', primary: '#F8A4B8', accent: '#FF6B8A', secondary: '#FFB3C6', text: '#5A3E4B', textLight: '#8B6E7B', lightBg: '#FFF0F3', cardBg: '#FFFFFF' },
  { bg: '#F0FAF4', primary: '#7DC9A0', accent: '#4CAF7D', secondary: '#A8E6C1', text: '#3D5A4E', textLight: '#6B8F7B', lightBg: '#E8F8F0', cardBg: '#FFFFFF' },
  { bg: '#F0F7FF', primary: '#7EB8E0', accent: '#5199D4', secondary: '#A8D4F5', text: '#3D4E5A', textLight: '#6B7F8F', lightBg: '#E6F0FA', cardBg: '#FFFFFF' },
]

function getTheme(idx) {
  return THEMES[idx % THEMES.length]
}

// ========== 单张幻灯片组件 ==========
function SlidePreview({ slide, index, totalSlides, topic, grade, onContentChange }) {
  const theme = getTheme(index)
  const isCover = index === 0
  const isEnding = index === totalSlides - 1

  const [editingContent, setEditingContent] = React.useState(false)
  const [editText, setEditText] = React.useState('')

  if (isCover) {
    return (
      <div className="slide-preview cover-slide" style={{ background: theme.bg }}>
        <div className="slide-decor-circle slide-decor-tl" style={{ background: theme.primary, opacity: 0.1 }} />
        <div className="slide-decor-circle slide-decor-tr" style={{ background: theme.accent, opacity: 0.08 }} />
        <div className="slide-cover-img">
          <IllustCover c1={theme.primary} c2={theme.accent} c3={theme.secondary} />
        </div>
        <div className="slide-cover-title" style={{ color: theme.text }}>{topic}</div>
        <div className="slide-cover-sub" style={{ color: theme.textLight }}>{grade} · 道德与法治</div>
        <div className="slide-cover-line" style={{ background: theme.accent }} />
        <div className="slide-number">{index + 1}</div>
      </div>
    )
  }

  if (isEnding) {
    return (
      <div className="slide-preview ending-slide" style={{ background: theme.bg }}>
        <div className="slide-decor-circle slide-decor-br" style={{ background: theme.primary, opacity: 0.1 }} />
        <div className="slide-ending-img">
          <IllustReward c1={theme.primary} c2={theme.accent} />
        </div>
        <div className="slide-ending-title" style={{ color: theme.text }}>谢谢小朋友们！</div>
        <div className="slide-ending-sub" style={{ color: theme.textLight }}>今天的主题是「{topic}」</div>
        <div className="slide-ending-sub" style={{ color: theme.textLight }}>期待下次见面 🌈</div>
        <div className="slide-number">{index + 1}</div>
      </div>
    )
  }

  const data = slide || {}
  const title = data.title || ''
  const content = data.content || ''
  const type = data.type || 'content'

  const handleDoubleClick = () => {
    setEditingContent(true)
    setEditText(content)
  }

  const handleSave = () => {
    setEditingContent(false)
    if (onContentChange && editText !== content) {
      onContentChange(index - 1, editText)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setEditingContent(false)
    if (e.key === 'Enter' && e.ctrlKey) handleSave()
  }

  return (
    <div className="slide-preview content-slide" style={{ background: theme.bg }}>
      <div className="slide-title-bar" style={{ background: `${theme.primary}22` }}>
        <span className="slide-title-text" style={{ color: theme.text }}>{title}</span>
      </div>
      <div className="slide-body">
        <div className="slide-text-area" style={{ color: theme.text }} onDoubleClick={handleDoubleClick}>
          {editingContent ? (
            <div className="slide-edit-overlay">
              <textarea
                className="slide-edit-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              <div className="slide-edit-actions">
                <button className="slide-edit-btn save" onClick={handleSave}>保存 (Ctrl+Enter)</button>
                <button className="slide-edit-btn cancel" onClick={() => setEditingContent(false)}>取消</button>
              </div>
            </div>
          ) : (
            <div className="slide-text-content">
              {content.split('\n').map((line, i) => {
                const isHighlight = /^[🎯📖🙋🎨💬🌟✏️🏠🎊🤔📝🎉🤝❓🌈]/.test(line)
                return (
                  <div key={i} className={isHighlight ? 'slide-text-highlight' : ''}>
                    {line || '\u00A0'}
                  </div>
                )
              })}
            </div>
          )}
          <div className="slide-edit-hint">双击编辑文字</div>
        </div>
        <div className="slide-img-area">
          <div className="slide-img-wrapper">
            <SlideIllustration type={type} theme={theme} topic={slide?.topic || ''} />
          </div>
          <div className="slide-img-label" style={{ color: theme.textLight }}>
            {SLIDE_TYPE_LABEL[type] || '🌈 快乐学习'}
          </div>
        </div>
      </div>
      <div className="slide-footer-dots">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="slide-dot" style={{ background: [theme.primary, theme.accent, theme.secondary, theme.primary][i], opacity: 0.7 }} />
        ))}
      </div>
      <div className="slide-number">{index + 1}</div>
    </div>
  )
}

// ========== 主生成页面 ==========
export default function Generate() {
  const [topic, setTopic] = useState('')
  const [grade, setGrade] = useState('一年级上')
  const [pages, setPages] = useState(10)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [slides, setSlides] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [viewMode, setViewMode] = useState('slides')
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)

  const grades = ['一年级上', '一年级下', '二年级上', '二年级下']

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('请输入课件主题')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    setSlides([])
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          grade,
          pages,
          options: { intro: true, doc: true, tags: true },
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.course)
        setSlides(data.course.slides || [])
        setCurrentSlide(0)
      } else {
        setError(data.error || '生成失败')
      }
    } catch (err) {
      setError('网络错误：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!result?.fileName) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/download/${encodeURIComponent(result.fileName)}`)
      if (!res.ok) throw new Error('下载失败')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.fileName
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('下载失败：' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  const handleContentChange = (slideIdx, newContent) => {
    const updated = [...slides]
    updated[slideIdx] = { ...updated[slideIdx], content: newContent }
    setSlides(updated)
  }

  const totalPreviewSlides = slides.length + 2

  return (
    <div className="generate-page">
      <div className="generate-header">
        <h1>🎨 AI 课件生成</h1>
        <p>输入主题，自动生成完整课件</p>
      </div>

      <div className="generate-form">
        <div className="form-group">
          <label>📖 课件主题</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：叠被子、诚实守信、我爱我的家..."
            className="topic-input"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>📚 适用年级</label>
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className="grade-select">
              {grades.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>📄 页数</label>
            <select value={pages} onChange={(e) => setPages(Number(e.target.value))} className="grade-select">
              {[8, 10, 12, 15].map(n => <option key={n} value={n}>{n} 页</option>)}
            </select>
          </div>
        </div>
        <button
          className="generate-btn"
          onClick={handleGenerate}
          disabled={loading || !topic.trim()}
        >
          {loading ? (
            <><span className="loading-spinner" /> 正在生成中...</>
          ) : (
            '✨ 开始生成课件'
          )}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {result && slides.length > 0 && (
        <div className="preview-section">
          <div className="preview-toolbar">
            <h2>📋 课件预览</h2>
            <div className="preview-actions">
              <button className="action-btn" onClick={() => setViewMode(viewMode === 'slides' ? 'list' : 'slides')}>
                {viewMode === 'slides' ? '📄 列表模式' : '🎞 幻灯片模式'}
              </button>
              <button className="action-btn download-btn" onClick={handleDownload} disabled={downloading}>
                {downloading ? '下载中...' : '⬇ 下载 PPTX'}
              </button>
            </div>
          </div>

          {viewMode === 'slides' ? (
            <>
              <div className="slide-main-view">
                <SlidePreview
                  slide={currentSlide === 0 || currentSlide === totalPreviewSlides - 1 ? null : slides[currentSlide - 1]}
                  index={currentSlide}
                  totalSlides={totalPreviewSlides}
                  topic={topic}
                  grade={grade}
                  onContentChange={handleContentChange}
                />
              </div>
              <div className="slide-thumbnails">
                <button
                  className="thumb-nav-btn"
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                >◀</button>
                {Array.from({ length: totalPreviewSlides }).map((_, i) => (
                  <div
                    key={i}
                    className={`slide-thumbnail ${i === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(i)}
                    style={{
                      background: getTheme(i).bg,
                      borderColor: i === currentSlide ? getTheme(i).accent : 'transparent',
                    }}
                  >
                    <div className="thumb-label">
                      {i === 0 ? '封面' : i === totalPreviewSlides - 1 ? '结尾' : (slides[i - 1]?.title || `第${i}页`).substring(0, 5)}
                    </div>
                    <div className="thumb-number">{i + 1}</div>
                  </div>
                ))}
                <button
                  className="thumb-nav-btn"
                  onClick={() => setCurrentSlide(Math.min(totalPreviewSlides - 1, currentSlide + 1))}
                  disabled={currentSlide === totalPreviewSlides - 1}
                >▶</button>
              </div>
            </>
          ) : (
            <div className="slide-list-view">
              {Array.from({ length: totalPreviewSlides }).map((_, i) => (
                <div key={i} className="slide-list-item">
                  <div className="slide-list-preview">
                    <SlidePreview
                      slide={i === 0 || i === totalPreviewSlides - 1 ? null : slides[i - 1]}
                      index={i}
                      totalSlides={totalPreviewSlides}
                      topic={topic}
                      grade={grade}
                      onContentChange={handleContentChange}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
