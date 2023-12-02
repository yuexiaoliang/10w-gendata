import { getCompletion } from './apis'
import { getRandomItem } from './utils'
import { openKeywordsDB } from './lowdb'
import { TITLE_LENGTH, CONTENT_MIN_LENGTH, DEFAULT_LANG, MAX_RELATED_KEYWORDS, DEFAULT_MODEL_VERSION } from './constants'

export async function genContent(title, langOpt = DEFAULT_LANG) {
  const [_, lang] = langOpt

  const fragments = [
    `请以《${title}》为主题撰写一篇文章，并遵循如下要求：`,
    `语言：${lang}`,
    `风格：文章应该是信息性和吸引人的，适合普通读者群体。`,
    `结构：文章结构要符合SEO搜索引擎优化，包括但不限于：使用小标题来组织内容。`,
    `限制：不能出现电话、邮箱、名字等涉及隐私的个人信息。`,
    `字数限制：${CONTENT_MIN_LENGTH}字。`,
    `请确保文章内容真实性、研究充分，并且没有抄袭。`
  ];

  return await completion(fragments)
}

export async function genTitle(keyword, langOpt = DEFAULT_LANG) {
  const [_, lang] = langOpt

  const fragments = [
    `请根据以下要求生成一个标题：`,
    `语言：${lang}`,
    `类型：根据“${keyword}”这个关键词自行判定。`,
    `风格：根据“${keyword}”这个关键词的语境确定。`,
    `这个标题需要和“${keyword}”紧密相关。`,
    `长度不超过${TITLE_LENGTH}个字。`,
    `这个标题不能使用“《》”等符号进行包裹。`,
    `这个标题需要有利于SEO搜索引擎优化。`,
    `只需要一个标题`,
    `只能输出标题，不能输出其他内容。`,
  ]

  return await completion(fragments, 'v4')
}

export async function getKeyword(langOpt = DEFAULT_LANG) {
  const [langKey, langVal] = langOpt

  const [db, dbData] = openKeywordsDB()

  const baseKeywords = Object.keys(dbData)
  const baseKeyword = getRandomItem(baseKeywords)

  if (!dbData[baseKeyword][langKey]) {
    dbData[baseKeyword][langKey] = []
  }

  const relatedKeywords = dbData[baseKeyword][langKey]

  if (relatedKeywords.length >= MAX_RELATED_KEYWORDS) {
    return getRandomItem(relatedKeywords)
  }

  const fragments = [
    `请根据以下要求生成一个长尾关键词：`,
    `语言：${langVal}`,
    `这个关键词需要和“${baseKeyword}”紧密相关。`,
    `这个关键词不能和${JSON.stringify(relatedKeywords)}中的关键词重复。`,
    `这个关键词不能使用“《》”等符号进行包裹。`,
    `这个关键词需要有利于SEO搜索引擎优化。`,
    `只需要一个关键词`,
    `只能输出关键词，不能输出其他内容。`,
  ]

  const newTag = await completion(fragments, 'v3')

  dbData[baseKeyword][langKey].push(newTag)

  db.write()

  return newTag
}

async function completion(fragments, modelVersion = DEFAULT_MODEL_VERSION, messages = []) {
  const content = fragments.join('\n\n')

  const { choices } = await getCompletion([
    {
      role: 'user',
      content
    },
    ...messages
  ], modelVersion)

  return choices[0].message.content;
}