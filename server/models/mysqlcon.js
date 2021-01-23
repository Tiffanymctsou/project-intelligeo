const mysql = require("mysql");
const env = process.env.NODE_ENV;
const { promisify } = require("util");
const { LOCAL_DB_HOST, LOCAL_DB_USER, LOCAL_DB_PWD, LOCAL_DB } = process.env;
const { AWS_DB_HOST, AWS_DB_USER, AWS_DB_PWD, AWS_DB } = process.env;
// const { TEST_DB_HOST, TEST_DB_USER, TEST_DB_PWD, TEST_DB } = process.env;

const mysqlConfig = {
    production: { // for EC2 machine
        host: AWS_DB_HOST,
        user: AWS_DB_USER,
        password: AWS_DB_PWD,
        database: AWS_DB
    },
    development: { // for localhost development
        host: LOCAL_DB_HOST,
        user: LOCAL_DB_USER,
        password: LOCAL_DB_PWD,
        database: LOCAL_DB
    }
//     test: { // for automation testing (command: npm run test)
//         host: DB_HOST,
//         user: DB_USER,
//         password: DB_PWD,
//         database: TEST_DB
//     }
};

const mysqlCon = mysql.createConnection(mysqlConfig[env]);

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
