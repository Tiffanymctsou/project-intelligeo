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

router.route('/franchise/verifySetting').get(wrapAsync(verifySetting));

router.route('/franchise/account').patch(wrapAsync(setAccount));

router.route('/franchise/nativeLogin').post(wrapAsync(nativeLogin));

router.route('/franchise/locationRecord').get(verifyToken, wrapAsync(getLocationRecord));

router.route('/franchise/openStatus').get(verifyToken, wrapAsync(getOpenStatus));

router.route('/franchise/openStatus').patch(verifyToken, wrapAsync(updateOpenStatus));

router.route('/franchise/reportSales').post(verifyToken, wrapAsync(reportSales));

module.exports = router;
