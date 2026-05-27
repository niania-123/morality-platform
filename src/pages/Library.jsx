import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourses, getTags, downloadPPTX, downloadDoc, recordDownload, getShareQRCode } from '../api'
import '../styles/library.css'

const gradeFilters = ['全部年级', '一年级上', '一年级下', '二年级上', '二年级下']

export default function Library() {
  const navigate = useNavigate()
  const [grade, setGrade] = useState('全部年级')
  const [search, setSearch] = useState('')
  const [activeTags, setActiveTags] = useState([])
  const [courses, setCourses] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [previewCourse, setPreviewCourse] = useState(null)
  const [qrData, setQrData] = useState(null)

  useEffect(() => {
    getTags().then(data => setTags(data)).catch(() => {})
    loadCourses()
  }, [grade, search, activeTags])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const data = await getCourses({ grade, tag: activeTags, search })
      setCourses(data.courses || [])
    } catch { setCourses([]) } finally { setLoading(false) }
  }

  const toggleTag = (key) => {
    setActiveTags(prev => prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key])
  }

  const handleDownload = async (course) => {
    if (course.fileName) {
      await recordDownload(course.id)
      downloadPPTX(course.fileName, course.title)
      // 刷新下载次数
      loadCourses()
    } else {
      alert('此课件暂无可下载文件')
    }
  }

  const handleDownloadDoc = async (course) => {
    if (course.docFileName) {
      downloadDoc(course.docFileName, `${course.title}_教案`)
    } else {
      alert('此课件暂无配套教案')
    }
  }

  const handleShowQR = async (course) => {
    try {
      const data = await getShareQRCode(course.id)
      setQrData({ ...data, course })
    } catch { alert('生成二维码失败') }
  }

  const handlePreview = (course) => {
    if (course.generatedByAI && course.slides?.length > 0) {
      navigate(`/editor/${course.id}`)
    } else {
      setPreviewCourse(course)
    }
  }

  const getTagClass = (key) => {
    const map = { morality: 'tf-coral', law: 'tf-purple', personality: 'tf-green', responsibility: 'tf-yellow', citizenship: 'tf-blue' }
    return map[key] || 'tf-coral'
  }
  const getThumbClass = (g) => g.includes('一') ? 'ppt-thumb-g1' : 'ppt-thumb-g2'
  const getGradeFilterEmoji = (g) => {
    if (g.includes('一')) return '🌸'
    if (g.includes('二')) return '🌈'
    return '📋'
  }

  return (
    <div className="library-page">
      <div className="page-header">
        <h1>📚 课件资源库</h1>
        <p>1-2 年级 · 人教版 · 新课改课件精选 · 支持下载</p>
      </div>

      {/* 搜索 + 年级筛选 */}
      <div className="filter-bar">
        <div className="search-box">
          <span>🔍</span>
          <input type="text" placeholder="搜索课题名称..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {gradeFilters.map(g => (
          <button key={g} className={`filter-chip ${grade === g ? 'active' : ''}`} onClick={() => setGrade(g)}>
            {g === '全部年级' ? '📋 ' + g : getGradeFilterEmoji(g) + ' ' + g}
          </button>
        ))}
      </div>

      {/* 核心素养标签 */}
      <div className="tag-filters">
        <span className="tag-label">核心素养：</span>
        {tags.map(tag => (
          <span key={tag.key} className={`tag-filter ${getTagClass(tag.key)} ${activeTags.includes(tag.key) ? 'active' : ''}`} onClick={() => toggleTag(tag.key)}>
            {tag.label}
          </span>
        ))}
      </div>

      {/* 课件卡片 */}
      <div className="ppt-grid">
        {loading ? (
          <div className="empty-state">
            <div className="loading-spinner" />
            <div style={{ fontSize: '14px', color: '#ccc', marginTop: '16px' }}>加载课件中...</div>
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontSize: '15px', color: '#bbb' }}>没有找到匹配的课件</div>
            <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>试试调整筛选条件</div>
          </div>
        ) : courses.map(c => (
          <div className="ppt-card" key={c.id}>
            <div className={`ppt-thumb ${getThumbClass(c.grade)}`} onClick={() => handlePreview(c)}>
              <span style={{ fontSize: '48px' }}>{c.emoji}</span>
              <span className="ppt-grade-badge">{c.grade}</span>
              {c.isNew && <span className="ppt-new-badge">NEW</span>}
              {c.generatedByAI && <span className="ppt-ai-badge">AI</span>}
            </div>
            <div className="ppt-info">
              <div className="ppt-title">{c.title}</div>
              <div className="ppt-desc">{c.desc}</div>
              <div className="ppt-tags">
                {c.tagLabels && c.tagLabels.map((label, i) => (
                  <span key={i} className={`ppt-tag ${getTagClass(c.tags[i])}`}>{label}</span>
                ))}
              </div>
              <div className="ppt-meta">
                <span>{c.pages}页 · 水彩风</span>
                <span>⬇ {c.downloads || 0}</span>
              </div>
              <div className="ppt-actions">
                <button className="btn-preview" onClick={() => handlePreview(c)}>
                  {c.generatedByAI ? '✏️ 编辑' : '👁 预览'}
                </button>
                {c.docFileName && (
                  <button className="btn-doc" onClick={() => handleDownloadDoc(c)}>📋 教案</button>
                )}
                <button className="btn-share" onClick={() => handleShowQR(c)}>📱 分享</button>
                <button className="btn-dl" onClick={() => handleDownload(c)}>⬇ 下载</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 预览弹窗 */}
      {previewCourse && (
        <div className="modal-overlay" onClick={() => setPreviewCourse(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{previewCourse.emoji} {previewCourse.title}</h2>
              <button className="modal-close" onClick={() => setPreviewCourse(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#8B7355' }}>{previewCourse.grade} · {previewCourse.pages}页 · 水彩风PPT</span>
              </div>
              {previewCourse.tagLabels && (
                <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  {previewCourse.tagLabels.map((label, i) => (
                    <span key={i} className={`ppt-tag ${getTagClass(previewCourse.tags[i])}`}>{label}</span>
                  ))}
                </div>
              )}
              {/* 课前互动卡 */}
              {previewCourse.introCard && (
                <div className="preview-intro-card">
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#c97b7b', marginBottom: '8px' }}>🃏 课前互动卡</div>
                  <div style={{ fontSize: '14px', color: '#4a3f35', lineHeight: 1.6 }}>
                    <p><strong>🙋 提问：</strong>{previewCourse.introCard.question}</p>
                    <p><strong>🎮 游戏：</strong>{previewCourse.introCard.game}</p>
                  </div>
                </div>
              )}
              {/* 幻灯片内容 */}
              {previewCourse.slides && (
                <div className="preview-slides">
                  {previewCourse.slides.map((s, i) => (
                    <div key={i} className="preview-slide-item">
                      <div className="preview-slide-num">{i + 1}</div>
                      <div className="preview-slide-info">
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#3d3328' }}>{s.title}</div>
                        <div style={{ fontSize: '13px', color: '#8B7355', marginTop: '4px', lineHeight: 1.5, maxHeight: '60px', overflow: 'hidden' }}>
                          {(s.content || '').split('\n').slice(0, 3).join(' | ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-dl" style={{ padding: '10px 24px', fontSize: '14px' }} onClick={() => handleDownload(previewCourse)}>
                ⬇ 下载 PPTX
              </button>
              {previewCourse.docFileName && (
                <button className="btn-doc" style={{ padding: '10px 24px', fontSize: '14px' }} onClick={() => handleDownloadDoc(previewCourse)}>
                  📋 下载教案
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 二维码弹窗 */}
      {qrData && (
        <div className="modal-overlay" onClick={() => setQrData(null)}>
          <div className="modal-content qr-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📱 分享课件</h2>
              <button className="modal-close" onClick={() => setQrData(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#3d3328', marginBottom: '16px' }}>
                {qrData.course.title}
              </div>
              {qrData.qrDataUrl && (
                <img src={qrData.qrDataUrl} alt="QR Code" style={{ width: '200px', height: '200px', borderRadius: '12px', margin: '0 auto' }} />
              )}
              <div style={{ fontSize: '13px', color: '#999', marginTop: '12px' }}>
                家长扫码即可查看课件内容
              </div>
              <div style={{ fontSize: '12px', color: '#bbb', marginTop: '8px', wordBreak: 'break-all' }}>
                {qrData.shareUrl}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
