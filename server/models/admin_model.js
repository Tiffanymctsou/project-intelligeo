const { villages } = require('../../test/village_data');
const { transaction, commit, rollback, query } = require('./mysqlcon');

// to be altered!!!!!
const getVillageInfo = async (city, town) => {
    try {
        await transaction();
        const townCode = await query(`SELECT town_code FROM city_town WHERE city = '${city}' AND town = '${town}'`)
        const villages = await query(`SELECT village, village_code, coordinates FROM town_village WHERE town_code = ${townCode[0].town_code}`)

        return {
            villages
        };
    } catch (error) {
        await rollback();
        return { error };
    }
}

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
        return { msg: 'Franchise inserted!' };
    } catch (error) {
        await rollback();
        return { error };
    }
};

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

const getMarker = async (keyword) => {
    try {
        await transaction();
        const sqlQuery = `SELECT path FROM assets WHERE keyword = '${keyword}'`
        const marker = await query(sqlQuery);
        return { marker };
    } catch (error) {
        await rollback();
        return { error };
    }
}

module.exports = {
    getSelectedLocation,
    addFranchise,
    getVillageInfo,
    getVillagePop,
    getFranchise,
    getMarker
};