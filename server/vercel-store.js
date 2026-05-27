// 内存存储 - 用于 Vercel Serverless 环境
let courses = []
let files = new Map() // fileName -> { buffer, contentType }

export function getCourses() {
  return [...courses]
}

export function saveCourses(newCourses) {
  courses = [...newCourses]
}

export function addCourse(course) {
  courses.unshift(course)
}

export function findCourse(id) {
  return courses.find(c => c.id === parseInt(id))
}

export function updateCourse(id, updater) {
  const idx = courses.findIndex(c => c.id === parseInt(id))
  if (idx !== -1) {
    courses[idx] = { ...courses[idx], ...updater(courses[idx]) }
  }
}

export function storeFile(fileName, buffer, contentType = 'application/octet-stream') {
  files.set(fileName, { buffer, contentType })
}

export function getFile(fileName) {
  return files.get(fileName)
}

export function hasFile(fileName) {
  return files.has(fileName)
}

export function initStore() {
  courses = []
  files = new Map()
}
