require('dotenv').config();
// const validator = require('validator');
const Admin = require('../models/admin_model');
const turf = require('turf');
const axios = require('axios');


const getLocationPop = async (req, res) => {
    const protocol = req.get('protocol');
    const domain = req.get('host');
    const { coordinates } = req.body;
    const turfCoordinates = await alterCoordinates(coordinates);
    const selectedPoly = turf.polygon([turfCoordinates])

    const villageCodes = [];
    const intersections = [];

    await axios.get(`http://${domain}/geo/village_bound.json`)
        .then((response) => {
            const data = response.data.features
            data.forEach(village => {
                if (village.geometry.type == 'Polygon') {
                    const villagePoly = turf.polygon(village.geometry.coordinates);
                    const villageArea = turf.area(villagePoly);
                    const isIntersected = turf.intersect(selectedPoly, villagePoly);
                    if (isIntersected) {
                        const intersection = turf.area(isIntersected);
                        const ratio = intersection / villageArea;
                        const info = {
                            // village: village.properties.VILLNAME,
                            village_code: village.properties.VILLCODE,
                            // village_area: villageArea,
                            // intersection: intersection,
                            ratio: ratio
                        }
                        intersections.push(info);
                        villageCodes.push(village.properties.VILLCODE);
                    }
                }
            })
        })

    // Get and calculate population data
    const villageInfo = await Admin.getVillagePop(villageCodes);
    const locationPop = {};
    for (let i = 0; i < villageInfo.length; i++) {
        const village = villageInfo[i];
        const intersect = intersections[i];
        if (village.village_code == intersect.village_code) {
            locationPop.household_no = Math.ceil(village.household_no * intersect.ratio)
            locationPop.ppl_total = Math.ceil(village.ppl_total * intersect.ratio)
            locationPop.ppl_total_m = Math.ceil(village.ppl_total_m * intersect.ratio)
            locationPop.ppl_total_f = Math.ceil(village.ppl_total_f * intersect.ratio)
        }
    }

    res.status(200).send({
        data: {
            locationPop
        }
    })
}


async function alterCoordinates(coordinates) {
    coordinates.push(coordinates[0]);
    return coordinates;
}

const getSelectedLocation = async (req, res) => {
    let { city, town } = req.body;

    const result = await Admin.getSelectedLocation(city, town);

    if (result.error) {
        res.status(403).send({ error: result.error });
        return;
    }

    const { coordinate } = result.townInfo[0];
    res.status(200).send({
        data: {
            coordinate: JSON.parse(coordinate)
        }
    })

}

const addFranchise = async (req, res) => {
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

    const result = await Admin.addFranchise(name, auth, email, area);

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
    getSelectedLocation,
    addFranchise,
    getLocationPop
}