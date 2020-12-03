const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
    getSelectedLocation,
    addFranchise,
    getLocationPop
} = require('../controllers/admin_controller');

router.route('/admin/getSelectedLocation')
    .post(wrapAsync(getSelectedLocation));

router.route('/admin/addFranchise')
    .post(wrapAsync(addFranchise));

router.route('/admin/getLocationPop')
    .post(wrapAsync(getLocationPop));


module.exports = router;