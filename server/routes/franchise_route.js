const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
    verifySetting,
    setAccount,
    nativeLogin,
    verifyToken,
    getOpenStatus,
    updateOpenStatus,
    getLocationRecord,
    reportSales
} = require('../controllers/franchise_controller');

router.route('/franchise/verifySetting')
    .get(wrapAsync(verifySetting));

router.route('/franchise/setAccount')
    .post(wrapAsync(setAccount));

router.route('/franchise/nativeLogin')
    .post(wrapAsync(nativeLogin));

router.route('/franchise/getLocationRecord')
    .get(verifyToken, wrapAsync(getLocationRecord))

router.route('/franchise/getOpenStatus')
    .get(verifyToken, wrapAsync(getOpenStatus))

router.route('/franchise/updateOpenStatus')
    .post(verifyToken, wrapAsync(updateOpenStatus))

router.route('/franchise/reportSales')
    .post(verifyToken, wrapAsync(reportSales))

module.exports = router;