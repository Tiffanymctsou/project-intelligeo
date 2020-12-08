const protocol = window.location.protocol;
const domain = window.location.host;
let myLatLng = { "lat": 25.0409, "lng": 121.572 };


function initMap() {
    let drawingManager;
    let selectedShape;
    let infoWindow;
    let infoMarker;
    let poiMarkers = [];

    // function getCenter() {
    //     const cityName = document.querySelector('#city').value;
    //     const townName = document.querySelector('#town').value;
    //     const locationData = {
    //         city: cityName,
    //         town: townName
    //     }

    //     axios.post(`${protocol}//${domain}/admin/getSelectedLocation`, locationData)
    //         .then((response) => {
    //             let data = response.data.data
    //             let coordinate = data.coordinate;
    //             console.log(myLatLng);
    //             console.log(coordinate);
    //         })
    // }

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
            if (poiMarkers.length !== 0) {
                poiMarkers.forEach(marker => {
                    marker.setMap(null);
                })
                document.querySelector('.results').innerHTML = "";
            }
        }
    }

    async function saveCoordinates() {
        const coordinates = await getCoordinates(selectedShape);
        const storage = window.localStorage;
        storage.setItem('coordinates', JSON.stringify(coordinates));
        window.location.replace('/admin/addFranchise/profile.html');
    }

    function initialise() {
        let map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: myLatLng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true
        });

        let polyOptions = {
            strokeWeight: 0,
            strokeColor: '#1E90FF',
            fillColor: '#1E90FF',
            fillOpacity: 0.45,
            editable: true
        };

        drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    // google.maps.drawing.OverlayType.CIRCLE,
                    google.maps.drawing.OverlayType.POLYGON
                ]
            },
            polygonOptions: polyOptions,
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

                const coordinates = await getCoordinates(newShape);
                const locationData = {
                    coordinates: coordinates
                }

                const POIs = [];
                const checkboxes = document.querySelectorAll('.form-check-input');
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        POIs.push(checkbox.value);
                    }
                })
                const spotData = {
                    coordinates: coordinates,
                    poi: POIs
                }

                const locationPop = await axios.post(`${protocol}//${domain}/admin/getLocationPop`, locationData)
                    .then((response) => {
                        const data = response.data.data.locationPop
                        return data
                    })

                const locationSpot = await axios.post(`${protocol}//${domain}/admin/getLocationSpot`, spotData)
                    .then((response) => {
                        const data = response.data.data;
                        console.log(data)
                        return data
                    })
                if (locationSpot.spotData.length !== 0) {
                    locationSpot.spotData.forEach(poi => {
                        poi.info.forEach(spot => {
                            const marker = new google.maps.Marker({
                                position: spot.location,
                                icon: {
                                    url: `${protocol}//${spot.icon}`,
                                    scaledSize: new google.maps.Size(30, 30)
                                },
                                map: map
                            })
                            poiMarkers.push(marker);
                        })
                        const resultDiv = document.querySelector('.results');
                        const poiDiv = document.createElement('div');
                        poiDiv.innerHTML = `附近有 ${poi.total.spotCount} 個 ${poi.total.keyword}`;
                        resultDiv.appendChild(poiDiv);
                    })

                }

                const content = `
                        <div id="content">
                            <p><b>區域戶數：</b>${locationPop.household_no}</p><br>
                            <p><b>區域總人口：</b>${locationPop.ppl_total}</p><br>
                            <p><b>區域人口（男）：</b>${locationPop.ppl_total_m}</p><br>
                            <p><b>區域人口（女）：</b>${locationPop.ppl_total_f}</p><br>
                        </div>`
                infoWindow = new google.maps.InfoWindow({
                    content: content
                });
                infoMarker = new google.maps.Marker({
                    map: map,
                    position: { lat: locationSpot.spotCentre[1], lng: locationSpot.spotCentre[0] }
                });
                infoWindow.open(map, infoMarker)
            }
        });

        // Load Geo Data
        // map.data.loadGeoJson(`${protocol}//${domain}/admin/geo/village_bound.json`)
        // map.data.setStyle({
        //     strokeOpacity: 0.5,
        //     strokeWeight: 1,
        //     fillOpacity: 0
        // });

        // Clear the current selection when the drawing mode is changed, or when the
        google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
        google.maps.event.addListener(map, 'click', clearSelection);

        // google.maps.event.addDomListener(document.getElementById('location-data'), 'click', getSelectedLocation);
        google.maps.event.addDomListener(document.getElementById('remove-shape'), 'click', deleteSelectedShape);
        google.maps.event.addDomListener(document.getElementById('next'), 'click', saveCoordinates);
    }

    google.maps.event.addDomListener(window, 'load', initialise);
}

async function getCoordinates(shape) {
    const paths = shape.getPath().getArray();
    const coordinates = paths.map(location => {
        let coordinates = [location.lng(), location.lat()]
        return coordinates
    });
    return coordinates
}


