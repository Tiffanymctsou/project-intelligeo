const mysql = require('mysql');
const { DB_HOST, DB_USER, DB_PWD, DB } = process.env;

const pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB
});

const promiseQuery = promisify(pool.query).bind(pool);
const promiseTransaction = promisify(pool.beginTransaction).bind(pool);
const promiseCommit = promisify(pool.commit).bind(pool);
const promiseRollback = promisify(pool.rollback).bind(pool);
const promiseEnd = promisify(pool.end).bind(pool);

module.exports = {
    core: pool,
    query: promiseQuery,
    transaction: promiseTransaction,
    commit: promiseCommit,
    rollback: promiseRollback,
    end: promiseEnd,
};