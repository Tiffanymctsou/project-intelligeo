const { transaction, commit, rollback, query } = require('./mysqlcon');
const moment = require('moment-timezone');

const getVillagePop = async (villageCodes) => {
	const villageInfo = [];
	for (let i = 0; i < villageCodes.length; i++) {
		const getHousehold = `SELECT * FROM household_ppl WHERE village_code = ?;`;
		const info = await query(getHousehold, [villageCodes[i]]);
		info.map((village) => {
			villageInfo.push(village);
		});
	}
	return villageInfo;
};

const getSelectedLocation = async (city, town) => {
	const townInfo = await query('SELECT town_code, coordinate FROM city_town WHERE city = ? AND town = ?', [
		city,
		town
	]);
	return { townInfo };
};

const addFranchise = async (franchise_id, fullname, city, email, phone, address, openLocation, area) => {
	try {
		await transaction();
		const emails = await query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
		if (emails.length > 0) {
			await commit();
			return { error: 'Email Already Exists' };
		}
		const today = moment.tz('Asia/Taipei').format('YYYY-MM-DD');

		const franchise = {
			franchise_id: franchise_id,
			fullname: fullname,
			city: city,
			email: email,
			phone: phone,
			address: address,
			location: openLocation,
			area: area,
			join_date: today
		};

		const sqlQuery = 'INSERT INTO franchise SET ?';
		await query(sqlQuery, franchise);

		await commit();
		return { msg: 'Franchise added!' };
	} catch (error) {
		await rollback();
		return { error };
	}
};

const createAccount = async (franchise_id, email) => {
	try {
		await transaction();

		const user = {
			account: franchise_id,
			email: email
		};

		const sqlQuery = 'INSERT INTO user SET ?';
		await query(sqlQuery, user);
		await commit();
		return { msg: 'User added!' };
	} catch (error) {
		await rollback();
		return { error };
	}
};

const getFranchise = async () => {
	const sqlQuery = 'SELECT franchise_id, fullname, city, email, phone, address, join_date FROM franchise;';
	const franchises = await query(sqlQuery);
	return { franchises };
};

const getMarker = async (poi, south, west, north, east) => {
	const sqlQuery = `SELECT icon_path, lat, lng FROM ${poi} WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?`;
	const marker = await query(sqlQuery, [south, north, west, east]);
	return { marker };
};

const getFranchiseArea = async () => {
	const sqlQuery = 'SELECT fullname, area FROM franchise';
	const franchises = await query(sqlQuery);
	return franchises;
};

const getReportStatus = async () => {
	const today = moment.tz('Asia/Taipei').format('YYYY-MM-DD');
	const sqlQuery = `SELECT o.id, o.franchise_id, f.fullname, o.open_location, DATE_FORMAT(report_date, '%Y-%m-%d') AS report_date, TIME_FORMAT(open_time, '%H:%i') AS open_time, TIME_FORMAT(close_time, '%H:%i') AS close_time, o.open_status, o.report_status, TIME_FORMAT(report_time, '%H:%i') AS report_time FROM open_log AS o, franchise AS f 
        WHERE o.franchise_id = f.franchise_id AND o.report_date = ?
        ORDER BY open_time;`;
	const statusToday = await query(sqlQuery, [today]);
	return statusToday;
};

module.exports = {
	getSelectedLocation,
	addFranchise,
	getVillagePop,
	getFranchise,
	getMarker,
	getFranchiseArea,
	createAccount,
	getReportStatus
};
