// 水彩主题色系
export const colors = {
  coral: '#F4A3A3',
  coralDark: '#c97b7b',
  purple: '#C4ABDB',
  purpleDark: '#8a6aad',
  green: '#A8D5B5',
  greenDark: '#5a9a6a',
  yellow: '#F5E6C8',
  yellowDark: '#a07820',
  blue: '#A8D2E6',
  blueDark: '#3a7a9a',
  bg: '#FFFDF8',
  text: '#4a3f35',
  textTitle: '#3d3328',
  textMuted: '#8a7a6a',
  textLight: '#bbb',
  border: 'rgba(244,163,163,0.2)',
}

// 核心素养标签配置
export const competencyTags = [
  { key: 'morality', label: '🧡 道德修养', color: 'coral' },
  { key: 'law', label: '💜 法治观念', color: 'purple' },
  { key: 'personality', label: '💚 健全人格', color: 'green' },
  { key: 'responsibility', label: '💛 责任意识', color: 'yellow' },
  { key: 'citizenship', label: '💙 公民意识', color: 'blue' },
]

// 模拟课件数据
export const mockCourses = [
  {
    id: 1, title: '我是小学生啦', grade: '一年级上', semester: '上',
    emoji: '🌸', pages: 12, tags: ['morality', 'personality'],
    desc: '认识校园生活，学会适应新环境', isNew: true, isHot: true,
  },
  {
    id: 2, title: '我的家', grade: '一年级上', semester: '上',
    emoji: '🏠', pages: 11, tags: ['responsibility', 'morality'],
    desc: '感受家庭的温暖，了解家庭成员', isNew: false, isHot: true,
  },
  {
    id: 3, title: '我们的好朋友', grade: '一年级下', semester: '下',
    emoji: '👫', pages: 12, tags: ['morality', 'citizenship'],
    desc: '学会交友，体验友谊的快乐', isNew: false, isHot: false,
  },
  {
    id: 4, title: '遵守规则真重要', grade: '一年级下', semester: '下',
    emoji: '📏', pages: 11, tags: ['law', 'morality'],
    desc: '理解规则的意义，养成守规习惯', isNew: true, isHot: false,
  },
  {
    id: 5, title: '班级是我们共同的家', grade: '二年级上', semester: '上',
    emoji: '🛡️', pages: 12, tags: ['law', 'citizenship'],
    desc: '爱护班集体，学会合作与分享', isNew: true, isHot: true,
  },
  {
    id: 6, title: '我们的大自然', grade: '二年级下', semester: '下',
    emoji: '🌳', pages: 13, tags: ['personality', 'responsibility'],
    desc: '亲近自然，培养环保意识', isNew: false, isHot: false,
  },
  {
    id: 7, title: '我是诚实的孩子', grade: '一年级下', semester: '下',
    emoji: '🌱', pages: 12, tags: ['morality', 'personality'],
    desc: '理解诚实的意义，培养诚实品质', isNew: false, isHot: true,
  },
  {
    id: 8, title: '节日里的欢乐', grade: '二年级上', semester: '上',
    emoji: '🎉', pages: 11, tags: ['citizenship', 'morality'],
    desc: '了解传统节日，感受文化之美', isNew: true, isHot: false,
  },
]

// 选题推荐数据
export const topicSuggestions = {
  '一年级上': ['我是小学生啦', '我的家', '校园里的安全'],
  '一年级下': ['我们的好朋友', '遵守规则真重要', '我是诚实的孩子'],
  '二年级上': ['班级是我们共同的家', '节日里的欢乐', '我的好习惯'],
  '二年级下': ['我们的大自然', '身边的环保', '关爱身边的人'],
}
