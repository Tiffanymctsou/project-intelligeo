const protocol = window.location.protocol;
const domain = window.location.host;

async function getTowns(index) {
    const city = document.getElementById('map_city')
    townInfo = []
    city[0].disabled = true;
    const selectedCity = city[index].value
    const towns = await app.readjson('./geo/city_town.json')
    towns.forEach(town => {
        if (town.city == selectedCity) {
            const info = {
                town_name: town.town,
                town_code: town.town_code,
                centre: {
                    lat: town.lat,
                    lng: town.lng
                }
            }
            townInfo.push(info)
        }

    })
    // show towns
    const townSelectTag = document.getElementById('map_town');
    let options = '<optgroup label="行政區"></optgroup>'
    townInfo.forEach(town => {
        options += `<option value="${town.town_code}">${town.town_name}</option>`
    })
    townSelectTag.innerHTML = options
}
async function getCentre(index) {
    const town = document.getElementById('map_town')
    const selectedTown = town[index].value
    let centre;
    townInfo.forEach(town => {
        if (town.town_code == selectedTown) {
            centre = town.centre
        }
    })
    return centre
}
async function getShapeCoordinates(shape) {
    const paths = shape.getPath().getArray();
    const coordinates = paths.map(location => {
        let coordinates = [location.lng(), location.lat()]
        return coordinates
    });
    return coordinates
}

function initMap() {
    let drawingManager;
    let selectedShape;
    let infoWindow;
    let infoMarker;
    let poiMarkers = []
    let areaPolygons = []

    function setSelection(shape) {
        clearSelection();
        selectedShape = shape;
        shape.setEditable(true);
    }
    function clearSelection() {
        if (selectedShape) {
            selectedShape.setEditable(false);
            selectedShape = null;
        }
    }
    function deleteSelectedShape() {
        if (selectedShape) {
            selectedShape.setMap(null);
            // To show:
            drawingManager.setOptions({
                drawingControl: true
            });
            infoWindow.close();
            infoMarker.setMap(null);
            if (poiMarkers.length != 0) {
                poiMarkers.forEach(marker => {
                    marker.setMap(null);
                })
                document.querySelector('.results').innerHTML = "";
            }
        }
    }

    async function saveCoordinates() {
        if (selectedShape) {
            const coordinates = await getShapeCoordinates(selectedShape);
            const storage = window.localStorage;
            storage.setItem('coordinates', JSON.stringify(coordinates));
            window.location.replace('/admin/addFranchise/profile.html');
        } else {
            alert('請先決定加盟主區域！')
        }
    }

    function initialise() {
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: new google.maps.LatLng(25.0409, 121.572),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true
        });
        // change centre
        async function moveCentre() {
            const latLng = await getCentre(this.selectedIndex);
            const centre = new google.maps.LatLng(latLng.lat, latLng.lng);
            map.panTo(centre)
        }
        google.maps.event.addDomListener(document.getElementById('map_town'), 'change', moveCentre)

        // poi
        async function loadSpots(map) {
            const poi = await getPoi();
            if (poi.length !== 0) {
                const coordinates = {
                    sw: { lat: map.getBounds().getSouthWest().lat(), lng: map.getBounds().getSouthWest().lng() },
                    ne: { lat: map.getBounds().getNorthEast().lat(), lng: map.getBounds().getNorthEast().lng() }
                }
                const spotData = {
                    coordinates: coordinates,
                    poi: poi
                }

                const locationSpot = await axios.post(`${protocol}//${domain}/admin/getLocationSpot`, spotData)
                    .then((response) => {
                        const data = response.data.data;
                        return data
                    })
                return locationSpot
            }
        }
        async function checkPoi() {
            if (this.checked) {
                const locationSpot = await loadSpots(map);
                showMarkers(map, locationSpot)
            } else if (!this.checked) {
                clearMarkers(this.value)
            }
        }
        async function getPoi() {
            const POIs = [];
            const checkboxes = document.querySelectorAll('.form-check-input');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    POIs.push(checkbox.value);
                }
            })
            return POIs
        }
        function showMarkers(map, locationSpot) {
            if (locationSpot != null) {
                locationSpot.spots.forEach(poi => {
                    poi.forEach(spot => {
                        const marker = new google.maps.Marker({
                            position: spot.location,
                            icon: {
                                url: `${protocol}//${domain}${spot.icon}`,
                                scaledSize: new google.maps.Size(20, 20)
                            },
                            map: map
                        })
                        const markerObj = {
                            poi: spot.poi,
                            marker: marker
                        }
                        poiMarkers.push(markerObj);
                    })
                })
            }
        }
        function clearMarkers(value) {
            if (poiMarkers.length !== 0) {
                poiMarkers.forEach(marker => {
                    if (marker.poi == value) {
                        marker.marker.setMap(null);
                    }
                })
            }
        }
        google.maps.event.addDomListener(document.getElementById('pxmart'), 'click', checkPoi)

        // franchise switch
        async function loadFranchise() {
            const franchiseArea = await axios.get(`${protocol}//${domain}/admin/getFranchiseArea`)
                .then((response) => {
                    const data = response.data.data;
                    return data
                })
            return franchiseArea
        }
        async function checkSwitch() {
            if (this.checked) {
                const franchiseArea = await loadFranchise();
                showArea(map, franchiseArea)
            } else if (!this.checked) {
                clearArea()
            }
        }
        function showArea(map, franchiseArea) {
            if (franchiseArea != null) {
                franchiseArea.franchiseArea.forEach(franchise => {
                    const area = new google.maps.Polygon({
                        path: franchise.area,
                        strokeColor: "#FF0000",
                        strokeOpacity: 0,
                        strokeWeight: 2,
                        fillColor: "#FFAF60",
                        fillOpacity: 0.5,
                        map: map
                    })
                    const info = `<div id="content">${franchise.name}</div>`
                    showAreaInfo(area, info, map)
                    area.setMap(map)
                    areaPolygons.push(area)
                })
            }
        }
        function showAreaInfo(area, info, map) {
            const infoWindow = new google.maps.InfoWindow();
            google.maps.event.addListener(area, 'mouseover', (event) => {
                infoWindow.setContent(info)
                infoWindow.setPosition(event.latLng)
                area.setOptions({
                    fillColor: '#FFD306'
                })
                infoWindow.open(map)
            })
            google.maps.event.addListener(area, 'mouseout', (event) => {
                area.setOptions({
                    fillColor: '#FFAF60'
                })
                infoWindow.close()
            })
        }
        function clearArea() {
            if (areaPolygons.length !== 0) {
                areaPolygons.forEach(polygon => {
                    polygon.setMap(null);
                })
            }
        }
        google.maps.event.addDomListener(document.getElementById('franchise_switch'), 'click', checkSwitch)
        google.maps.event.addListener(map, 'bounds_changed', async () => {
            const locationSpot = await loadSpots(map);
            showMarkers(map, locationSpot)
        })

        async function getPolygonInfo(shape) {
            const coordinates = await getShapeCoordinates(shape);
            const locationData = {
                coordinates: coordinates
            }
            const location = await axios.post(`${protocol}//${domain}/admin/getLocationPop`, locationData)
                .then((response) => {
                    const data = response.data.data
                    return data
                })
            const content = `
                        <div id="content">
                            <p><b>區域戶數：</b>${location.locationPop.household_no}</p><br>
                            <p><b>區域總人口：</b>${location.locationPop.ppl_total}</p><br>
                            <p><b>區域人口（男）：</b>${location.locationPop.ppl_total_m}</p><br>
                            <p><b>區域人口（女）：</b>${location.locationPop.ppl_total_f}</p><br>
                        </div>`
            infoWindow = new google.maps.InfoWindow({
                content: content
            });
            infoMarker = new google.maps.Marker({
                map: map,
                position: { lat: location.spotCentre[1], lng: location.spotCentre[0] }
            });
            infoWindow.open(map, infoMarker)
        }

        function editPolygon(action) {
            google.maps.event.addListener(selectedShape.getPath(), action, async () => {
                console.log(action)
                infoWindow.close();
                infoMarker.setMap(null);
                getPolygonInfo(selectedShape);
            })
        }
        drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    // google.maps.drawing.OverlayType.CIRCLE,
                    google.maps.drawing.OverlayType.POLYGON
                ]
            },
            polygonOptions: {
                strokeWeight: 0,
                strokeColor: '#1E90FF',
                fillColor: '#1E90FF',
                fillOpacity: 0.45,
                editable: true
            },
            map: map
        });


        google.maps.event.addListener(drawingManager, 'overlaycomplete', async function (e) {
            if (e.type != google.maps.drawing.OverlayType.MARKER) {
                drawingManager.setDrawingMode(null);
                drawingManager.setOptions({
                    drawingControl: false
                });
                let newShape = e.overlay;
                newShape.type = e.type;
                setSelection(newShape);
                google.maps.event.addListener(newShape, 'click', () => {
                    setSelection(newShape);
                })
                getPolygonInfo(newShape)
            }
            editPolygon('set_at')
            editPolygon('insert_at')
        });

        google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
        google.maps.event.addListener(map, 'click', clearSelection);
        google.maps.event.addDomListener(document.getElementById('remove-shape'), 'click', deleteSelectedShape);
        google.maps.event.addDomListener(document.getElementById('next'), 'click', saveCoordinates);
    }
    google.maps.event.addDomListener(window, 'load', initialise);
}


