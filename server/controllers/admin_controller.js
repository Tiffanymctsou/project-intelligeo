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
            locationPop
        }
    })
}

const getLocationSpot = async (req, res) => {
    const protocol = req.get('protocol');
    const domain = req.get('host');
    const { coordinates, poi } = req.body;
    const turfCoordinates = await alterCoordinates(coordinates)
    const spot = turf.polygon([turfCoordinates])
    const spotCentre = turf.centroid(spot).geometry.coordinates;
    // Get furthest point distance
    let maxDistance = 0;
    coordinates.forEach(point => {
        let distance = turf.distance(turf.point(spotCentre), turf.point(point)) // default unit: kilometers 
        if (distance > maxDistance) {
            maxDistance = distance;
        }
    })
    const spotData = [];
    if (poi.length !== 0) {
        for (let i = 0; i < poi.length; i++) {
            const keyword = poi[i];
            const radius = Math.ceil(maxDistance * 1000);
            const marker = await Admin.getMarker(keyword);
            let apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${spotCentre[1]},${spotCentre[0]}&radius=${radius}&keyword='${keyword}'&key=${GOOGLE_KEY}`
            await axios.get(`${encodeURI(apiUrl)}`)
                .then((response) => {
                    const result = response.data.results;
                    return result;
                })
                .then((result) => {
                    const spot = [];
                    for (let j = 0; j < result.length; j++) {
                        const data = result[j];
                        const spotInfo = {
                            location: data.geometry.location,
                            icon: `${domain}/${marker.marker[0].path}`
                        }
                        spot.push(spotInfo);
                    }
                    const spotTotal = {
                        keyword: keyword,
                        spotCount: result.length
                    }
                    const spots = {
                        info: spot,
                        total: spotTotal
                    }
                    spotData.push(spots);
                })
        }
    }
    res.status(200).send({
        data: {
            spotCentre: spotCentre,
            spotData: spotData
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
    getLocationSpot
}