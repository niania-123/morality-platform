module.exports = async (req, res) => {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { topic, grade, pages = 12 } = req.body;
  
  if (!topic) {
    return res.status(400).json({ error: '请输入选题' });
  }
  
  // 演示模式：返回模拟数据
  const demoSlides = [
    { type: 'cover', title: topic, content: `${topic} - 课件封面` },
    { type: 'intro', title: '学习目标', content: `本节课我们将学习关于"${topic}"的知识` },
    { type: 'content', title: '认识' + topic, content: `这是关于${topic}的基础知识介绍` },
    { type: 'discussion', title: '想一想', content: `关于${topic}，你有什么想法？` },
    { type: 'activity', title: '小活动', content: `和同学一起讨论${topic}的相关话题` },
    { type: 'summary', title: '课堂总结', content: `今天我们学习了${topic}，希望大家都能记住` },
  ];
  
  res.json({
    success: true,
    course: {
      id: Date.now(),
      title: topic,
      grade: grade || '一年级上',
      slides: demoSlides,
      message: '演示模式：后端正在调试中，这是模拟数据'
    }
  });
};
