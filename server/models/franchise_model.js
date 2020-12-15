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
        const result = await query(sqlQuery, [hashed_pwd, id])
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
module.exports = {
    verifySetting,
    setAccount,
    nativeLogin
};