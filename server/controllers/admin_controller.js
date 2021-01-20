require("dotenv").config();
const salt = parseInt(process.env.BCRYPT_SALT);
const secret = process.env.JWT_SECRET;
const expire = process.env.TOKEN_EXPIRE;
const validator = require("validator");
const turf = require("turf");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const inLineCss = require("nodemailer-juice");
const cityGeo = require("../../util/city_bound.json");
const townGeo = require("../../util/town_bound.json");
const villageGeo = require("../../util/village_bound.json");
const Util = require("../../util/util");
const Admin = require("../models/admin_model");

const getLocationPop = async (req, res) => {
    const { coordinates } = req.body;
    const turfCoordinates = await alterCoordinates(coordinates);
    const selectedPoly = turf.polygon([turfCoordinates]);
    const spotCentre = turf.centroid(selectedPoly).geometry.coordinates;
    const townCodes = [];
    const villageCodes = [];
    const intersections = [];
    const cityData = cityGeo.features;
    const townData = townGeo.features;
    const villageData = villageGeo.features;

    cityData.forEach((city) => {
        if (city.geometry.type == "Polygon") {
            const cityPoly = turf.polygon(city.geometry.coordinates);
            const isIntersected = turf.intersect(selectedPoly, cityPoly);
            if (isIntersected) {
                townData.forEach((town) => {
                    if (
                        town.geometry.type == "Polygon" &&
                        town.properties.COUNTYCODE == city.properties.COUNTYCODE
                    ) {
                        const townPoly = turf.polygon(
                            town.geometry.coordinates
                        );
                        const isIntersected = turf.intersect(
                            selectedPoly,
                            townPoly
                        );
                        if (isIntersected) {
                            townCodes.push(town.properties.TOWNCODE);
                        }
                    }
                });
            }
        }
    });

    townCodes.forEach((code) => {
        villageData.forEach((village) => {
            if (
                village.geometry.type == "Polygon" &&
                village.properties.TOWNCODE == code
            ) {
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
                        ratio: ratio,
                    };
                    intersections.push(info);
                    villageCodes.push(village.properties.VILLCODE);
                }
            }
        });
    });

    const villageInfo = await Admin.getVillagePop(villageCodes);
    let household_no = 0;
    let ppl_total = 0;
    let ppl_total_m = 0;
    let ppl_total_f = 0;
    const locationPop = {
        household_no,
        ppl_total,
        ppl_total_m,
        ppl_total_f,
    };
    for (let i = 0; i < villageInfo.length; i++) {
        const village = villageInfo[i];
        const intersect = intersections[i];
        if (village.village_code == intersect.village_code) {
            locationPop.household_no += Math.ceil(
                village.household_no * intersect.ratio
            );
            locationPop.ppl_total += Math.ceil(
                village.ppl_total * intersect.ratio
            );
            locationPop.ppl_total_m += Math.ceil(
                village.ppl_total_m * intersect.ratio
            );
            locationPop.ppl_total_f += Math.ceil(
                village.ppl_total_f * intersect.ratio
            );
        }
    }

    res.status(200).send({
        data: {
            locationPop,
            spotCentre,
        },
    });
};

const getLocationSpot = async (req, res) => {
    const { coordinates, poi } = req.body;
    const south = coordinates.sw.lat;
    const west = coordinates.sw.lng;
    const north = coordinates.ne.lat;
    const east = coordinates.ne.lng;
    const spots = [];
    for (let i = 0; i < poi.length; i++) {
        const spot = await Admin.getMarker(poi[i], south, west, north, east);
        const spotInfo = [];
        spot.marker.forEach((point) => {
            const info = {
                poi: poi[i],
                icon: point.icon_path,
                location: {
                    lat: point.lat,
                    lng: point.lng,
                },
            };
            spotInfo.push(info);
        });
        spots.push(spotInfo);
    }

    res.status(200).send({
        data: {
            spots,
        },
    });
};

const getFranchiseArea = async (req, res) => {
    const franchises = await Admin.getFranchiseArea();
    const franchiseArea = [];
    for (let i = 0; i < franchises.length; i++) {
        const franchise = {
            name: franchises[i].fullname,
            area: [],
        };
        const area = alterCoordinates(JSON.parse(franchises[i].area));
        area.forEach((coordinate) => {
            const latLng = {
                lat: coordinate[1],
                lng: coordinate[0],
            };
            franchise.area.push(latLng);
        });
        franchiseArea.push(franchise);
    }

    res.status(200).send({
        data: {
            franchiseArea,
        },
    });
};

function alterCoordinates(coordinates) {
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
            coordinate: JSON.parse(coordinate),
        },
    });
};

const addFranchise = async (req, res) => {
    const domain = req.get("host");
    const {
        franchise_id,
        franchise_fullname,
        franchise_city,
        franchise_email,
        franchise_phone,
        franchise_address,
        franchise_location,
        coordinates,
    } = req.body;

    if (!franchise_fullname || !franchise_email) {
        res.status(400).send({
            error: "Request Error: name and email are required.",
        });
        return;
    }

    if (!validator.isEmail(franchise_email)) {
        res.status(400).send({ error: "Request Error: Invalid email format" });
        return;
    }

    const result = await Admin.addFranchise(
        franchise_id,
        franchise_fullname,
        franchise_city,
        franchise_email,
        franchise_phone,
        franchise_address,
        franchise_location,
        coordinates
    );

    await Admin.createAccount(franchise_id, franchise_email);
    if (result.error) {
        res.status(403).send({ error: result.error });
        return;
    }

    const mailOptions = {
        from: "intelligeo TW <no-reply@gmail.com>",
        to: `${franchise_fullname} <${franchise_email}>`,
        cc: "intelligeo.tw@gmail.com",
        subject: "完成您的密碼設置",
        html: await sendMailContent(
            franchise_fullname,
            domain,
            franchise_id,
            franchise_email
        ),
    };
    Util.transporter.use("compile", inLineCss());
    Util.transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            return console.log(err);
        }
        return console.log("Email sent: " + info.response);
    });
    res.status(200).send({ msg: "Success!" });
};

const sendMailContent = async (name, domain, franchise_id, franchise_email) => {
    const hashed_email = bcrypt.hashSync(franchise_email, salt);
    return `
    <html>
    <head>
    <style>
    .content {
        position: relative;
        display: flex;
        flex-direction: column;
        min-width: 0;
        word-wrap: break-word;
        background-color: #fff;
        background-clip: border-box;
        border: 1px solid rgba(0, 0, 0, 0.125);
        border-radius: 0.25rem;
      }
      
      .content-body {
        flex: 1 1 auto;
        padding: 1.25rem;
        /* display: block;
          overflow: auto; */
      }
      
      .content .content-body {
        padding: 1.88rem 1.81rem;
      }
    </style>
    </head>
    
    <body>
      <div class="content">
        <div class="content-body">
          <h3>嗨， ${name}</h3>
          <p>歡迎您的加入！</p>
          <p>請您點擊以下連結設置您的密碼：</p>
          <p class="strong">https://${domain}/franchise/setting.html?id=${franchise_id}&uid=${hashed_email}</p>
			<div class="logo">
                <a href="https://intelligeo.online"><img src="https://d2vlwc6o9qpx5r.cloudfront.net/images/admin/logo-1.png" width="200px"/></a>
        	</div>
		</div>
    </body>
</html>
    `;
};

const getFranchise = async (req, res) => {
    const result = await Admin.getFranchise();
    res.status(200).send(result);
};

const getReportStatus = async (req, res) => {
    const result = await Admin.getReportStatus();
    res.status(200).send(result);
};

module.exports = {
    getSelectedLocation,
    addFranchise,
    getLocationPop,
    getFranchise,
    getLocationSpot,
    getFranchiseArea,
    getReportStatus,
};
