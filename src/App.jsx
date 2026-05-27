import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import './styles/navbar.css'
import './styles/global.css'

const navItems = [
  { path: '/', label: '首页', icon: '🏠', tabKey: '/' },
  { path: '/library', label: '课件库', icon: '📚', tabKey: '/library' },
  { path: '/generate', label: 'AI生成', icon: '✨', tabKey: '/generate' },
  { path: '/miniapp', label: '小程序', icon: '📱', tabKey: '/miniapp' },
]

export default function App() {
  const location = useLocation()

  return (
    <>
      {/* 顶部导航 */}
      <nav className="navbar">
        <a className="logo" href="/">
          <div className="logo-icon">🎨</div>
          道德小课堂
        </a>
        <ul className="nav-links">
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink to={item.path} end={item.path === '/'}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <NavLink className="nav-btn" to="/generate">✨ 立即生成课件</NavLink>
      </nav>

      {/* 页面内容 */}
      <main className="page-container">
        <Outlet />
      </main>

      {/* 底部 Tab */}
      <div className="tab-bar">
        {navItems.map(item => (
          <button
            key={item.tabKey}
            className={`tab-item ${location.pathname === item.tabKey ? 'active' : ''}`}
            onClick={() => window.location.href = item.path}
          >
            <span className="tab-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}
