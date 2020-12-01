const mysql = require('mysql');
const { promisify } = require('util');
const { DB_HOST, DB_USER, DB_PWD, DB } = process.env;

const mysqlCon = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PWD,
    database: DB
});

const promiseQuery = promisify(mysqlCon.query).bind(mysqlCon);
const promiseTransaction = promisify(mysqlCon.beginTransaction).bind(mysqlCon);
const promiseCommit = promisify(mysqlCon.commit).bind(mysqlCon);
const promiseRollback = promisify(mysqlCon.rollback).bind(mysqlCon);
const promiseEnd = promisify(mysqlCon.end).bind(mysqlCon);

module.exports = {
    core: mysqlCon,
    query: promiseQuery,
    transaction: promiseTransaction,
    commit: promiseCommit,
    rollback: promiseRollback,
    end: promiseEnd,
};