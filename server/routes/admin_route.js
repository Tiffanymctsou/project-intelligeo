const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
    getSelectedLocation,
    addFranchise,
    getLocationPop,
    getFranchise,
    getLocationSpot
} = require('../controllers/admin_controller');

router.route('/admin/getSelectedLocation')
    .post(wrapAsync(getSelectedLocation));

router.route('/admin/addFranchise')
    .post(wrapAsync(addFranchise));

router.route('/admin/getLocationPop')
    .post(wrapAsync(getLocationPop));

router.route('/admin/getLocationSpot')
    .post(wrapAsync(getLocationSpot));

router.route('/admin/getFranchise')
    .get(wrapAsync(getFranchise))


module.exports = router;