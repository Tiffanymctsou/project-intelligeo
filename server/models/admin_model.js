const { transaction, commit, rollback, query } = require('./mysqlcon');

const getVillagePop = async (villageCodes) => {
    try {
        await transaction();

        const villageInfo = []
        for (let i = 0; i < villageCodes.length; i++) {
            const getHousehold = `SELECT * FROM household_ppl WHERE village_code = '${villageCodes[i]}';`
            const info = await query(getHousehold);
            info.map(village => { villageInfo.push(village) })
        }

        return villageInfo

    } catch (error) {
        await rollback();
        return { error };
    }
}

const getSelectedLocation = async (city, town) => {
    try {
        await transaction();

        const townInfo = await query(`SELECT town_code, coordinate FROM city_town WHERE city = '${city}' AND town = '${town}'`);


        return { townInfo };
    } catch (error) {
        await rollback();
        return { error };
    }

}

const addFranchise = async (franchise_id, fullname, city, email, phone, address, location, area, join_date) => {
    try {
        await transaction();

        // const emails = await query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
        // if (emails.length > 0) {
        //     await commit();
        //     return { error: 'Email Already Exists' };
        // }

        const franchise = {
            franchise_id,
            fullname,
            city,
            email,
            phone,
            address,
            location,
            area,
            join_date
        }

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

        // const emails = await query('SELECT email FROM user WHERE email = ? FOR UPDATE', [email]);
        // if (emails.length > 0) {
        //     await commit();
        //     return { error: 'Email Already Exists' };
        // }

        const user = {
            account: franchise_id,
            email: email
        }

        const sqlQuery = 'INSERT INTO user SET ?';
        await query(sqlQuery, user);

        await commit();
        return { msg: 'User added!' };
    } catch (error) {
        await rollback();
        return { error };
    }
}

const getFranchise = async () => {
    try {
        await transaction();

        const sqlQuery = 'SELECT franchise_id, fullname, city, email, phone, address, join_date FROM franchise;'
        const franchises = await query(sqlQuery);
        return { franchises }
    } catch (error) {
        await rollback();
        return { error };
    }
}

const getMarker = async (poi, south, west, north, east) => {
    try {
        await transaction();
        const sqlQuery = `SELECT icon_path, lat, lng FROM ${poi} WHERE lat BETWEEN ${south} AND ${north} AND lng BETWEEN ${west} AND ${east}`
        const marker = await query(sqlQuery);
        return { marker };
    } catch (error) {
        await rollback();
        return { error };
    }
}

const getFranchiseArea = async () => {
    try {
        await transaction();
        const sqlQuery = `SELECT fullname, area FROM franchise`
        const franchises = await query(sqlQuery)
        return franchises
    } catch (error) {
        await rollback();
        return { error };
    }
}

module.exports = {
    getSelectedLocation,
    addFranchise,
    getVillagePop,
    getFranchise,
    getMarker,
    getFranchiseArea,
    createAccount
};