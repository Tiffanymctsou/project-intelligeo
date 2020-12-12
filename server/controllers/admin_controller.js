require('dotenv').config();
// const validator = require('validator');
const Admin = require('../models/admin_model');
const turf = require('turf');
const axios = require('axios');
const moment = require('moment');
const { GOOGLE_KEY } = process.env;

const getLocationPop = async (req, res) => {
    const protocol = req.get('protocol');
    const domain = req.get('host');
    const { coordinates } = req.body;
    const turfCoordinates = await alterCoordinates(coordinates);
    const selectedPoly = turf.polygon([turfCoordinates])
    const spotCentre = turf.centroid(selectedPoly).geometry.coordinates;

    const villageCodes = [];
    const intersections = [];

    await axios.get(`http://${domain}/admin/geo/village_bound.json`)
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
                        // console.log(info);
                        intersections.push(info);
                        villageCodes.push(village.properties.VILLCODE);
                    }
                }
            })
        })

    // Get and calculate population data
    const villageInfo = await Admin.getVillagePop(villageCodes);
    // console.log(villageInfo)
    let household_no = 0;
    let ppl_total = 0;
    let ppl_total_m = 0;
    let ppl_total_f = 0;
    const locationPop = {
        household_no,
        ppl_total,
        ppl_total_m,
        ppl_total_f
    };
    for (let i = 0; i < villageInfo.length; i++) {
        const village = villageInfo[i];
        const intersect = intersections[i];
        if (village.village_code == intersect.village_code) {
            locationPop.household_no += Math.ceil(village.household_no * intersect.ratio)
            locationPop.ppl_total += Math.ceil(village.ppl_total * intersect.ratio)
            locationPop.ppl_total_m += Math.ceil(village.ppl_total_m * intersect.ratio)
            locationPop.ppl_total_f += Math.ceil(village.ppl_total_f * intersect.ratio)
        }
    }

    res.status(200).send({
        data: {
            locationPop,
            spotCentre
        }
    })
}

const getLocationSpot = async (req, res) => {
    const { coordinates, poi } = req.body;
    const south = coordinates.sw.lat
    const west = coordinates.sw.lng
    const north = coordinates.ne.lat
    const east = coordinates.ne.lng
    // poi
    const spots = []
    for (let i = 0; i < poi.length; i++) {
        const spot = await Admin.getMarker(poi[i], south, west, north, east)
        const spotInfo = []
        spot.marker.forEach(point => {
            const info = {
                poi: poi[i],
                icon: point.icon_path,
                location: {
                    lat: point.lat,
                    lng: point.lng
                }
            }
            spotInfo.push(info)
        })
        spots.push(spotInfo)
    }

    res.status(200).send({
        data: {
            spots
        }
    })
}

const getFranchiseArea = async (req, res) => {
    const franchises = await Admin.getFranchiseArea()
    const franchiseArea = []
    for (let i = 0; i < franchises.length; i++) {
        const franchise = {
            name: franchises[i].fullname,
            area: []
        }
        const area = await alterCoordinates(JSON.parse(franchises[i].area))
        area.forEach(coordinate => {
            const latLng = {
                lat: coordinate[1],
                lng: coordinate[0]
            }
            franchise.area.push(latLng)
        })
        franchiseArea.push(franchise)
    }

    res.status(200).send({
        data: {
            franchiseArea
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
    let { franchise_id,
        franchise_fullname,
        franchise_city,
        franchise_email,
        franchise_phone,
        franchise_address,
        franchise_location,
        coordinates } = req.body;

    // if (!name || !email) {
    //     res.status(400).send({ error: 'Request Error: name and email are required.' });
    //     return;
    // }

    // if (!validator.isEmail(email)) {
    //     res.status(400).send({ error: 'Request Error: Invalid email format' });
    //     return;
    // }

    // name = validator.escape(name);
    const join_date = moment().format('YYYY-MM-DD');
    console.log(join_date)
    const result = await Admin.addFranchise(franchise_id, franchise_fullname, franchise_city, franchise_email, franchise_phone, franchise_address, franchise_location, coordinates, join_date);

    if (result.error) {
        res.status(403).send({ error: result.error });
        return;
    }

    const { msg } = result;


    res.status(200).send({
        data: {
            msg
        }
    })

}

const getFranchise = async (req, res) => {
    const result = await Admin.getFranchise();
    console.log(result)

    res.status(200).send({
        data: {
            result
        }
    })
}

module.exports = {
    getSelectedLocation,
    addFranchise,
    getLocationPop,
    getFranchise,
    getLocationSpot,
    getFranchiseArea
}