# 文章自动生成

基于 openai 自动化生成文章。

## 使用

```bash
# 默认中文
node index.js

# 使用其他语言
node index.js --lang en
```

支持的语言在 `src/constants.js` 中定义（`LANG_ENUM`）

## 自动化流程

1. 读取基础关键词 keywords.txt
1. 随机选取一个基础关键词
1. 根据基础关键词生成一个相关关键词
1. 根据关键词生成一个相关标题
1. 根据标题生成一篇相关文章
