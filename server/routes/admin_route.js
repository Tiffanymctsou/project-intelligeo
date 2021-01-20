const router = require("express").Router();
const { wrapAsync } = require("../../util/util");

const {
    getSelectedLocation,
    addFranchise,
    getLocationPop,
    getFranchise,
    getLocationSpot,
    getFranchiseArea,
} = require("../controllers/admin_controller");

const {
    getReportStatus,
    getOverviewData,
    getChart,
} = require("../controllers/dashboard_controller");
const { verifyToken } = require("../controllers/enterprise_controller");

router.route("/admin/selectedLocation").post(wrapAsync(getSelectedLocation));

router.route("/admin/franchise").post(wrapAsync(addFranchise));

router.route("/admin/locationPop").post(wrapAsync(getLocationPop));

router.route("/admin/locationSpot").post(wrapAsync(getLocationSpot));

router.route("/admin/franchise").get(wrapAsync(getFranchise));

router.route("/admin/franchiseArea").get(wrapAsync(getFranchiseArea));

router.route("/admin/reportStatus").get(wrapAsync(getReportStatus));

router.route("/admin/overviewData").get(wrapAsync(getOverviewData));

router.route("/admin/chart").get(wrapAsync(getChart));

module.exports = router;
