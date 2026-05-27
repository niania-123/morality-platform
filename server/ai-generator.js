import OpenAI from 'openai'

// AI 内容生成服务
// 无 API Key 时使用智能模板引擎，根据主题关键字生成差异化内容

const GRADE_STYLES = {
  '一年级上': { tone: '绘本式', age: '6-7岁', level: 1 },
  '一年级下': { tone: '绘本式', age: '6-7岁', level: 1 },
  '二年级上': { tone: '故事式', age: '7-8岁', level: 2 },
  '二年级下': { tone: '故事式', age: '7-8岁', level: 2 },
}

const TEMPLATE_STRUCTURE = [
  { slideNum: 1, type: 'cover', title: '封面' },
  { slideNum: 2, type: 'intro', title: '课前互动卡' },
  { slideNum: 3, type: 'objective', title: '学习目标' },
  { slideNum: 4, type: 'content', title: '知识讲解' },
  { slideNum: 5, type: 'activity', title: '活动设计' },
  { slideNum: 6, type: 'interaction', title: '课堂互动' },
  { slideNum: 7, type: 'discussion', title: '思考讨论' },
  { slideNum: 8, type: 'values', title: '价值引导' },
  { slideNum: 9, type: 'exercise', title: '小练习' },
  { slideNum: 10, type: 'home_link', title: '家校联动' },
  { slideNum: 11, type: 'homework', title: '作业建议' },
  { slideNum: 12, type: 'summary', title: '课堂总结' },
]

// ========== 主题分析引擎 ==========
// 根据主题关键词分析属于哪个类别，生成匹配的内容

const TOPIC_CATEGORIES = {
  // 生活习惯类
  habits: {
    keywords: ['叠被子', '整理', '洗手', '刷牙', '早起', '早睡', '吃饭', '节约', '环保', '打扫', '卫生', '穿衣服', '排队', '守时', '作息', '锻炼', '运动', '护眼', '洗手帕', '洗袜子'],
    label: '生活习惯',
    storyTemplates: [
      (t) => `小明每天早上起床后，被子总是乱糟糟的。\n妈妈说："自己的事情自己做哦！"\n小明学着妈妈的样子，把被子叠得整整齐齐。\n第二天老师来家访，看到小明的房间，竖起大拇指说："小明真棒！"\n小明开心地笑了，从此每天都会自己叠被子。`,
      (t) => `小红的书桌上总是很乱，找东西要找好久。\n有一天，她按照老师教的方法，把铅笔放进笔筒，书本摆整齐，本子叠在一起。\n第二天上课，她一下就找到了要用的课本！\n小红发现：整理好自己的东西，真的能让生活更方便。`,
      (t) => `小刚以前不爱洗手，吃东西前总是直接拿起来就吃。\n有一次肚子疼去了医院，医生叔叔说："要养成勤洗手的好习惯呀！"\n小刚记住了医生的话，现在饭前便后都会认真洗手。\n他还成了班里的"卫生小标兵"呢！`,
    ],
    getWarmupQ: (t) => `小朋友们，你们每天早上起床后，第一件事会做什么呢？\n有没有自己${t}的经历？\n觉得${t}难不难呀？`,
    getGame: (t) => `「${t}小达人」游戏：\n老师在黑板上写出${t}的步骤，小朋友们按顺序排好队，一个接一个说出正确的做法。全部说对的同学可以得到一颗小星星！`,
    getObjective: (t) => `1. 学会${t}的正确方法\n2. 明白好习惯要从身边小事做起\n3. 养成每天坚持的好习惯`,
    getValue: (t) => `${t}看起来是一件小事，但坚持做好每一件小事，就是在让自己变得更棒！\n\n良好的习惯就像一颗小种子🌱\n每天浇灌它，它会慢慢长成参天大树！`,
    getHomework: (t) => `坚持一周每天${t}，\n在日历上画一个笑脸😊记录。\n一周后带到学校分享你的"笑脸日历"！`,
    getSteps: (t) => {
      // 针对不同习惯主题生成专属步骤
      const stepsMap = {
        '叠被子': `📋 叠被子的正确步骤\n\n第①步：先把被子四角对齐，铺平整 🛏️\n第②步：把被子竖向对折一次，变成长条形\n第③步：再横向对折一次，变成方块形\n第④步：双手压平，边角对齐，整整齐齐放好 ✅\n\n💡 小诀窍：\n每次对折都要从中间往两边压平哦！\n这样叠出来的被子又平整又好看！`,
        '整理': `📋 整理书包的正确步骤\n\n第①步：先把所有东西都倒出来 📚\n第②步：按「今天要用的」和「不用的」分开\n第③步：课本放进去，大的在下面，小的在上面\n第④步：文具放进笔袋，装好拉链 ✏️\n第⑤步：检查一遍，明天的书本都带齐了吗？\n\n💡 小诀窍：每天晚上提前准备好，早上不着急！`,
        '洗手': `📋 正确洗手的七步法\n\n第①步：打开水龙头，把手打湿 💧\n第②步：取适量洗手液，搓出泡沫\n第③步：掌心对掌心，搓手掌\n第④步：手指交叉，搓手背\n第⑤步：弯曲手指，搓指缝\n第⑥步：大拇指转圈搓 👍\n第⑦步：冲干净，用毛巾擦干 🙌\n\n💡 每次搓手不少于20秒！`,
        '刷牙': `📋 正确刷牙的步骤\n\n第①步：挤豌豆大小的牙膏 🦷\n第②步：先刷外侧，上下轻轻刷\n第③步：再刷内侧，同样上下刷\n第④步：刷咬合面，前后来回刷\n第⑤步：最后轻刷舌头\n第⑥步：漱口，把泡泡吐干净 💧\n\n💡 早晚各一次，每次至少2分钟！`,
      }
      // 查找最匹配的步骤
      for (const key of Object.keys(stepsMap)) {
        if (t.includes(key)) return stepsMap[key]
      }
      // 通用模板
      return `📋 「${t}」的正确方法\n\n第①步：做好准备，心情放轻松 😊\n第②步：按照正确顺序一步一步来\n第③步：做完检查一下，做好了吗？\n第④步：整理干净，把物品放回原位 ✅\n\n💡 小口诀：\n「一做准备二按步，三来检查四整理」\n天天练习，很快就能做好！`
    },
    getHomeLink: (t) => `🏠 带回家的任务\n\n今天我们学了「${t}」\n快跟爸爸妈妈说说你学到了什么！\n\n亲子小活动：\n今晚请爸爸妈妈陪你一起练习「${t}」\n看看谁做得又快又整齐！\n\n把你们的成果拍张照片，明天带到学校分享 📸`,
    getImageKeyword: (t) => 'children daily routine habits illustration watercolor',
  },
  // 品德修养类
  morality: {
    keywords: ['诚实', '守信', '诚信', '善良', '感恩', '友爱', '帮助', '分享', '尊重', '礼貌', '谦虚', '宽容', '感恩', '孝顺', '爱心'],
    label: '品德修养',
    storyTemplates: [
      (t) => `有一天，小花在操场上捡到一支漂亮的钢笔。\n她很想要，但想起老师说过："别人的东西不能拿。"\n小花把钢笔交给了老师，老师表扬了她。\n第二天，失主找到了钢笔，特别感谢小花。\n小花觉得：做对的事情，心里特别踏实！`,
      (t) => `小强答应帮同桌值日，可是放学后好朋友约他去踢球。\n小强想了想，对朋友说："我答应了帮同桌值日，明天再一起踢球吧！"\n朋友说："没关系，明天一起玩！"\n同桌很感动，从此他们成了最好的朋友。`,
      (t) => `下大雨了，小丽看到同班同学小刚没有带伞。\n小丽主动走过去说："我们一起打伞回家吧！"\n小刚非常感动，第二天带来了一本书送给小丽。\n老师说：帮助别人，快乐自己。这句话是真的呢！`,
    ],
    getWarmupQ: (t) => `小朋友们，你们觉得一个${t}的人，大家会喜欢和他做朋友吗？\n你身边有没有${t}的人？\n能和大家说说他做了什么吗？`,
    getGame: (t) => `「${t}小剧场」：\n老师给出几个场景，小朋友们用演一演的方式，展示怎样才是${t}的。\n全班同学当"评委"，竖大拇指👍选出最佳表演！`,
    getObjective: (t) => `1. 理解${t}的含义和重要性\n2. 学会在生活中践行${t}\n3. 懂得${t}能让我们交到更多朋友`,
    getValue: (t) => `${t}是一种很了不起的品质。\n它像阳光一样温暖☀️照亮自己和身边的人。\n\n每个人都做到${t}，我们的班级和世界会更美好！`,
    getHomework: (t) => `今天做一件${t}的事，\n把这件事画下来或写下来。\n明天来学校讲给同学们听！`,
    getHomeLink: (t) => `🏠 带回家的任务\n\n今天我们学了「${t}」\n快跟爸爸妈妈讲一讲吧！\n\n亲子小活动：\n和爸爸妈妈分享一个你觉得很${t}的人的故事，\n也可以说说你自己做到${t}的经历 😊\n\n互相问对方：「你最喜欢${t}的哪一面？」`,
    getImageKeyword: (t) => 'children kindness sharing friendship watercolor illustration',
  },
  // 规则意识类
  rules: {
    keywords: ['规则', '交通', '安全', '排队', '纪律', '课堂', '校园', '过马路', '红绿灯', '校规', '班规', '守秩序', '公共'],
    label: '规则意识',
    storyTemplates: [
      (t) => `上学路上，小明看到红灯亮了，但他不想等，想直接跑过去。\n这时，大哥哥拉住了他说："红灯停，绿灯行，安全第一呀！"\n小明不好意思地退了回来。\n绿灯亮了，他安全地过了马路，心想：规则是在保护我们呢！`,
      (t) => `体育课上，老师说"按身高排队"，可是有的小朋友挤来挤去。\n小芳主动站到自己的位置上，其他同学看到后也安静地排好队。\n老师表扬了大家，活动顺利开始了。\n小芳发现：遵守规则，事情会变得更顺利。`,
      (t) => `图书馆里，有几个小朋友在大声说话。\n小杰举手说："嘘——图书馆要保持安静哦！"\n那几个小朋友赶紧捂住嘴巴，不好意思地笑了。\n图书管理员阿姨给小杰竖了大拇指👍`,
    ],
    getWarmupQ: (t) => `小朋友们，你们知道为什么要有${t}吗？\n如果大家都不遵守${t}，会发生什么有趣的事？\n来大胆想象一下！`,
    getGame: (t) => `「规则小卫士」游戏：\n老师说出几个场景，小朋友们判断该怎么做。做对的同学获得一枚"规则小卫士"徽章！\n\n场景1：过马路时看到红灯...→\n场景2：在图书馆想说话...→\n场景3：食堂打饭要...→`,
    getObjective: (t) => `1. 知道生活中有哪些${t}\n2. 理解${t}的意义——保护每个人的安全\n3. 学会自觉遵守${t}`,
    getValue: (t) => `${t}不是在限制我们，而是在保护我们。\n就像马路上的红绿灯🚦，虽然要等，但让我们安全通过。\n\n每个人遵守规则，大家都能更安全、更快乐！`,
    getHomework: (t) => `观察生活中有哪些${t}，\n记录下你看到的3条规则。\n想想它们为什么存在？\n明天来和同学们分享！`,
    getHomeLink: (t) => `🏠 带回家的任务\n\n今天我们学了「${t}」\n快跟爸爸妈妈聊一聊吧！\n\n亲子小活动：\n和爸爸妈妈一起散步或坐公交，\n观察路上有哪些${t}，\n数一数，看谁找到的最多 🔍\n\n把你找到的规则告诉老师！`,
    getImageKeyword: (t) => 'children following rules traffic safety watercolor illustration',
  },
  // 人际交往类
  social: {
    keywords: ['朋友', '团结', '合作', '相处', '同学', '一起', '分享', '友好', '包容', '道歉', '原谅', '和好', '相处', '打招呼', '新朋友'],
    label: '人际交往',
    storyTemplates: [
      (t) => `新学期开学，班上来了一个新同学叫小美。\n她一个人坐在角落，看起来很紧张。\n小雪主动走过去说："你好呀，我叫小雪，我们一起玩吧！"\n小美开心地笑了，从此她们成了最好的朋友。\n老师说：主动伸出友谊的手，就能收获一段友情。`,
      (t) => `小明和小刚因为一块橡皮吵了起来，谁也不理谁。\n放学后，小明一个人走在路上，觉得没有好朋友一起走，好孤单。\n第二天，小明鼓起勇气说："对不起，昨天是我不好。"\n小刚也红了脸说："我也有不对的地方。"\n他们又和好了，友谊更深厚了。`,
      (t) => `分组做手工的时候，小丽和小华意见不同，争了起来。\n小组长小芳说："我们试试两个人的想法都放上去吧！"\n结果做出来的手工作品特别好看，得了第一名🏆\n大家都明白了：团结合作的力量比一个人大得多！`,
    ],
    getWarmupQ: (t) => `小朋友们，你最好的朋友是谁？\n你们是怎么成为朋友的？\n和朋友在一起最开心的事情是什么？`,
    getGame: (t) => `「交友大闯关」游戏：\n第一关：找到你还没说过话的同学，跟他说一句"你好"。\n第二关：和他分享一件你觉得有趣的事。\n第三关：一起完成一个小任务。\n闯关成功就获得"交友达人"称号！`,
    getObjective: (t) => `1. 学会和新同学友好相处\n2. 懂得和朋友发生矛盾时要沟通\n3. 体验合作带来的快乐`,
    getValue: (t) => `好朋友就像星星⭐，不会一直都在，但会照亮你的路。\n\n${t}需要用心经营——\n多一些理解，少一些计较，\n多一句"没关系"，少一句"都是你的错"。`,
    getHomework: (t) => `今天主动和一个同学说一句温暖的话，\n或者帮同学做一件小事。\n把你的感受记录下来！`,
    getHomeLink: (t) => `🏠 带回家的任务\n\n今天我们学了「${t}」\n快跟爸爸妈妈讲一讲吧！\n\n亲子小活动：\n和爸爸妈妈一起做个小游戏：\n每人说一件对方最近做的让你开心的事，\n互相说声"谢谢你" 💛\n\n明天来学校分享你们的故事！`,
    getImageKeyword: (t) => 'children friendship playing together watercolor illustration',
  },
  // 爱国爱家类
  patriotic: {
    keywords: ['国旗', '国歌', '祖国', '家乡', '家庭', '父母', '老师', '校园', '传统', '节日', '中秋', '端午', '春节', '国庆', '劳动'],
    label: '爱国爱家',
    storyTemplates: [
      (t) => `周一早上，学校举行升旗仪式。\n国歌响起的时候，小华站得笔直，目不转睛地看着国旗缓缓升起。\n爷爷跟他说："这面旗帜，是无数英雄用生命换来的。"\n小华郑重地点了点头，心里暗暗想：我也要做一个对国家有用的人！`,
      (t) => `国庆节放假，小芳回到爷爷奶奶家。\n奶奶给她讲了村里的故事，带她看了金色的稻田和清澈的小河。\n小芳用画笔画下了美丽的家乡风景。\n她在画上写道：我爱我的家乡，也爱我的祖国！`,
      (t) => `春节到了，全家人一起包饺子。\n爸爸和面，妈妈调馅，小亮学着包了一个奇形怪状的饺子。\n全家人看着他的"作品"笑得前仰后合。\n奶奶说："虽然不好看，但是小亮包的，一定最好吃！"\n小亮觉得，和家人在一起的时光最幸福。`,
    ],
    getWarmupQ: (t) => `小朋友们，你最喜欢我们国家的什么？\n是壮丽的山河？还是美味的美食？\n还是了不起的文化？来分享一下吧！`,
    getGame: (t) => `「知识小竞答」：\n老师说出一道关于${t}的题目，\n知道答案的小朋友举手抢答！\n答对得一分，最后看谁是小冠军🏆`,
    getObjective: (t) => `1. 了解${t}的基本知识\n2. 培养对祖国和家乡的热爱\n3. 学会用行动表达爱和感恩`,
    getValue: (t) => `${t}是我们每个人心中最温暖的角落🏠\n\n爱祖国、爱家乡、爱家人，\n这三种爱像三朵花🌷，\n让我们的生活充满温暖和力量！`,
    getHomework: (t) => `回家后跟家人聊一聊${t}，\n了解一个你以前不知道的小知识或小故事，\n明天来学校分享给大家！`,
    getHomeLink: (t) => `🏠 带回家的任务\n\n今天我们学了「${t}」\n快跟爸爸妈妈分享吧！\n\n亲子小活动：\n请爸爸妈妈讲一个关于「${t}」的小故事，\n可以是他们小时候的记忆，或者家乡的故事 🏡\n\n用画笔把最喜欢的场景画出来，明天带到学校！`,
    getImageKeyword: (t) => 'children family love patriotic watercolor illustration',
  },
  // 自我成长类
  growth: {
    keywords: ['自信', '勇敢', '坚持', '努力', '梦想', '目标', '进步', '长大', '保护自己', '安全', '身体', '情绪', '开心', '难过', '害怕'],
    label: '自我成长',
    storyTemplates: [
      (t) => `学校要举行演讲比赛，小美很想参加，但她害怕在台上说话。\n老师鼓励她："勇敢不是不害怕，而是害怕了还去做！"\n小美每天对着镜子练习，终于在比赛那天大声说出了自己的故事。\n虽然没有得第一名，但全场同学都给她鼓掌👏`,
      (t) => `小刚学骑自行车，摔了好几次，哭着说不想学了。\n爸爸说："每个人都会摔倒，但站起来就是最棒的！"\n小刚擦掉眼泪，继续骑，终于学会了！\n他开心地在小区里骑了一圈又一圈，风从耳边吹过，感觉太棒了！`,
      (t) => `小芳画画总是画不好，她很沮丧。\n美术老师说："你看，你画的这棵树比上周的绿色更多了，这就是进步呀！"\n小芳仔细一看，真的！她不再和别人比，只和昨天的自己比。\n一个月后，她的画被贴在了教室的展示墙上🎨`,
    ],
    getWarmupQ: (t) => `小朋友们，你有没有特别想做但不敢做的事情？\n比如上台表演、学一项新技能？\n是什么让你鼓起勇气的呢？`,
    getGame: (t) => `「勇敢小树苗」游戏：\n每人说出一件自己觉得有挑战的事，\n同学们一起喊"加油，你可以的！"\n说完后，在黑板的"成长树"上贴一片自己的叶子。\n看看我们的成长树有多茂盛！`,
    getObjective: (t) => `1. 理解${t}的意义\n2. 学会面对困难不放弃\n3. 发现自己的闪光点，树立自信`,
    getValue: (t) => `每个人都是独一无二的🌟\n不需要和别人比，只要比昨天的自己进步一点点就够了。\n\n记住：\n勇敢尝试就是成功，\n坚持到底就是胜利！`,
    getHomework: (t) => `今天做一件你以前不敢做的事情，\n不管结果怎样，都为自己鼓掌。\n在日记本上写下你的感受！`,
    getHomeLink: (t) => `🏠 带回家的任务\n\n今天我们学了「${t}」\n快跟爸爸妈妈讲一讲吧！\n\n亲子小活动：\n请爸爸妈妈说一件他们小时候克服困难的事，\n你也说一件你觉得自己最勇敢的时刻 💪\n\n互相鼓励，明天来学校分享！`,
    getImageKeyword: (t) => 'children growing confidence brave watercolor illustration',
  },
  // 自然环保类
  nature: {
    keywords: ['植物', '动物', '春天', '秋天', '四季', '天气', '环保', '节约', '水', '垃圾', '绿色', '自然', '花', '树', '保护', '地球'],
    label: '自然环保',
    storyTemplates: [
      (t) => `春天来了，老师带同学们去公园观察植物。\n小杰发现了一棵小树苗，他每天给它浇水。\n一个月后，小树苗长高了一大截！\n小杰在日记里写道：照顾小树就像照顾朋友，需要耐心和爱心。\n老师把他的日记贴在了班级墙上。`,
      (t) => `下雨天，小红看到路上有很多塑料袋被风吹来吹去。\n她和同学们商量后，决定每周五做"环保小卫士"，在学校周围捡垃圾。\n一个月后，学校门口变得干干净净的。\n校长在全校大会上表扬了他们🌍`,
      (t) => `小刚洗手的时候水龙头开得很大。\n小丽提醒他："水是很珍贵的资源哦，要节约用水！"\n小刚好奇地问："地球上海洋那么大，水不是很多吗？"\n小丽说："能喝的淡水只有一小部分呢！"\n从那以后，小刚每次用水都会关紧水龙头💧`,
    ],
    getWarmupQ: (t) => `小朋友们，你们知道我们身边有哪些${t}吗？\n你最喜欢大自然中的什么？\n花草？小鸟？还是蓝天白云？`,
    getGame: (t) => `「自然小侦探」游戏：\n老师描述一种动物或植物的特征，\n小朋友们猜猜是什么。\n猜对的同学可以获得一枚"自然小侦探"徽章🔍\n\n提示：它有四条腿，会汪汪叫...→`,
    getObjective: (t) => `1. 认识和了解${t}的基本知识\n2. 培养热爱自然、保护环境的意识\n3. 学会用行动爱护我们的地球`,
    getValue: (t) => `地球是我们唯一的家🌍\n每一个小行动都在守护它——\n少用一张纸、关紧水龙头、不乱扔垃圾。\n\n我们每个人都是地球的小小守护者！`,
    getHomework: (t) => `今天在家里做一件环保小事，\n比如：用洗脸水浇花、把垃圾分类、关掉不用的灯。\n画一幅关于${t}的画带给学校！`,
    getHomeLink: (t) => `🏠 带回家的任务\n\n今天我们学了「${t}」\n快跟爸爸妈妈分享吧！\n\n亲子小活动：\n和爸爸妈妈一起在家里做一件环保小事：\n💧 关紧没用的水龙头\n🌱 给家里的植物浇水\n🗑️ 帮家人把垃圾分类\n\n做完在日历上画一个🌿，坚持一周！`,
    getImageKeyword: (t) => 'children nature environment plants animals watercolor illustration',
  },
}

// 根据主题匹配类别
function matchCategory(topic) {
  for (const [key, cat] of Object.entries(TOPIC_CATEGORIES)) {
    for (const kw of cat.keywords) {
      if (topic.includes(kw)) return cat
    }
  }
  // 兜底：放到品德修养
  return TOPIC_CATEGORIES.morality
}

// ========== 智能模板引擎（根据主题动态生成内容） ==========

function generateWithTemplate(topic, grade, pages, options) {
  const cat = matchCategory(topic)
  const style = GRADE_STYLES[grade] || GRADE_STYLES['一年级上']
  const slideCount = Math.min(pages, 12)
  const slides = []

  // 随机选故事模板（根据页数循环）
  const storyFn = cat.storyTemplates[Math.floor(Math.random() * cat.storyTemplates.length)]

  for (let i = 0; i < slideCount; i++) {
    const tmpl = TEMPLATE_STRUCTURE[i]
    slides.push({
      slideNum: tmpl.slideNum,
      type: tmpl.type,
      title: buildSlideTitle(tmpl.type, topic),
      content: buildSlideContent(tmpl.type, topic, grade, cat),
      topic: topic,
      note: `「${topic}」第${tmpl.slideNum}页教师备注`,
      imageKeyword: cat.getImageKeyword(topic),
    })
  }

  const introCard = options.intro !== false ? {
    question: cat.getWarmupQ(topic),
    game: cat.getGame(topic),
  } : null

  return {
    title: topic,
    subtitle: `${grade} 道德与法治`,
    tags: guessTags(topic),
    introCard,
    slides,
    imageKeyword: cat.getImageKeyword(topic),
  }
}

// 根据页面类型和主题构建标题
function buildSlideTitle(type, topic) {
  const titles = {
    cover: topic,
    intro: `课前暖场·${topic}`,
    objective: `今天学什么`,
    content: `主题故事`,
    activity: `课堂活动`,
    interaction: `想一想·说一说`,
    discussion: `小组讨论`,
    values: `我们学到了`,
    exercise: `动手练一练`,
    home_link: `带回家的任务`,
    homework: `课后小挑战`,
    summary: `今天总结`,
  }
  return titles[type] || type
}

// 根据页面类型和主题构建内容
function buildSlideContent(type, topic, grade, cat) {
  const style = GRADE_STYLES[grade] || GRADE_STYLES['一年级上']

  switch (type) {
    case 'cover':
      return `${topic}\n${grade} 道德与法治\n——快乐学习每一天`

    case 'intro':
      return `🤔 暖场提问\n${cat.getWarmupQ(topic)}\n\n🎲 热身小游戏\n${cat.getGame(topic)}`

    case 'objective':
      return `🎯 今天我们要学习：\n\n${cat.getObjective(topic)}\n\n准备好了吗？开始今天的快乐之旅吧！`

    case 'content':
      // habits 类别：优先展示步骤教学
      if (cat.getSteps) {
        return `${cat.getSteps(topic)}`
      }
      return `📖 听老师讲故事\n\n${cat.storyTemplates[Math.floor(Math.random() * cat.storyTemplates.length)](topic)}\n\n小朋友们，故事里的小伙伴做得对吗？`

    case 'activity':
      return `🎨 活动时间\n\n活动一：角色扮演 🎭\n请3-4位小朋友，演一演关于「${topic}」的小场景。\n全班一起来当"小评委"！\n\n活动二：主题绘画 🖌️\n把你理解的「${topic}」画出来，\n贴在教室的"成长墙"上！`

    case 'interaction':
      return `🙋 举手回答\n\n问题1：你在生活中遇到过关于「${topic}」的事吗？\n能和大家分享一下吗？\n\n问题2：你觉得「${topic}」难不难做到？\n有什么好办法吗？\n\n问题3：如果好朋友做不到「${topic}」，你会怎么帮他？\n\n勇敢说出你的想法吧！`

    case 'discussion':
      return `💬 小组讨论\n\n和同桌一起讨论2分钟：\n\n你觉得如果每个人都能做到「${topic}」，\n我们的班级会变成什么样？\n我们的家会变成什么样？\n\n每组派一个代表来分享你们的想法！`

    case 'values':
      return `🌟 今天我们学到了\n\n${cat.getValue(topic)}`

    case 'exercise':
      return `✏️ 动手练一练\n\n练习1：情景判断\n老师说出一个场景，\n你认为对的竖起👍，错的摇头🙅\n\n练习2：完成一句话\n「如果我做到了${topic}，我会觉得_____」\n\n练习3：给小伙伴点赞\n找一位做得好的同学，\n对他说一句鼓励的话！`

    case 'home_link':
      if (cat.getHomeLink) return cat.getHomeLink(topic)
      return `🏠 带回家的任务\n\n今天我们在学校学了「${topic}」\n快跟爸爸妈妈聊一聊吧！\n\n亲子小活动：\n今晚和爸爸妈妈一起讨论「${topic}」，\n说说你在学校学到了什么，\n也问问他们关于「${topic}」的想法 😊\n\n把你们的对话分享给老师！`

    case 'homework':
      return `📝 课后小挑战\n\n${cat.getHomework(topic)}`

    case 'summary':
      return `🎊 今天的收获\n\n✅ 我们知道了「${topic}」是什么\n✅ 学会了怎么做\n✅ 以后要在生活中坚持\n\n每个小朋友今天都很棒！\n给自己一个大大的 👍 吧！`

    default:
      return `第${topic}页内容`
  }
}

// 智能猜标签
function guessTags(topic) {
  const cat = matchCategory(topic)
  const tagMap = {
    habits: ['responsibility', 'personality'],
    morality: ['morality', 'personality'],
    rules: ['law', 'responsibility'],
    social: ['personality', 'morality'],
    patriotic: ['morality', 'citizenship'],
    growth: ['personality', 'responsibility'],
    nature: ['citizenship', 'responsibility'],
  }
  return tagMap[Object.keys(TOPIC_CATEGORIES).find(k => TOPIC_CATEGORIES[k] === cat)] || ['morality', 'personality']
}

// ========== AI 生成（有 API Key 时） ==========

function buildPrompt(topic, grade, pages, options = {}) {
  const style = GRADE_STYLES[grade] || GRADE_STYLES['一年级上']
  const slideStructure = TEMPLATE_STRUCTURE.slice(0, pages)
    .map(s => `第${s.slideNum}页 [${s.type}] ${s.title}`)
    .join('\n')

  return `你是一位专业的小学道德与法治课课件设计师。请根据以下要求生成课件内容：

## 基本信息
- 课题：${topic}
- 年级：${grade}
- 课件页数：${pages}页
- 语言风格：${style.tone}（${style.age}）
- 教材版本：人教版（2024年新课改）

## 核心素养要求
请从以下维度中标注本课涉及的核心素养（至少2个）：
- 道德修养、法治观念、健全人格、责任意识、公民意识

## 课件结构
${slideStructure}

## 内容要求
- 内容必须围绕课题「${topic}」展开，不能泛泛而谈
- 每页要有具体的故事、场景或案例
- 避免生硬的"了解什么是XX"式标题
- 用贴近${style.age}小学生生活的语言

## 每页配图关键词
为每页提供一个 imageKeyword 字段，用于搜索水彩风格配图

## 输出格式（纯JSON，不要输出其他内容）
{
  "title": "课件标题",
  "subtitle": "副标题",
  "tags": ["morality", "personality"],
  "introCard": {
    "question": "暖场提问（要和主题相关，不能泛泛而谈）",
    "game": "热身小游戏（要和主题相关）"
  },
  "imageKeyword": "watercolor illustration keyword",
  "slides": [
    {
      "slideNum": 1,
      "type": "cover",
      "title": "标题（避免"了解什么是XX"）",
      "content": "正文内容（用\\n分行，内容要具体丰富，围绕主题展开）",
      "imageKeyword": "image search keyword for this slide",
      "note": "教师备注"
    }
  ]
}`
}

async function generateWithAI(topic, grade, pages, options, apiKey) {
  const client = new OpenAI({ apiKey })
  const prompt = buildPrompt(topic, grade, pages, options)

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: '你是一位专业的小学道德与法治课课件设计师，擅长设计符合新课改要求的课件内容。你只输出JSON格式的内容，不输出其他任何文字。内容要围绕具体课题展开，每页内容要生动具体，不能用"了解什么是XX"这种生硬表述。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 4000,
  })

  const content = response.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0])
  }
  throw new Error('AI 返回格式异常')
}

// ========== 主入口 ==========

export async function generateCourseContent(topic, grade, pages = 12, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY

  if (apiKey && apiKey !== 'your-api-key-here') {
    try {
      return await generateWithAI(topic, grade, pages, options, apiKey)
    } catch (err) {
      console.warn('AI 生成失败，降级为智能模板:', err.message)
    }
  }

  console.log(`使用智能模板生成：「${topic}」`)
  return generateWithTemplate(topic, grade, pages, options)
}
