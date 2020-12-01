const { transaction, commit, rollback, query } = require('./mysqlcon');

const createFranchise = async (name, auth, email, area) => {
    try {
        await transaction();

        // const emails = await query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
        // if (emails.length > 0) {
        //     await commit();
        //     return { error: 'Email Already Exists' };
        // }

        const user = {
            name: name,
            auth: auth,
            email: email,
            area: area
        }

        const sqlQuery = 'INSERT INTO user SET ?';
        const result = await query(sqlQuery, user);
        user.id = result.insertId;

        await commit();
        return { user };
    } catch (error) {
        await rollback();
        return { error };
    }
};

module.exports = {
    createFranchise
};