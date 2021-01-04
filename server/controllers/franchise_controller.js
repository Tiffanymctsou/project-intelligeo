require('dotenv').config();
const secret = process.env.JWT_SECRET;
const expire = process.env.TOKEN_EXPIRE;
const jwt = require('jsonwebtoken');
const Franchise = require('../models/franchise_model');

const verifySetting = async (req, res) => {
	const { id, uid } = req.query;
	const result = await Franchise.verifySetting(id, uid);
	console.log(result);
	if (result.error) {
		res.status(403).send({ error: result.error });
		return;
	}
	res.status(200).send({ msg: result.msg });
};

const setAccount = async (req, res) => {
	const { id } = req.query;
	const { password } = req.body;
	const result = await Franchise.setAccount(id, password);

	res.status(200).send({ msg: result.msg });
};

const nativeLogin = async (req, res) => {
	const { account, password } = req.body;
	const result = await Franchise.nativeLogin(account, password, expire);
	if (result.error) {
		res.status(403).send(result.error);
		return;
	}
	res.status(200).send({ data: result });
};

const verifyToken = async (req, res, next) => {
	const token = req.header('Authorization').replace('Bearer ', '');
	jwt.verify(token, secret, (err, decodedData) => {
		if (err) {
			res.status(403).send({ msg: err.message });
		}
		req.franchiseId = decodedData.account;
		next();
	});
};

const getLocationRecord = async (req, res) => {
	const locationRecord = await Franchise.getLocationRecord(req.franchiseId);
	res.status(200).send({ data: locationRecord });
};

const getOpenStatus = async (req, res) => {
	const franchiseId = req.franchiseId;
	const unreportedLog = await Franchise.getUnreported(franchiseId);
	const openLog = await Franchise.getOpen(franchiseId);
	const openStatus = {
		franchise_id: franchiseId,
		unreported_log: unreportedLog,
		open_log: openLog
	};
	res.status(200).send({ data: openStatus });
};

const updateOpenStatus = async (req, res) => {
	const franchiseId = req.franchiseId;
	const { status } = req.body;
	let location;
	let reportResult;
	switch (status) {
		case 0: {
			location = '-';
			const result = await Franchise.updateOpenStatus(franchiseId, location, status);
			reportResult = result;
			break;
		}
		case 1: {
			location = req.body.location;
			const result = await Franchise.updateOpenStatus(franchiseId, location, status);
			reportResult = result;
			break;
		}
		case 2: {
			const log_id = req.body.id;
			const result = await Franchise.reportClose(status, log_id);
			reportResult = result;
			break;
		}
	}
	res.status(200).send(reportResult);
};

const reportSales = async (req, res) => {
	const { log_id, amount } = req.body;
	const result = await Franchise.reportSales(log_id, amount);
	console.log(typeof result.data.amount);
	res.status(200).send(result);
};
module.exports = {
	verifySetting,
	setAccount,
	nativeLogin,
	verifyToken,
	getLocationRecord,
	getOpenStatus,
	updateOpenStatus,
	reportSales
};
