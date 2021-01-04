const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { registerEnterprise, setAccount, nativeLogin, verifySetting } = require('../controllers/enterprise_controller');

router.route('/enterprise/register').post(wrapAsync(registerEnterprise));

router.route('/enterprise/verifySetting').get(wrapAsync(verifySetting));

router.route('/enterprise/setAccount').patch(wrapAsync(setAccount));

router.route('/enterprise/nativeLogin').post(wrapAsync(nativeLogin));

module.exports = router;
