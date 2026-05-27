import '../styles/miniapp.css'

const mpCourses = [
  { title: '我上学了', grade: '一年级上', emoji: '🌸', tag: '🧡道德修养', bg: 'linear-gradient(135deg,#FFE5E5,#FFD0D0)' },
  { title: '班级是我们共同的家', grade: '二年级上', emoji: '🛡️', tag: '💜法治观念', bg: 'linear-gradient(135deg,#EDE0F7,#DDD0F0)' },
  { title: '我们的好朋友', grade: '一年级下', emoji: '👫', tag: '💚健全人格', bg: 'linear-gradient(135deg,#FFE5E5,#FFD0D0)' },
  { title: '我们的大自然', grade: '二年级下', emoji: '🌳', tag: '💛责任意识', bg: 'linear-gradient(135deg,#EDE0F7,#DDD0F0)' },
]

const mpFeatures = [
  { icon: '📚', title: '课件浏览 & 下载', sub: '按年级/素养标签快速筛选，一键保存' },
  { icon: '📲', title: '二维码分享', sub: '生成课件专属二维码，家长扫码即看' },
  { icon: '🔍', title: '全文搜索', sub: '按课题名、素养标签、年级快速定位' },
  { icon: '💾', title: '我的收藏', sub: '常用课件收藏，下次一键找到' },
]

export default function MiniApp() {
  return (
    <div className="miniapp-page watercolor-bg">
      <div className="page-header">
        <h1>📱 微信小程序</h1>
        <p>随时随地查看课件 · 轻量快速</p>
      </div>

      <div className="mp-container">
        {/* 手机模拟 */}
        <div className="phone-frame">
          <div className="phone-notch"><div className="phone-notch-dot" /></div>
          <div className="mp-screen">
            <div className="mp-header">
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>🎨</div>
              <div className="mp-header-title">道德小课堂</div>
              <div className="mp-header-sub">小学道德与法治 · 水彩课件</div>
            </div>
            <div className="mp-banner">
              <div className="mp-banner-text">今日推荐课件</div>
              <div className="mp-banner-sub">「我上学了」· 一年级上</div>
              <div className="mp-banner-emoji">📚</div>
            </div>
            <div className="mp-section">
              <div className="mp-section-title">📖 选择年级</div>
              <div className="mp-grade-row">
                {[
                  { n: '一年级', e: '🌸', bg: 'linear-gradient(135deg,#FFE5E5,#FFD0D0)', active: true },
                  { n: '二年级', e: '🌈', bg: 'linear-gradient(135deg,#EDE0F7,#DDD0F0)', active: true },
                  { n: '三年级', e: '🌿', bg: '#f0ece6', active: false },
                  { n: '四年级', e: '🌻', bg: '#f0ece6', active: false },
                ].map((g, i) => (
                  <div key={i} className="mp-grade-card" style={{ background: g.bg, opacity: g.active ? 1 : 0.6 }}>
                    <div className="mg-emoji">{g.e}</div>
                    <div className="mg-name" style={{ color: g.active ? '#4a3f35' : '#bbb' }}>{g.n}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mp-section">
              <div className="mp-section-title">🆕 最新上传</div>
              <div className="mp-ppt-list">
                {mpCourses.map((c, i) => (
                  <div key={i} className="mp-ppt-item">
                    <div className="mp-ppt-thumb" style={{ background: c.bg }}>{c.emoji}</div>
                    <div className="mp-ppt-info">
                      <div className="mp-ppt-title">{c.title}</div>
                      <div className="mp-ppt-meta">{c.grade} · {c.tag}</div>
                    </div>
                    <button className="mp-ppt-dl">⬇</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mp-section" style={{ paddingBottom: '20px' }}>
              <div className="mp-qr-card">
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>📲</div>
                <div className="mp-qr-title">分享给家长</div>
                <div className="mp-qr-sub">生成二维码，扫码即可查看课件</div>
              </div>
            </div>
          </div>
          <div className="mp-tabbar">
            {['🏠 首页', '📚 课件库', '🔍 搜索', '👤 我的'].map((t, i) => (
              <div key={i} className={`mp-tab ${i === 0 ? 'active' : ''}`}>
                <span className="mt-icon">{t.split(' ')[0]}</span>
                {t.split(' ')[1]}
              </div>
            ))}
          </div>
        </div>

        {/* 说明 */}
        <div className="mp-desc">
          <h3>轻量随身版 📱</h3>
          <p>微信小程序版本专注于浏览和下载，让老师在手机上也能快速查找和分享课件，无需打开电脑。</p>
          <div className="mp-features">
            {mpFeatures.map((f, i) => (
              <div key={i} className="mp-feat">
                <div className="mp-feat-icon">{f.icon}</div>
                <div>
                  <div className="mp-feat-text">{f.title}</div>
                  <div className="mp-feat-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
