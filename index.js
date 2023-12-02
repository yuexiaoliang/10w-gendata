import fs from 'fs-extra';
import path, { resolve } from 'path';
import { fileURLToPath } from 'url';
import parseArgs from 'minimist';
import 'dotenv/config';
import 'mysql2/promise';
import axios from 'axios';
import { JSONSyncPreset } from 'lowdb/node';

const argv$1 = parseArgs(process.argv.slice(2));
argv$1.project;
({
  xiezi: process.env.GENDATA_DB_NAME
});
({
  xiezi: process.env.GENDATA_DB_USER
});
({
  xiezi: process.env.GENDATA_DB_PASSWORD
});

function transformContent(content) {
  const paragraphs = content.split("\n\n");
  paragraphs.splice(2, 0, "<!--more-->");
  content = paragraphs.join("\n\n");
  return `<!--markdown-->
${content}`;
}

const BASE_URL = process.env.NODE_ENV === "production" ? "/" : process.env.GENDATA_DEV_BASE_URL;
const DEFAULT_MODEL_VERSION = "v3";
const MAX_RELATED_KEYWORDS = 10;
const TITLE_LENGTH = 50;
const CONTENT_MIN_LENGTH = 1e3;
const LANG_ENUM = {
  "zh": "\u4E2D\u6587",
  "en": "\u82F1\u6587",
  "jp": "\u65E5\u6587",
  "kr": "\u97E9\u6587",
  "fr": "\u6CD5\u6587",
  "de": "\u5FB7\u6587"
};
const DEFAULT_LANG = ["zh", LANG_ENUM["zh"]];

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 5e5
});
instance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = `Bearer ${process.env.GENDATA_API_KEY}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    return data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const getCompletion = (messages, modelVersion = DEFAULT_MODEL_VERSION) => {
  const systemContent = `\u4F60\u56DE\u7B54\u7684\u5185\u5BB9\u4E0D\u80FD\u5305\u542B\u53CD\u52A8\u3001\u8272\u60C5\u3001\u8FDD\u6CD5\u7B49\u4E0D\u826F\u5185\u5BB9\u3002`;
  const v3Model = "gpt-3.5-turbo";
  const v4Model = "gpt-4-1106-preview";
  const model = {
    "v3": v3Model,
    "v4": v4Model
  }[modelVersion] || v3Model;
  return instance.post("/v1/chat/completions", {
    messages: [{ role: "system", content: systemContent }, ...messages],
    model,
    stream: false
  });
};

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getLang(name) {
  return [name, LANG_ENUM[name]];
}

const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = resolve(__filename$1, "..");
function openKeywordsDB() {
  const originalKeywords = fs.readFileSync(resolve(__dirname$1, "./keywords.txt"), "utf-8").split("\n").filter(Boolean);
  const db = JSONSyncPreset(resolve(__dirname$1, "db/keywords.json"), {});
  const data = db.data;
  originalKeywords.forEach((keyword) => {
    if (!data[keyword])
      data[keyword] = {};
  });
  db.write();
  return [db, data];
}

async function genContent(title, langOpt = DEFAULT_LANG) {
  const [_, lang] = langOpt;
  const fragments = [
    `\u8BF7\u4EE5\u300A${title}\u300B\u4E3A\u4E3B\u9898\u64B0\u5199\u4E00\u7BC7\u6587\u7AE0\uFF0C\u5E76\u9075\u5FAA\u5982\u4E0B\u8981\u6C42\uFF1A`,
    `\u8BED\u8A00\uFF1A${lang}`,
    `\u98CE\u683C\uFF1A\u6587\u7AE0\u5E94\u8BE5\u662F\u4FE1\u606F\u6027\u548C\u5438\u5F15\u4EBA\u7684\uFF0C\u9002\u5408\u666E\u901A\u8BFB\u8005\u7FA4\u4F53\u3002`,
    `\u7ED3\u6784\uFF1A\u6587\u7AE0\u7ED3\u6784\u8981\u7B26\u5408SEO\u641C\u7D22\u5F15\u64CE\u4F18\u5316\uFF0C\u5305\u62EC\u4F46\u4E0D\u9650\u4E8E\uFF1A\u4F7F\u7528\u5C0F\u6807\u9898\u6765\u7EC4\u7EC7\u5185\u5BB9\u3002`,
    `\u9650\u5236\uFF1A\u4E0D\u80FD\u51FA\u73B0\u7535\u8BDD\u3001\u90AE\u7BB1\u3001\u540D\u5B57\u7B49\u6D89\u53CA\u9690\u79C1\u7684\u4E2A\u4EBA\u4FE1\u606F\u3002`,
    `\u5B57\u6570\u9650\u5236\uFF1A${CONTENT_MIN_LENGTH}\u5B57\u3002`,
    `\u8BF7\u786E\u4FDD\u6587\u7AE0\u5185\u5BB9\u771F\u5B9E\u6027\u3001\u7814\u7A76\u5145\u5206\uFF0C\u5E76\u4E14\u6CA1\u6709\u6284\u88AD\u3002`
  ];
  return await completion(fragments);
}
async function genTitle(keyword, langOpt = DEFAULT_LANG) {
  const [_, lang] = langOpt;
  const fragments = [
    `\u8BF7\u6839\u636E\u4EE5\u4E0B\u8981\u6C42\u751F\u6210\u4E00\u4E2A\u6807\u9898\uFF1A`,
    `\u8BED\u8A00\uFF1A${lang}`,
    `\u7C7B\u578B\uFF1A\u6839\u636E\u201C${keyword}\u201D\u8FD9\u4E2A\u5173\u952E\u8BCD\u81EA\u884C\u5224\u5B9A\u3002`,
    `\u98CE\u683C\uFF1A\u6839\u636E\u201C${keyword}\u201D\u8FD9\u4E2A\u5173\u952E\u8BCD\u7684\u8BED\u5883\u786E\u5B9A\u3002`,
    `\u8FD9\u4E2A\u6807\u9898\u9700\u8981\u548C\u201C${keyword}\u201D\u7D27\u5BC6\u76F8\u5173\u3002`,
    `\u957F\u5EA6\u4E0D\u8D85\u8FC7${TITLE_LENGTH}\u4E2A\u5B57\u3002`,
    `\u8FD9\u4E2A\u6807\u9898\u4E0D\u80FD\u4F7F\u7528\u201C\u300A\u300B\u201D\u7B49\u7B26\u53F7\u8FDB\u884C\u5305\u88F9\u3002`,
    `\u8FD9\u4E2A\u6807\u9898\u9700\u8981\u6709\u5229\u4E8ESEO\u641C\u7D22\u5F15\u64CE\u4F18\u5316\u3002`,
    `\u53EA\u9700\u8981\u4E00\u4E2A\u6807\u9898`,
    `\u53EA\u80FD\u8F93\u51FA\u6807\u9898\uFF0C\u4E0D\u80FD\u8F93\u51FA\u5176\u4ED6\u5185\u5BB9\u3002`
  ];
  return await completion(fragments, "v4");
}
async function getKeyword(langOpt = DEFAULT_LANG) {
  const [langKey, langVal] = langOpt;
  const [db, dbData] = openKeywordsDB();
  const baseKeywords = Object.keys(dbData);
  const baseKeyword = getRandomItem(baseKeywords);
  if (!dbData[baseKeyword][langKey]) {
    dbData[baseKeyword][langKey] = [];
  }
  const relatedKeywords = dbData[baseKeyword][langKey];
  if (relatedKeywords.length >= MAX_RELATED_KEYWORDS) {
    return getRandomItem(relatedKeywords);
  }
  const fragments = [
    `\u8BF7\u6839\u636E\u4EE5\u4E0B\u8981\u6C42\u751F\u6210\u4E00\u4E2A\u957F\u5C3E\u5173\u952E\u8BCD\uFF1A`,
    `\u8BED\u8A00\uFF1A${langVal}`,
    `\u8FD9\u4E2A\u5173\u952E\u8BCD\u9700\u8981\u548C\u201C${baseKeyword}\u201D\u7D27\u5BC6\u76F8\u5173\u3002`,
    `\u8FD9\u4E2A\u5173\u952E\u8BCD\u4E0D\u80FD\u548C${JSON.stringify(relatedKeywords)}\u4E2D\u7684\u5173\u952E\u8BCD\u91CD\u590D\u3002`,
    `\u8FD9\u4E2A\u5173\u952E\u8BCD\u4E0D\u80FD\u4F7F\u7528\u201C\u300A\u300B\u201D\u7B49\u7B26\u53F7\u8FDB\u884C\u5305\u88F9\u3002`,
    `\u8FD9\u4E2A\u5173\u952E\u8BCD\u9700\u8981\u6709\u5229\u4E8ESEO\u641C\u7D22\u5F15\u64CE\u4F18\u5316\u3002`,
    `\u53EA\u9700\u8981\u4E00\u4E2A\u5173\u952E\u8BCD`,
    `\u53EA\u80FD\u8F93\u51FA\u5173\u952E\u8BCD\uFF0C\u4E0D\u80FD\u8F93\u51FA\u5176\u4ED6\u5185\u5BB9\u3002`
  ];
  const newTag = await completion(fragments, "v3");
  dbData[baseKeyword][langKey].push(newTag);
  db.write();
  return newTag;
}
async function completion(fragments, modelVersion = DEFAULT_MODEL_VERSION, messages = []) {
  const content = fragments.join("\n\n");
  const { choices } = await getCompletion([
    {
      role: "user",
      content
    },
    ...messages
  ], modelVersion);
  return choices[0].message.content;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(__filename, "..");
const argv = parseArgs(process.argv.slice(2));
const lang = getLang(argv.lang);
main();
async function main() {
  const keyword = await getKeyword(lang);
  const title = await genTitle(keyword, lang);
  const content = await genContent(title, lang);
  {
    const mdDir = path.resolve(__dirname, "./markdown");
    const filename = `${title.replace(/[\/:*?"<>|]/g, "-")}.md`;
    const filepath = path.resolve(mdDir, filename);
    await fs.ensureDir(mdDir);
    const _content = transformContent(content);
    await fs.writeFile(filepath, _content);
  }
  return;
}
