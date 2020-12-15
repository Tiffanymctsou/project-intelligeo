require('dotenv').config();
const validator = require('validator');
const Franchise = require('../models/franchise_model');
const turf = require('turf');
const axios = require('axios');
const moment = require('moment');
const util = require('../../util/util');
const expire = process.env.TOKEN_EXPIRE;

const verifySetting = async (req, res) => {
    const { id, uid } = req.query
    const result = await Franchise.verifySetting(id, uid)
    console.log(result)
    if (result.error) {
        res.status(403).send({ error: result.error });
        return;
    } res.status(200).send({ msg: result.msg })
}

const setAccount = async (req, res) => {
    const { id } = req.query;
    const { password } = req.body;
    const result = await Franchise.setAccount(id, password)

    res.status(200).send({ msg: result.msg })
}

const nativeLogin = async (req, res) => {
    const { account, password } = req.body;
    const result = await Franchise.nativeLogin(account, password, expire);
    if (result.error) {
        res.status(403).send({ error: result.error })
        return
    } res.status(200).send({ data: result })
}
module.exports = {
    verifySetting,
    setAccount,
    nativeLogin
}