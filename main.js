require('dotenv').config();

const { getCompletion } = require('./apis');
const { createConnection, insert, checkAndUpdateMeta } = require('./database');
const { unique } = require('./utils');
const { words } = require('./words');

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
      text: handleContent(content),
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

function handleContent(content) {
  // 在第二个段落后添加 <!--more-->
  const paragraphs = content.split('\n\n');
  paragraphs.splice(2, 0, '<!--more-->');
  content = paragraphs.join('\n\n');

  return `<!--markdown-->${content}`;
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
  const _words = unique(words);
  const randomIndex = Math.floor(Math.random() * _words.length);
  return _words[randomIndex];
}
