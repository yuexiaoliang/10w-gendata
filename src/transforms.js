export function transformContent(content) {
  // 删除标题一
  // content = content.replace(/^#\s.+/, '');

  // 删除开始的空行
  // content = content.replace(/^\n+/, '');

  // 在第二个段落后添加 <!--more-->
  const paragraphs = content.split('\n\n');
  paragraphs.splice(2, 0, '<!--more-->');
  content = paragraphs.join('\n\n');

  return `<!--markdown-->\n${content}`;
}
