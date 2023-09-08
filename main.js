require('dotenv').config();

const { getCompletion } = require('./apis');
const { createConnection, insert, checkAndUpdateMeta } = require('./database');

main();

async function main() {
  const word = getWord();

  const connection = await createConnection();

  try {
    const title = await genTitle(word);

    const content = await genContent(title);

    const createdTime = new Date().getTime().toString().slice(0, 10);

    const data = {
      title,
      text: `<!--markdown-->${content}`,
      status: 'publish',
      authorId: 1,
      type: 'post',
      allowFeed: 1,
      slug: title,
      created: createdTime,
      modified: createdTime
    };

    // 插入文章
    const { insertId: cid } = await insert(connection, '10w_contents', data);

    // 创建或者更新 meta 表
    const { mid } = await checkAndUpdateMeta(connection, word);

    // 和关键词关联
    await insert(connection, '10w_relationships', { cid, mid });

    // 和默认分类关联
    await insert(connection, '10w_relationships', { cid, mid: 1 });
  } catch (error) {
    console.log(error);
  }

  connection.end((err, res) => {
    console.log(err);
    console.log(res);
  });
}

async function genContent(title) {
  const fragments = [`你是一个全能的学者，我需要根据我给你的标题回答我一篇内容，内容最少包含200字；你只需要输出内容，不需要其他内容。我给你的标题是：${title}`];

  const { choices } = await getCompletion([
    {
      role: 'user',
      content: fragments.join('')
    }
  ]);

  return choices[0].message.content;
}

async function genTitle(word) {
  const fragments = [`你是一个全能的学者，我需要围绕我给你的核心词生成一个类似于十万个为什么的标题，这个标题重复概率要低；你只需要生成一个标题；这个标题不需要使用“《》”等符号进行包裹；你只需要输出标题，不需要其他内容。我给你的核心词是：${word}`];

  const { choices } = await getCompletion([
    {
      role: 'user',
      content: fragments.join('')
    }
  ]);

  return choices[0].message.content;
}

function getWord() {
  const words = [
    '人工智能',
    '机器学习',
    '大数据',
    '云计算',
    '物联网',
    '区块链',
    '虚拟现实',
    '增强现实',
    '生物技术',
    '无人驾驶',
    '可穿戴设备',
    '智能家居',
    '智能手机',
    '社交媒体',
    '电子商务',
    '电子支付',
    '数字货币',
    '网络安全',
    '数据隐私',
    '人脸识别',
    '语音识别',
    '自然语言处理',
    '计算机视觉',
    '虚拟助手',
    '自动驾驶',
    '无人机',
    '太空探索',
    '可持续发展',
    '环境保护',
    '气候变化',
    '再生能源',
    '生物多样性',
    '可再生能源',
    '绿色技术',
    '环保产品',
    '健康与健身',
    '心理健康',
    '营养饮食',
    '健身器材',
    '健康监测',
    '健康应用',
    '健康咨询',
    '医疗技术',
    '远程医疗',
    '基因组学',
    '干细胞研究',
    '癌症治疗',
    '心血管健康',
    '免疫疗法',
    '心理学',
    '教育技术',
    '在线学习',
    '远程教育',
    '虚拟学习',
    '电子图书',
    '教育应用',
    '编程教育',
    '人才发展',
    '职业培训',
    '创业',
    '创新',
    '科技创新',
    '社会创新',
    '可持续创新',
    '文化创意',
    '艺术',
    '音乐',
    '电影',
    '文学',
    '摄影',
    '时尚',
    '设计',
    '游戏',
    '体育',
    '足球',
    '篮球',
    '网球',
    '高尔夫',
    '滑雪',
    '健身',
    '旅游',
    '自然风光',
    '文化遗产',
    '城市旅游',
    '冒险旅行',
    '美食',
    '时尚',
    '音乐节',
    '电子音乐',
    '流行音乐',
    '摇滚乐',
    '古典音乐',
    '民族音乐',
    '社交网络',
    '微博',
    '微信',
    '抖音',
    'Ins',
    '脸书',
    '推特',
    '领导力',
    '团队合作',
    '沟通技巧',
    '时间管理',
    '决策力',
    '创造力',
    '人际关系',
    '情绪智商',
    '金融科技',
    '支付技术',
    '投资',
    '股票市场',
    '加密货币',
    '保险',
    '财务规划',
    '房地产',
    '房屋装修',
    '房地产投资',
    '房地产市场',
    '房屋销售',
    '房地产经纪',
    '汽车',
    '电动汽车',
    '智能汽车',
    '自动驾驶汽车',
    '汽车技术',
    '汽车保养',
    '旅游',
    '酒店预订',
    '旅行攻略',
    '旅行箱',
    '旅行社',
    '旅行保险'
  ];

  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
}
