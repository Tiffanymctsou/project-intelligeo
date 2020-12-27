const { transaction, commit, rollback, query } = require('./mysqlcon');
const moment = require('moment-timezone');

// frequently used
const today = moment.tz('Asia/Taipei').format('YYYY-MM-DD');
const startOfMonth = moment.tz('Asia/Taipei').startOf('month').format('YYYY-MM-DD');
const endOfMonth = moment.tz('Asia/Taipei').endOf('month').format('YYYY-MM-DD');

const getReportStatus = async () => {
	try {
		await transaction();
		const sqlQuery = `SELECT o.id, o.franchise_id, f.fullname, o.open_location, DATE_FORMAT(report_date, '%Y-%m-%d') AS report_date, TIME_FORMAT(open_time, '%H:%i') AS open_time, TIME_FORMAT(close_time, '%H:%i') AS close_time, o.open_status, o.report_status, TIME_FORMAT(report_time, '%H:%i') AS report_time FROM open_log AS o, franchise AS f 
        WHERE o.franchise_id = f.franchise_id AND o.report_date = ?
        ORDER BY open_time;`;
		const statusToday = await query(sqlQuery, [today]);
		await commit();
		return statusToday;
	} catch (error) {
		await rollback();
		return { error };
	}
};

const getDailySales = async () => {
	try {
		await transaction();
		const sqlQuery = `SELECT DATE_FORMAT(report_date, '%Y-%m-%d') AS date, SUM(s.amount) AS total_sales FROM open_log AS o, sales AS s WHERE o.id = s.log_id AND o.report_date = ?`;
		const result = await query(sqlQuery, [today]);
		const salesToday = result[0];
		await commit();
		return salesToday;
	} catch (error) {
		await rollback();
		return { error };
	}
};

const getMonthlySales = async () => {
	try {
		await transaction();
		const sqlQuery = `SELECT SUM(s.amount) AS total_sales FROM open_log AS o, sales AS s WHERE o.id = s.log_id AND report_date BETWEEN ? AND ?`;
		const result = await query(sqlQuery, [startOfMonth, endOfMonth]);
		const salesMonth = result[0];
		await commit();
		return salesMonth;
	} catch (error) {
		await rollback();
		return { error };
	}
};

const getFranchiseCount = async () => {
	try {
		await transaction();
		const sqlQuery_month = `SELECT COUNT(franchise_id) AS franchise_id FROM franchise WHERE join_date BETWEEN ? AND ?`;
		const sqlQuery_all = 'SELECT COUNT(franchise_id) AS franchise_id FROM franchise';
		const result_month = await query(sqlQuery_month, [startOfMonth, endOfMonth]);
		const result_all = await query(sqlQuery_all);
		const franchiseCount = {
			monthly: result_month[0].franchise_id,
			total: result_all[0].franchise_id,
		};
		await commit();
		return franchiseCount;
	} catch (error) {
		await rollback();
		return { error };
	}
};

const getChart = async () => {
	try {
		const dates = [];
		const amount = [];
		const currentMonth = moment.tz('Asia/Taipei').month() + 1;
		const dateToday = moment.tz('Asia/Taipei').date();
		for (let d = 1; d <= dateToday; d++) {
			if (d < 10) {
				const day = `${currentMonth}-0${d}`;
				dates.push(day);
			} else {
				const day = `${currentMonth}-${d}`;
				dates.push(day);
			}
		}
		const sqlQuery = `SELECT DATE_FORMAT(o.report_date, '%m-%d') AS report_date, SUM(amount) AS total FROM open_log AS o, sales AS s WHERE o.id = s.log_id AND o.report_date BETWEEN ? AND ? GROUP BY report_date;`;
		const result = await query(sqlQuery, [startOfMonth, today]);
		const amountData = {};
		result.forEach((data) => {
			amountData[data.report_date] = data.total;
		});
		dates.forEach((date) => {
			if (date in amountData) {
				amount.push(amountData[date]);
			} else {
				amount.push(0);
			}
		});
		return { dates: dates, amount: amount };
	} catch (error) {
		await rollback();
		return { error };
	}
};

module.exports = {
	getReportStatus,
	getDailySales,
	getMonthlySales,
	getFranchiseCount,
	getChart,
};
