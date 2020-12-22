require('dotenv').config();
const Dashboard = require('../models/dashboard_model');
const moment = require('moment-timezone');
const util = require('../../util/util');
const bcrypt = require('bcrypt');
const inLineCss = require('nodemailer-juice');
const salt = parseInt(process.env.BCRYPT_SALT);

const getReportStatus = async (req, res) => {
    const result = await Dashboard.getReportStatus();
    res.status(200).send(result);
}

const getOverviewData = async (req, res) => {
    const dailySales = await Dashboard.getDailySales();
    const monthlySales = await Dashboard.getMonthlySales();
    const franchiseCount = await Dashboard.getFranchiseCount();
    const overviewData = {
        dailySales,
        monthlySales,
        franchiseCount
    }
    res.status(200).send(overviewData)
}

module.exports = {
    getReportStatus,
    getOverviewData
}
