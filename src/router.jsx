import { createHashRouter } from 'react-router-dom'
import Home from './pages/Home'
import Library from './pages/Library'
import Generate from './pages/Generate'
import Editor from './pages/Editor'
import MiniApp from './pages/MiniApp'

const router = createHashRouter([
  { path: '/', element: <Home /> },
  { path: '/library', element: <Library /> },
  { path: '/generate', element: <Generate /> },
  { path: '/editor/:id', element: <Editor /> },
  { path: '/miniapp', element: <MiniApp /> },
])

export default router