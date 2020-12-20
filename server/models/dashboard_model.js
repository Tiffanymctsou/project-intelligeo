const { transaction, commit, rollback, query } = require('./mysqlcon');
const moment = require('moment');

const getReportStatus = async (today) => {
    try {
        await transaction();
        const sqlQuery = `SELECT o.id, o.franchise_id, f.fullname, o.open_location, DATE_FORMAT(report_date, '%Y-%m-%d') AS report_date, TIME_FORMAT(open_time, '%H:%i') AS open_time, TIME_FORMAT(close_time, '%H:%i') AS close_time, o.open_status, o.report_status, TIME_FORMAT(report_time, '%H:%i') AS report_time FROM open_log AS o, franchise AS f 
        WHERE o.franchise_id = f.franchise_id AND o.report_date = ?
        ORDER BY open_time;`;
        const statusToday = await query(sqlQuery, [today])
        console.log(statusToday)
        await commit();
        return statusToday
    } catch (error) {
        await rollback();
        return { error };
    }
}

const getDailySales = async () => {
    try {
        await transaction();
        const today = moment().format('YYYY-MM-DD')
        const sqlQuery = `SELECT DATE_FORMAT(report_date, '%Y-%m-%d') AS date, SUM(s.amount) AS total_sales FROM open_log AS o, sales AS s WHERE o.id = s.log_id AND o.report_date = ?`
        const result = await query(sqlQuery, [today])
        const salesToday = result[0]
        console.log(salesToday)
        await commit();
        return salesToday
    } catch (error) {
        await rollback();
        return { error };
    }
}

module.exports = {
    getReportStatus,
    getDailySales
};