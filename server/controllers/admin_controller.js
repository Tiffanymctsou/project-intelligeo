require('dotenv').config();
const validator = require('validator');
const Admin = require('../models/admin_model');

const createFranchise = async (req, res) => {
    console.log(req.body)
    let { name, auth, email, area } = req.body;


    // if (!name || !email) {
    //     res.status(400).send({ error: 'Request Error: name and email are required.' });
    //     return;
    // }

    // if (!validator.isEmail(email)) {
    //     res.status(400).send({ error: 'Request Error: Invalid email format' });
    //     return;
    // }

    // name = validator.escape(name);

    const result = await Admin.createMember(name, auth, email, area);

    if (result.error) {
        res.status(403).send({ error: result.error });
        return;
    }

    const { user } = result;


    res.status(200).send({
        data: {
            user
        }
    })

}

module.exports = {
    createFranchise
}