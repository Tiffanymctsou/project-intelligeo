require('dotenv').config();
const Dashboard = require('../models/dashboard_model');
const moment = require('moment');
const util = require('../../util/util');
const bcrypt = require('bcrypt');
const inLineCss = require('nodemailer-juice');
const salt = parseInt(process.env.BCRYPT_SALT);

const getReportStatus = async (req, res) => {
    const today = moment().format('YYYY-MM-DD');
    const result = await Dashboard.getReportStatus(today);
    res.status(200).send(result);
}

const getOverviewData = async (req, res) => {
    const dailySales = await Dashboard.getDailySales();
    const overviewData = {
        dailySales
    }
    res.status(200).send(overviewData)
}

module.exports = {
    getReportStatus,
    getOverviewData
}
