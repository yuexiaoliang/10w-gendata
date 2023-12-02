// 导入模块
import mysql from 'mysql2/promise';
import parseArgs from 'minimist'

const argv = parseArgs(process.argv.slice(2))
const project = argv.project

const dbDatabases = {
  xiezi: process.env.GENDATA_DB_NAME
}

const dbUsers = {
  xiezi: process.env.GENDATA_DB_USER
}

const dbPasswords = {
  xiezi: process.env.GENDATA_DB_PASSWORD
}

export function createConnection() {
  return mysql.createConnection({
    host: process.env.GENDATA_DB_HOST,
    user: dbUsers[project] || dbUsers['xiezi'],
    database: dbDatabases[project] || dbDatabases['xiezi'],
    password: dbPasswords[project] || dbPasswords['xiezi'],
  });
}

// 添加数据
export async function insert(connection, tableName, data) {
  return (await connection.query('INSERT INTO ?? SET ?', [tableName, data]))[0];
}

// 检查并更新 meta 表
export async function checkAndUpdateMeta(connection, name) {
  const tableName = 'typecho_metas';

  const results = (await connection.query('SELECT * FROM ?? WHERE name = ?', [tableName, name]))[0];

  // 存在重复的 name 行
  if (results.length > 0) {
    const row = results[0];
    const name = row.name;
    const count = row.count;

    // 更新 count
    await connection.query('UPDATE ?? SET count = ? WHERE name = ?', [tableName, count + 1, name]);
    return row;
  }

  // 不存在重复的数据，新增一条记录
  const row = (await connection.query('INSERT INTO ?? SET ?', [tableName, { name: name, slug: name, type: 'tag', count: 1 }]))[0];
  return { ...row, mid: row.insertId };
}
