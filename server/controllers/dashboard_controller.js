require('dotenv').config();
const Dashboard = require('../models/dashboard_model');

const getReportStatus = async (req, res) => {
	const result = await Dashboard.getReportStatus();
	res.status(200).send(result);
};

const getOverviewData = async (req, res) => {
	const dailySales = await Dashboard.getDailySales();
	const monthlySales = await Dashboard.getMonthlySales();
	const franchiseCount = await Dashboard.getFranchiseCount();
	const overviewData = {
		dailySales,
		monthlySales,
		franchiseCount,
	};
	res.status(200).send(overviewData);
};

const getChart = async (req, res) => {
	const result = await Dashboard.getChart();
	res.status(200).send(result);
};

module.exports = {
	getReportStatus,
	getOverviewData,
	getChart,
};
