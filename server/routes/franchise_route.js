const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
    verifySetting,
    setAccount,
    nativeLogin,
    verifyToken
} = require('../controllers/franchise_controller');

router.route('/franchise/verifySetting')
    .get(wrapAsync(verifySetting));

router.route('/franchise/setAccount')
    .post(wrapAsync(setAccount));

router.route('/franchise/nativeLogin')
    .post(wrapAsync(nativeLogin));

router.route('/franchise/verifyToken')
    .get(verifyToken)

module.exports = router;