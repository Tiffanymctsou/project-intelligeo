const protocol = window.location.protocol;
const domain = window.location.host;
let myLatLng = { "lat": 25.0409, "lng": 121.572 };

function initMap() {
    let drawingManager;
    let selectedShape;

    function getSelectedLocation() {
        const cityName = document.querySelector('#city').value;
        const townName = document.querySelector('#town').value;
        const locationData = {
            city: cityName,
            town: townName
        }

        axios.post(`${protocol}//${domain}/admin/getSelectedLocation`, locationData)
            .then((response) => {
                let data = response.data.data
                let coordinate = data.coordinate;
                console.log(myLatLng);
                console.log(coordinate);
            })
    }

    function clearSelection() {
        if (selectedShape) {
            selectedShape.setEditable(false);
            selectedShape = null;
        }
    }

    function setSelection(shape) {
        clearSelection();
        selectedShape = shape;
        shape.setEditable(true);
    }

    function deleteSelectedShape() {
        if (selectedShape) {
            selectedShape.setMap(null);
            // To show:
            drawingManager.setOptions({
                drawingControl: true
            });
        }
    }

    function addFranchise() {
        const paths = selectedShape.getPath().getArray();
        const coordinates = paths.map(location => {
            let obj = {}
            obj.lat = location.lat();
            obj.lng = location.lng();
            return obj
        });
        const memberData = {
            name: document.querySelector('.member.name').value,
            auth: document.querySelector('.member.auth').value,
            email: document.querySelector('.member.email').value,
            area: JSON.stringify(coordinates)
        }

        console.log(memberData)
        axios.post(`${protocol}//${domain}/admin/addFranchise`, memberData)
            .then((response) => {
                alert('member added!')
                let user = response.data.data
                console.log(user);
            })
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
        // Creates a drawing manager attached to the map that allows the user to draw
        // markers, lines, and shapes.
        drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.POLYGON,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                    google.maps.drawing.OverlayType.CIRCLE,
                    google.maps.drawing.OverlayType.POLYGON
                ]
            },
            polygonOptions: polyOptions,
            map: map
        });

        google.maps.event.addListener(drawingManager, 'overlaycomplete', async function (e) {
            if (e.type != google.maps.drawing.OverlayType.MARKER) {
                // Switch back to non-drawing mode after drawing a shape.
                drawingManager.setDrawingMode(null);
                // To hide:
                drawingManager.setOptions({
                    drawingControl: false
                });
                // mouses down on it.
                let newShape = e.overlay;
                newShape.type = e.type;
                google.maps.event.addListener(newShape, 'click', () => {
                    setSelection(newShape);
                })

                setSelection(newShape);

                const paths = newShape.getPath().getArray();
                const coordinates = paths.map(location => {
                    let coordinates = [location.lng(), location.lat()]
                    return coordinates
                });
                const locationData = {
                    coordinates: coordinates
                }

                const locationPop = await axios.post(`${protocol}//${domain}/admin/getLocationPop`, locationData)
                    .then((response) => {
                        const data = response.data.data.locationPop
                        return data
                    })
                const content = `
                        <div id="content">
                            <p><b>區域戶數：</b>${locationPop.household_no}</p><br>
                            <p><b>區域總人口：</b>${locationPop.ppl_total}</p><br>
                            <p><b>區域人口（男）：</b>${locationPop.ppl_total_m}</p><br>
                            <p><b>區域人口（女）：</b>${locationPop.ppl_total_f}</p><br>
                        </div>`
                const infowindow = new google.maps.InfoWindow({
                    content: content
                });
                const marker = new google.maps.Marker({
                    map: map,
                    position: { lat: 25.0409, lng: 121.572 }
                });
                infowindow.open(map, marker)
                console.log(locationPop);
            }
        });

        // Load Geo Data
        // map.data.loadGeoJson(`${protocol}//${domain}/geo/village_bound.json`)
        // map.data.setStyle({
        //     strokeOpacity: 0.5,
        //     strokeWeight: 1,
        //     fillOpacity: 0
        // });

        // Clear the current selection when the drawing mode is changed, or when the
        google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
        google.maps.event.addListener(map, 'click', clearSelection);

        google.maps.event.addDomListener(document.getElementById('location-data'), 'click', getSelectedLocation);
        google.maps.event.addDomListener(document.getElementById('remove-shape'), 'click', deleteSelectedShape);
        google.maps.event.addDomListener(document.getElementById('save-member'), 'click', addFranchise);
    }

    google.maps.event.addDomListener(window, 'load', initialise);
}
