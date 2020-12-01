const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const {
    createFranchise
} = require('../controllers/admin_controller');

router.route('/admin/createMember')
    .post(wrapAsync(createFranchise));


module.exports = router;