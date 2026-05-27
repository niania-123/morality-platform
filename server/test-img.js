const https = require('https')
const http = require('http')

function get(url) {
  return new Promise(res => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, { timeout: 6000 }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return get(r.headers.location).then(res)
      }
      res({ url: url.substring(0, 70), status: r.statusCode })
    })
    req.on('error', e => res({ url: url.substring(0, 70), err: e.message }))
    req.on('timeout', () => { req.destroy(); res({ url: url.substring(0, 70), err: 'timeout' }) })
  })
}

const urls = [
  'https://img.zcool.cn/community/01de5c5b0bb4b5a801213f472a6b30.jpg',
  'https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1.png',
  'https://img.js.design/assets/smartFill/img3.png',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
  'https://source.unsplash.com/400x300/?children,watercolor',
  'https://api.btstu.cn/sjbz/api.php?lx=fengjing&format=images',
  'https://img.paulzzh.com/touhou/random',
  'https://www.loliapi.com/acg/pp/',
]

Promise.all(urls.map(get)).then(r => r.forEach(x => console.log(JSON.stringify(x))))
