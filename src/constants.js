export const BASE_URL = process.env.NODE_ENV === 'production' ? '/' : process.env.GENDATA_DEV_BASE_URL;

export const DEFAULT_MODEL_VERSION = 'v3';

// 数据库中最大关联关键词数量，超过这个数量以后就不会找 AI 生成新的关键词了
export const MAX_RELATED_KEYWORDS = 10;

// AI 生成的标题长度
export const TITLE_LENGTH = 50

// AI 生成文章的最小长度
export const CONTENT_MIN_LENGTH = 5000

// 语言列表
export const LANG_ENUM = {
  'zh': '中文',
  'en': '英文',
  'jp': '日文',
  'kr': '韩文',
  'fr': '法文',
  'de': '德文',
}

// 默认语言
export const DEFAULT_LANG = ['zh', LANG_ENUM['zh']];