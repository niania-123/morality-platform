import QRCode from 'qrcode'

// 生成课件分享二维码
export async function generateShareQRCode(courseId, courseTitle) {
  const baseUrl = process.env.SHARE_BASE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173')
  const shareUrl = `${baseUrl}/share/${courseId}`
  const qrDataUrl = await QRCode.toDataURL(shareUrl, {
    width: 200,
    margin: 1,
    color: { dark: '#5C4033', light: '#FFF5F5' },
    errorCorrectionLevel: 'M',
  })

  return {
    shareUrl,
    qrDataUrl,
    title: courseTitle,
  }
}
