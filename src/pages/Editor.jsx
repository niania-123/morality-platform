import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCourse, downloadPPTX } from '../api'
import * as fabric from 'fabric'
import '../styles/editor.css'

const WATERCOLOR_BG = '#FFF5F5'
const WATERCOLOR_ALT = '#F5EEF8'

const TOOLBAR_ITEMS = [
  { id: 'select', icon: '🖱️', label: '选择' },
  { id: 'text', icon: '✏️', label: '文字' },
  { id: 'rect', icon: '⬜', label: '矩形' },
  { id: 'circle', icon: '⭕', label: '圆形' },
  { id: 'emoji', icon: '😊', label: '贴纸' },
  { id: 'delete', icon: '🗑️', label: '删除' },
]

const EMOJI_SET = ['🌸', '🌈', '🎨', '🌟', '💖', '🦋', '🍃', '🍎', '📚', '🏠', '😊', '👍', '🎮', '🎵', '🎈', '☀️']

const TEXT_PRESETS = [
  { text: '标题文字', fontSize: 36, fontWeight: 'bold' },
  { text: '正文内容', fontSize: 18, fontWeight: 'normal' },
  { text: '小字注释', fontSize: 14, fontWeight: 'normal', color: '#8B7355' },
]

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const fabricCanvasRef = useRef(null)
  const [course, setCourse] = useState(null)
  const [activeTool, setActiveTool] = useState('select')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showTextPicker, setShowTextPicker] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    getCourse(id).then(data => {
      setCourse(data)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [id])

  // 初始化 Fabric.js 画布
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 960,
      height: 540,
      backgroundColor: WATERCOLOR_BG,
      selection: true,
    })

    fabricCanvasRef.current = canvas

    // 如果有课件数据，加载第一页内容
    if (course?.slides?.length > 0) {
      loadSlideContent(canvas, course.slides[0])
    } else {
      // 默认空白页
      loadDefaultContent(canvas)
    }

    return () => {
      canvas.dispose()
      fabricCanvasRef.current = null
    }
  }, [course, loading])

  const loadSlideContent = (canvas, slide) => {
    canvas.clear()
    canvas.setBackgroundColor(
      slide.slideNum % 2 === 1 ? WATERCOLOR_BG : WATERCOLOR_ALT,
      canvas.renderAll.bind(canvas)
    )

    // 标题
    const typeIcons = {
      cover: '🌸', intro: '🃏', objective: '🎯', content: '📖',
      activity: '🎨', interaction: '🎮', discussion: '💭', values: '🌟',
      exercise: '✏️', home_link: '🏠', homework: '📝', summary: '🎊',
    }
    const icon = typeIcons[slide.type] || '📄'

    const title = new fabric.FabricText(`${icon} ${slide.title}`, {
      left: 40, top: 20,
      fontSize: 28, fontWeight: 'bold',
      fontFamily: 'Microsoft YaHei',
      fill: '#5C4033',
      editable: true,
    })

    // 装饰线
    const line = new fabric.FabricRect({
      left: 40, top: 60,
      width: 200, height: 4,
      fill: '#F4A3A3',
      rx: 2, ry: 2,
      selectable: false,
    })

    // 正文
    const contentTexts = (slide.content || '').split('\n').filter(l => l.trim())
    const textObjects = contentTexts.map((line, i) => new fabric.FabricText(line, {
      left: 50, top: 80 + i * 40,
      fontSize: 18,
      fontFamily: 'Microsoft YaHei',
      fill: '#5C4033',
      editable: true,
    }))

    // 装饰圆
    const deco1 = new fabric.FabricCircle({
      left: 780, top: 350, radius: 50,
      fill: 'rgba(244,163,163,0.15)',
      selectable: true,
    })
    const deco2 = new fabric.FabricCircle({
      left: 850, top: 420, radius: 35,
      fill: 'rgba(196,171,219,0.15)',
      selectable: true,
    })

    // 页码
    const pageNum = new fabric.FabricText(`${slide.slideNum} / ${course.slides.length}`, {
      left: 400, top: 500,
      fontSize: 12, fill: '#8B7355',
      fontFamily: 'Microsoft YaHei',
      editable: false,
      selectable: false,
    })

    canvas.add(title, line, ...textObjects, deco1, deco2, pageNum)
    canvas.renderAll()
  }

  const loadDefaultContent = (canvas) => {
    canvas.setBackgroundColor(WATERCOLOR_BG, canvas.renderAll.bind(canvas))

    const title = new fabric.FabricText('课件标题', {
      left: 200, top: 180,
      fontSize: 48, fontWeight: 'bold',
      fontFamily: 'Microsoft YaHei',
      fill: '#5C4033',
      editable: true,
    })

    const subtitle = new fabric.FabricText('点击文字即可编辑', {
      left: 280, top: 260,
      fontSize: 20, fill: '#8B7355',
      fontFamily: 'Microsoft YaHei',
      editable: true,
    })

    const deco1 = new fabric.FabricCircle({
      left: 720, top: 80, radius: 80,
      fill: 'rgba(244,163,163,0.15)',
    })
    const deco2 = new fabric.FabricCircle({
      left: 100, top: 380, radius: 60,
      fill: 'rgba(196,171,219,0.15)',
    })
    const deco3 = new fabric.FabricCircle({
      left: 800, top: 400, radius: 45,
      fill: 'rgba(168,213,181,0.15)',
    })

    canvas.add(title, subtitle, deco1, deco2, deco3)
    canvas.renderAll()
  }

  const handleToolClick = (toolId) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return

    if (toolId === 'select') {
      setActiveTool('select')
      canvas.selection = true
      canvas.defaultCursor = 'default'
      setShowEmojiPicker(false)
      setShowTextPicker(false)
    } else if (toolId === 'text') {
      setShowTextPicker(!showTextPicker)
      setShowEmojiPicker(false)
      setActiveTool('text')
    } else if (toolId === 'rect') {
      const rect = new fabric.FabricRect({
        left: 200, top: 200, width: 200, height: 100,
        fill: 'rgba(244,163,163,0.2)',
        stroke: '#F4A3A3', strokeWidth: 2,
        rx: 12, ry: 12,
      })
      canvas.add(rect)
      canvas.setActiveObject(rect)
      canvas.renderAll()
    } else if (toolId === 'circle') {
      const circle = new fabric.FabricCircle({
        left: 300, top: 250, radius: 50,
        fill: 'rgba(196,171,219,0.2)',
        stroke: '#C4ABDB', strokeWidth: 2,
      })
      canvas.add(circle)
      canvas.setActiveObject(circle)
      canvas.renderAll()
    } else if (toolId === 'emoji') {
      setShowEmojiPicker(!showEmojiPicker)
      setShowTextPicker(false)
      setActiveTool('emoji')
    } else if (toolId === 'delete') {
      const active = canvas.getActiveObject()
      if (active) {
        canvas.remove(active)
        canvas.renderAll()
      }
    }
  }

  const addText = (preset) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const text = new fabric.FabricText(preset.text, {
      left: 200, top: 200,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      fontFamily: 'Microsoft YaHei',
      fill: preset.color || '#5C4033',
      editable: true,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
    setShowTextPicker(false)
  }

  const addEmoji = (emoji) => {
    const canvas = fabricCanvasRef.current
    if (!canvas) return
    const text = new fabric.FabricText(emoji, {
      left: 300 + Math.random() * 200,
      top: 200 + Math.random() * 150,
      fontSize: 48,
      editable: false,
    })
    canvas.add(text)
    canvas.setActiveObject(text)
    canvas.renderAll()
  }

  const switchSlide = (index) => {
    setCurrentSlide(index)
    const canvas = fabricCanvasRef.current
    if (canvas && course?.slides?.[index]) {
      canvas.clear()
      loadSlideContent(canvas, course.slides[index])
    }
  }

  const handleExport = () => {
    if (!course?.fileName) {
      alert('请先生成课件后再下载')
      return
    }
    downloadPPTX(course.fileName, course.title)
  }

  if (loading) {
    return (
      <div className="editor-loading">
        <div className="loading-spinner" />
        <div style={{ fontSize: '14px', color: '#ccc', marginTop: '12px' }}>加载课件中...</div>
      </div>
    )
  }

  const slides = course?.slides || []

  return (
    <div className="editor-page">
      {/* 顶部工具栏 */}
      <div className="editor-topbar">
        <button className="editor-back" onClick={() => navigate(-1)}>← 返回</button>
        <div className="editor-title">
          {course?.emoji} {course?.title || '课件编辑器'}
        </div>
        <div className="editor-top-actions">
          <button className="editor-save-btn" onClick={handleExport}>💾 导出 PPTX</button>
        </div>
      </div>

      <div className="editor-body">
        {/* 左侧工具栏 */}
        <div className="editor-toolbar">
          {TOOLBAR_ITEMS.map(item => (
            <button
              key={item.id}
              className={`toolbar-btn ${activeTool === item.id ? 'active' : ''}`}
              onClick={() => handleToolClick(item.id)}
              title={item.label}
            >
              <span className="toolbar-icon">{item.icon}</span>
              <span className="toolbar-label">{item.label}</span>
            </button>
          ))}

          {/* 文字选择器 */}
          {showTextPicker && (
            <div className="picker-popup">
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px', fontWeight: 600 }}>选择文字样式</div>
              {TEXT_PRESETS.map((preset, i) => (
                <button key={i} className="picker-item" onClick={() => addText(preset)}>
                  <span style={{ fontSize: preset.fontSize > 30 ? '18px' : '14px', fontWeight: preset.fontWeight }}>
                    {preset.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Emoji 选择器 */}
          {showEmojiPicker && (
            <div className="picker-popup emoji-picker">
              <div style={{ fontSize: '11px', color: '#999', marginBottom: '6px', fontWeight: 600 }}>选择贴纸</div>
              <div className="emoji-grid">
                {EMOJI_SET.map((emoji, i) => (
                  <button key={i} className="emoji-item" onClick={() => addEmoji(emoji)}>{emoji}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 画布区域 */}
        <div className="editor-canvas-area">
          <div className="canvas-wrapper">
            <canvas ref={canvasRef} />
          </div>
          <div className="canvas-info">
            第 {currentSlide + 1} / {slides.length || 1} 页 · 拖拽元素可移动位置 · 双击文字可编辑
          </div>
        </div>

        {/* 右侧缩略图 */}
        <div className="editor-sidebar">
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#5C4033', marginBottom: '12px', padding: '0 8px' }}>
            📄 幻灯片
          </div>
          <div className="slide-list">
            {slides.map((s, i) => (
              <div
                key={i}
                className={`slide-list-item ${currentSlide === i ? 'active' : ''}`}
                onClick={() => switchSlide(i)}
                style={{
                  background: s.slideNum % 2 === 1 ? WATERCOLOR_BG : WATERCOLOR_ALT,
                }}
              >
                <span className="slide-list-num">{i + 1}</span>
                <span className="slide-list-title">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
