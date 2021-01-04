const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
	getSelectedLocation,
	addFranchise,
	getLocationPop,
	getFranchise,
	getLocationSpot,
	getFranchiseArea
} = require('../controllers/admin_controller');

const { getReportStatus, getOverviewData, getChart } = require('../controllers/dashboard_controller');
const { verifyToken } = require('../controllers/enterprise_controller');

router.route('/admin/getSelectedLocation').post(wrapAsync(getSelectedLocation));

router.route('/admin/addFranchise').post(wrapAsync(addFranchise));

router.route('/admin/getLocationPop').post(wrapAsync(getLocationPop));

router.route('/admin/getLocationSpot').post(wrapAsync(getLocationSpot));

router.route('/admin/getFranchise').get(wrapAsync(getFranchise));

router.route('/admin/getFranchiseArea').get(wrapAsync(getFranchiseArea));

router.route('/admin/getReportStatus').get(wrapAsync(getReportStatus));

router.route('/admin/getOverviewData').get(wrapAsync(getOverviewData));

router.route('/admin/getChart').get(wrapAsync(getChart));

module.exports = router;
