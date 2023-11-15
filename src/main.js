
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import parseArgs from 'minimist'
import 'dotenv/config'
import { createConnection, insert, checkAndUpdateMeta } from './database'
import { transformContent } from './transforms'
import { genContent, genTitle, getKeyword } from './generators'
import { getLang } from './utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.resolve(__filename, '..')

const argv = parseArgs(process.argv.slice(2))
const lang = getLang(argv.lang)

main();

async function main() {
  const keyword = await getKeyword(lang)
  const title = await genTitle(keyword, lang)
  const content = await genContent(title, lang)

  if (true) {
    const mdDir = path.resolve(__dirname, './markdown')
    const filename = `${title.replace(/[\/:*?"<>|]/g, '-')}.md`
    const filepath = path.resolve(mdDir, filename)
    await fs.ensureDir(mdDir)

    const _content = transformContent(content)
    await fs.writeFile(filepath, _content)
  }

  const connection = await createConnection();

  try {
    const createdTime = new Date().getTime().toString().slice(0, 10);

    const data = {
      title,
      text: transformContent(content),
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
    const { mid } = await checkAndUpdateMeta(connection, keyword);

    // 和关键词关联
    await insert(connection, '10w_relationships', { cid, mid });

    // 和默认分类关联
    await insert(connection, '10w_relationships', { cid, mid: 1 });

    console.log('文章生成成功：', title)
  } catch (error) {
    console.log(error);
  } finally {
    const err = await connection.end();
    if (err) {
      console.error('关闭连接时出错：', err.message);
    } else {
      console.log('连接已成功关闭。');
    }
  }
}
