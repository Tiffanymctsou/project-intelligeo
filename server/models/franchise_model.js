const { transaction, commit, rollback, query } = require('./mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);
const secret = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const verifySetting = async (id, uid) => {
	const user = await query('SELECT email, password FROM user WHERE account = ?', [id]);
	const userEmail = user[0].email;
	const userPassword = user[0].password;

	if (user.length == null) {
		return { error: 'Account Does Not Exist!' };
	} else if (!bcrypt.compareSync(userEmail, uid)) {
		return { error: 'Incorrect uid!' };
	} else if (userPassword != null) {
		return { error: 'You have already completed Account Setting!' };
	} else if (userPassword == null) {
		return { msg: 'Account Setting Verified!' };
	}
};

const setAccount = async (id, password) => {
	try {
		await transaction();
		const hashedPassword = bcrypt.hashSync(password, salt);
		const sqlQuery = 'UPDATE user SET password = ? WHERE account = ?;';
		await query(sqlQuery, [hashedPassword, id]);
		await commit();
		return { msg: 'Account Setting Completed' };
	} catch (error) {
		await rollback();
		return { error };
	}
};

const nativeLogin = async (account, password, expire) => {
	try {
		await transaction();
		const user = await query('SELECT password FROM user WHERE account = ?', [account]);
		const userPassword = user[0].password;
		if (user.length == 0) {
			return { error: '用戶不存在！' };
		} else if (!bcrypt.compareSync(password, userPassword)) {
			await commit();
			return { error: '密碼錯誤！' };
		}
		const loginAt = moment.tz('Asia/Taipei').format('YYYY-MM-DD H:mm:ss');
		const queryStr = 'UPDATE user SET login_at = ? WHERE account = ?';
		await query(queryStr, [loginAt, account]);
		await commit();
		const accessToken =
			'Bearer ' + jwt.sign({ account: account, password: password }, secret, { expiresIn: expire });
		return { account, accessToken, loginAt };
	} catch (error) {
		await rollback();
		return { error };
	}
};

const getLocationRecord = async (franchise_id) => {
	const sqlQuery = 'SELECT location FROM franchise WHERE franchise_id = ?';
	const result = await query(sqlQuery, [franchise_id]);
	const locationRecord = result[0];

	return locationRecord;
};

const getUnreported = async (franchise_id) => {
	const today = moment.tz('Asia/Taipei').format('YYYY-MM-DD');
	const sqlQuery = `SELECT id, open_location, DATE_FORMAT(report_date, '%Y-%m-%d') AS report_date, TIME_FORMAT(open_time, '%H:%i') AS open_time FROM open_log
        WHERE franchise_id = ? AND open_location <> ? AND report_date < ? AND open_status = ? AND report_status = ? ORDER BY report_date`;
	const unreportedLog = await query(sqlQuery, [franchise_id, '-', today, 2, 0]);

	return unreportedLog;
};

const getOpen = async (franchise_id) => {
	const today = moment.tz('Asia/Taipei').format('YYYY-MM-DD');
	const sqlQuery = `SELECT id, open_location, DATE_FORMAT(report_date, '%Y-%m-%d') AS report_date, TIME_FORMAT(open_time, '%H:%i') AS open_time, open_status, report_status FROM open_log 
        WHERE franchise_id = ? AND report_date = ?;`;
	const openLog = await query(sqlQuery, [franchise_id, today]);

	return openLog;
};

const updateOpenStatus = async (franchise_id, location, status) => {
	try {
		await transaction();
		const today = moment.tz('Asia/Taipei').format('YYYY-MM-DD');
		const time = moment.tz('Asia/Taipei').format('H:mm:ss');
		const openLog = {
			franchise_id: franchise_id,
			open_location: location,
			report_date: today,
			open_time: time,
			close_time: null,
			open_status: status,
			report_status: 0,
			report_time: null
		};
		const sqlQuery = 'INSERT INTO open_log SET ?';
		const result = await query(sqlQuery, openLog);
		openLog.log_id = result.insertId;
		const franchise = await query('SELECT fullname FROM franchise WHERE franchise_id = ?', [openLog.franchise_id]);
		openLog.fullname = franchise[0].fullname;
		await commit();
		return { data: openLog, msg: `Open Status is now set to ${status}!` };
	} catch (error) {
		await rollback();
		return { error };
	}
};

const reportClose = async (status, log_id) => {
	try {
		await transaction();
		const time = moment.tz('Asia/Taipei').format('H:mm:ss');
		const sqlQuery = 'UPDATE open_log SET close_time = ?, open_status = ? WHERE id = ?';
		await query(sqlQuery, [time, status, log_id]);
		await commit();
		return {
			data: { log_id, status, time },
			msg: 'Open Status Successfully Updated!'
		};
	} catch (error) {
		await rollback();
		return { error };
	}
};

const reportSales = async (log_id, amount) => {
	try {
		await transaction();
		const salesInfo = {
			log_id: log_id,
			amount: amount
		};
		const time = moment.tz('Asia/Taipei').format('H:mm:ss');
		const updateSql = 'UPDATE open_log SET report_status = ?, report_time = ? WHERE id = ?';
		await query(updateSql, [1, time, log_id]);
		const insertSql = 'INSERT INTO sales SET ?';
		await query(insertSql, salesInfo);
		const selectSql = `SELECT DATE_FORMAT(report_date, '%Y-%m-%d') AS report_date FROM open_log WHERE id = ?`;
		const result = await query(selectSql, log_id);
		await commit();
		salesInfo.time = time;
		salesInfo.report_date = result[0].report_date;
		return { data: salesInfo, msg: 'Open Status Successfully Updated!' };
	} catch (error) {
		await rollback();
		return { error };
	}
};

module.exports = {
	verifySetting,
	setAccount,
	nativeLogin,
	getUnreported,
	getOpen,
	getLocationRecord,
	updateOpenStatus,
	reportClose,
	reportSales
};
