const { transaction, commit, rollback, query } = require('./mysqlcon');
const salt = parseInt(process.env.BCRYPT_SALT);
const secret = process.env.JWT_SECRET;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const registerEnterprise = async (company, fullname, email) => {
	try {
		await transaction();
		const enterprise = {
			company,
			fullname,
			email
		};
		const sqlQuery = 'INSERT INTO enterprise SET ?;';
		const result = await query(sqlQuery, enterprise);
		enterprise.id = result.insertId;
		await commit();
		return enterprise;
	} catch (error) {
		await rollback();
		return { error };
	}
};
const verifySetting = async (id, uid) => {
	try {
		await transaction();

		const enterprise = await query('SELECT email, password FROM enterprise WHERE id = ?', [id]);
		const enterpriseEmail = enterprise[0].email;
		const enterprisePassword = enterprise[0].password;

		if (enterprise.length == null) {
			return { error: 'Account Does Not Exist!' };
		} else if (!bcrypt.compareSync(enterpriseEmail, uid)) {
			return { error: 'Incorrect uid!' };
		} else if (enterprisePassword != null) {
			return { error: 'You have already completed Account Setting!' };
		} else if (enterprisePassword == null) {
			return { msg: 'Account Setting Verified!' };
		}
	} catch (error) {
		await rollback();
		return { error };
	}
};

const setAccount = async (id, password) => {
	try {
		await transaction();
		const hashedPassword = bcrypt.hashSync(password, salt);
		const sqlQuery = 'UPDATE enterprise SET password = ? WHERE id = ?;';
		await query(sqlQuery, [hashedPassword, id]);
		await commit();
		return { msg: 'Account Setting Completed' };
	} catch (error) {
		await rollback();
		return { error };
	}
};

const nativeLogin = async (email, password, expire) => {
	try {
		await transaction();
		const enterprise = await query('SELECT password FROM enterprise WHERE email = ?', [email]);
		if (enterprise.length == 0) {
			return { error: '用戶不存在！' };
		}
		const enterprisePassword = enterprise[0].password;
		if (!bcrypt.compareSync(password, enterprisePassword)) {
			await commit();
			return { error: '密碼錯誤！' };
		}
		const loginAt = moment.tz('Asia/Taipei').format('YYYY-MM-DD H:mm:ss');
		const queryStr = 'UPDATE enterprise SET login_at = ? WHERE email = ?';
		await query(queryStr, [loginAt, email]);
		await commit();
		const accessToken = 'Bearer ' + jwt.sign({ email: email, password: password }, secret, { expiresIn: expire });
		return { email, accessToken, loginAt };
	} catch (error) {
		await rollback();
		return { error };
	}
};

module.exports = {
	registerEnterprise,
	verifySetting,
	setAccount,
	nativeLogin
};
