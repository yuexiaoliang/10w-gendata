import { LANG_ENUM, DEFAULT_LANG } from './constants'

// 数组去重
export function unique(arr) {
  return Array.from(new Set(arr));
}

// 从数组中随机取出一个元素
export function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getLang(name) {
  return [name, LANG_ENUM[name]] || DEFAULT_LANG;
}