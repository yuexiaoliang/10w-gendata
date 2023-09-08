// 导入模块
const mysql = require('mysql2/promise');

function createConnection() {
  return mysql.createConnection({
    host: process.env.GENDATA_DB_HOST,
    user: process.env.GENDATA_DB_USER,
    database: process.env.GENDATA_DB_NAME,
    password: process.env.GENDATA_DB_PASSWORD
  });
}

// 添加数据
async function insert(connection, tableName, data) {
  return (await connection.query('INSERT INTO ?? SET ?', [tableName, data]))[0];
}

// 检查并更新 meta 表
async function checkAndUpdateMeta(connection, name) {
  const tableName = '10w_metas';

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

module.exports = { createConnection, insert, checkAndUpdateMeta };
