import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getStats, getGrades } from '../api'
import '../styles/home.css'

const grades = [
  { name: '一年级', emoji: '🌸', count: '上册 8 课 · 下册 8 课', cls: 'g1', online: true },
  { name: '二年级', emoji: '🌈', count: '上册 8 课 · 下册 8 课', cls: 'g2', online: true },
  { name: '三年级', emoji: '🌿', count: '敬请期待', cls: 'g3', online: false },
  { name: '四年级', emoji: '🌻', count: '敬请期待', cls: 'g4', online: false },
  { name: '五年级', emoji: '🦋', count: '敬请期待', cls: 'g5', online: false },
  { name: '六年级', emoji: '🌏', count: '敬请期待', cls: 'g6', online: false },
]

const features = [
  { icon: '🤖', bg: 'fi-coral', title: 'AI 智能生成课件', desc: '输入选题或文字描述，AI 自动生成适合低年级的课件内容，并配上水彩插图，30秒出成品。' },
  { icon: '🎨', bg: 'fi-purple', title: '类 Canva 在线编辑', desc: '生成后可在网页上直接拖拽编辑，调整文字、替换图片，满意了再导出 PPTX。' },
  { icon: '🃏', bg: 'fi-green', title: '课前导入互动卡', desc: '每份课件自带开场暖场问题和小游戏建议，帮助老师快速拉近与学生的距离。' },
  { icon: '📋', bg: 'fi-yellow', title: '教学设计一键导出', desc: '同步生成配套 Word 教案，含三维目标、教学过程、作业设计，直接可用。' },
  { icon: '🔄', bg: 'fi-blue', title: '一键适配年级', desc: '同一选题，一键切换年级版本：低年级用绘本式语言，高年级加入讨论和思辨。' },
  { icon: '📲', bg: 'fi-coral', title: '二维码分享', desc: '课件生成专属二维码，家长扫码即可查看，实现家校联动，无需下载 APP。' },
]

export default function Home() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStats()
      .then(data => {
        setStats({
          num: String(data.totalCourses),
          label: '课件资源（1-2年级）',
        }, {
          num: String(data.competencies),
          label: '核心素养维度',
        }, {
          num: data.genSpeed,
          label: 'AI 生成速度',
        }, {
          num: String(data.templates) + '套',
          label: '水彩 PPT 模板',
        })
        // 修正：setStats 应该接收数组
        setStats([
          { num: String(data.totalCourses), label: '课件资源（1-2年级）' },
          { num: String(data.competencies), label: '核心素养维度' },
          { num: data.genSpeed, label: 'AI 生成速度' },
          { num: String(data.templates) + '套', label: '水彩 PPT 模板' },
        ])
      })
      .catch(() => {
        // 降级使用默认数据
        setStats([
          { num: '48', label: '课件资源（1-2年级）' },
          { num: '5', label: '核心素养维度' },
          { num: '30s', label: 'AI 生成速度' },
          { num: '6套', label: '水彩 PPT 模板' },
        ])
      })
      .finally(() => setLoading(false))
  }, [])

  const displayStats = stats || [
    { num: '...', label: '加载中' },
    { num: '...', label: '加载中' },
    { num: '...', label: '加载中' },
    { num: '...', label: '加载中' },
  ]

  return (
    <div className="home-page watercolor-bg">
      {/* Hero */}
      <section className="hero">
        <div className="deco-circle c1" />
        <div className="deco-circle c2" />
        <div className="deco-circle c3" />
        <div className="hero-content">
          <div className="hero-badge">🌟 符合新课改 · 人教版</div>
          <h1 className="hero-title">
            让每一节<br />
            <span className="highlight">道德与法治课</span><br />
            都充满温度
          </h1>
          <p className="hero-desc">
            专为小学 1-2 年级打造的水彩风课件平台，AI 智能生成 + 精美模板，让备课变得轻松又有趣。
          </p>
          <div className="hero-btns">
            <Link to="/generate" className="btn-gradient" style={{ padding: '14px 32px', fontSize: '16px' }}>
              ✨ AI 生成课件
            </Link>
            <Link to="/library" className="btn-outline">
              📚 浏览课件库
            </Link>
          </div>
        </div>
        <div className="hero-illustration">
          <div className="floating-card fc-1">
            <div className="fc-emoji">🎨</div>
            <div className="fc-title">水彩风 PPT</div>
            <div className="fc-sub">莫兰迪色系 · 手绘风格</div>
            <span className="fc-tag tag-coral">自动配图</span>
          </div>
          <div className="floating-card fc-2">
            <div className="fc-emoji">🤖</div>
            <div className="fc-title">AI 内容生成</div>
            <div className="fc-sub">30秒出一份课件</div>
            <span className="fc-tag tag-purple">GPT 驱动</span>
          </div>
          <div className="floating-card fc-3">
            <div className="fc-emoji">📋</div>
            <div className="fc-title">一键导出教案</div>
            <div className="fc-sub">PPT + Word 教学设计</div>
            <span className="fc-tag tag-green">配套齐全</span>
          </div>
        </div>
      </section>

      {/* 统计栏 */}
      <div className="stats-bar">
        {displayStats.map((s, i) => (
          <div className="stat-item" key={i}>
            <div className={`stat-num ${loading ? 'loading' : ''}`}>{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 年级卡片 */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">📖 按年级浏览</div>
          <div className="section-sub">点击进入对应年级的课件库</div>
        </div>
        <div className="grade-grid">
          {grades.map((g, i) => (
            <Link
              to={g.online ? '/library' : '#'}
              className={`grade-card ${g.cls} ${!g.online ? 'disabled' : ''}`}
              key={i}
            >
              <span className={`grade-badge ${g.online ? 'new' : ''}`}>
                {g.online ? '已上线' : '即将上线'}
              </span>
              <div>
                <div className="grade-emoji">{g.emoji}</div>
                <div className="grade-name">{g.name}</div>
                {g.online
                  ? <div className="grade-count">{g.count}</div>
                  : <div className="grade-soon">敬请期待</div>
                }
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 功能亮点 */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">✨ 平台亮点</div>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i}>
              <div className={`feature-icon ${f.bg}`}>{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="footer">© 2026 道德小课堂 · 让备课更轻松 🎨</div>
    </div>
  )
}
