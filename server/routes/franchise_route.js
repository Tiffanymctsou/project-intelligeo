const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
    verifySetting,
    setAccount,
    nativeLogin
} = require('../controllers/franchise_controller');

router.route('/franchise/verifySetting')
    .get(wrapAsync(verifySetting));

router.route('/franchise/setAccount')
    .post(wrapAsync(setAccount));

router.route('/franchise/nativeLogin')
    .post(wrapAsync(nativeLogin));

module.exports = router;