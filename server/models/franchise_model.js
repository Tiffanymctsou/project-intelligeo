const { transaction, commit, rollback, query } = require('./mysqlcon');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const salt = parseInt(process.env.BCRYPT_SALT);
const secret = process.env.JWT_SECRET;
const moment = require('moment');

const verifySetting = async (id, uid) => {
    try {
        await transaction();

        const user = await query('SELECT email, password FROM user WHERE account = ?', [id]);
        const user_email = user[0].email
        const user_password = user[0].password

        if (user.length == null) {
            return { error: 'Account Does Not Exist!' };
        } else if (!bcrypt.compareSync(user_email, uid)) {
            return { error: 'Incorrect uid!' };
        } else if (user_password != null) {
            return { error: 'You have already completed Account Setting!' }
        } else if (user_password == null) {
            return { msg: 'Account Setting Verified!' }
        }

    } catch (error) {
        await rollback();
        return { error };
    }
}

const setAccount = async (id, password) => {
    try {
        await transaction();
        const hashed_pwd = bcrypt.hashSync(password, salt)
        const sqlQuery = 'UPDATE user SET password = ? WHERE account = ?;'
        await query(sqlQuery, [hashed_pwd, id])
        await commit();
        return { msg: 'Account Setting Completed' }
    } catch (error) {
        await rollback();
        return { error };
    }
}

const nativeLogin = async (account, password, expire) => {
    try {
        await transaction();
        const user = await query('SELECT password FROM user WHERE account = ?', [account])
        const user_password = user[0].password;
        if (!bcrypt.compareSync(password, user_password)) {
            await commit();
            return { error: 'Incorrect Password!' };
        }
        const loginAt = moment().format('YYYY-MM-DD H:mm:ss');
        const queryStr = 'UPDATE user SET login_at = ? WHERE account = ?';
        await query(queryStr, [loginAt, account]);
        await commit();
        const accessToken = 'Bearer ' + jwt.sign({ account: account, password: password }, secret, { expiresIn: expire })
        return { account, accessToken, loginAt };
    } catch (error) {
        await rollback();
        return { error };
    }
}
const getLocationRecord = async (franchise_id) => {
    try {
        await transaction();
        const sqlQuery = 'SELECT location FROM franchise WHERE franchise_id = ?'
        const result = await query(sqlQuery, [franchise_id])
        const locationRecord = result[0];
        await commit();
        return locationRecord
    } catch (error) {
        await rollback();
        return { error };
    }
}
const getUnreported = async (franchise_id, today) => {
    try {
        await transaction();
        const sqlQuery = `SELECT id, open_location, DATE_FORMAT(report_date, '%Y-%m-%d') AS report_date, TIME_FORMAT(open_time, '%H:%i') AS open_time FROM open_log
        WHERE franchise_id = ? AND open_location <> ? AND report_date < ? AND open_status = ? AND report_status = ?`
        const unreportedLog = await query(sqlQuery, [franchise_id, '-', today, 2, 0])
        await commit();
        return unreportedLog
    } catch (error) {
        await rollback();
        return { error };
    }

}

const getOpen = async (franchise_id, today) => {
    try {
        await transaction();
        const sqlQuery = `SELECT id, open_location, DATE_FORMAT(report_date, '%Y-%m-%d') AS report_date, TIME_FORMAT(open_time, '%H:%i') AS open_time, open_status, report_status FROM open_log 
        WHERE franchise_id = ? AND report_date = ?;`
        const openLog = await query(sqlQuery, [franchise_id, today])
        await commit();
        return openLog
    } catch (error) {
        await rollback();
        return { error };
    }

}

const updateOpenStatus = async (franchise_id, location, status) => {
    try {
        await transaction();
        const date = moment().format('YYYY-MM-DD')
        const time = moment().format('H:mm:ss');
        const openLog = {
            franchise_id: franchise_id,
            open_location: location,
            report_date: date,
            open_time: time,
            close_time: null,
            open_status: status,
            report_status: 0,
            report_time: null
        }
        const sqlQuery = 'INSERT INTO open_log SET ?';
        const result = await query(sqlQuery, openLog)
        openLog.log_id = result.insertId;
        const franchise = await query('SELECT fullname FROM franchise WHERE franchise_id = ?', [openLog.franchise_id])
        openLog.fullname = franchise[0].fullname
        await commit();
        return { data: openLog, msg: `Open Status is now set to ${status}!` }
    } catch (error) {
        await rollback();
        return { error };
    }
}

const reportClose = async (status, log_id) => {
    try {
        await transaction();
        const time = moment().format('H:mm:ss');
        const sqlQuery = 'UPDATE open_log SET close_time = ?, open_status = ? WHERE id = ?';
        await query(sqlQuery, [time, status, log_id])
        await commit();
        return {
            data: { log_id, status, time }, msg: 'Open Status Successfully Updated!'
        }
    } catch (error) {
        await rollback();
        return { error };
    }
}

const reportSales = async (log_id, amount) => {
    try {
        await transaction();
        const salesInfo = {
            log_id: log_id,
            amount: amount
        }
        const time = moment().format('H:mm:ss');
        const updateSql = 'UPDATE open_log SET report_status = ?, report_time = ? WHERE id = ?';
        await query(updateSql, [1, time, log_id])
        const insertSql = 'INSERT INTO sales SET ?'
        await query(insertSql, salesInfo)
        await commit();
        salesInfo.time = time;
        return { data: salesInfo, msg: 'Open Status Successfully Updated!' }
    } catch (error) {
        await rollback();
        return { error };
    }
}


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