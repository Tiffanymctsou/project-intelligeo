const protocol = window.location.protocol;
const domain = window.location.host;
const myLatLng = { lat: 25.0472, lng: 121.5172 };

function initMap() {
    let drawingManager;
    let selectedShape;

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

    function saveMember() {
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
        axios.post(`${protocol}//${domain}/admin/createMember`, memberData)
            .then((response) => {
                alert('member added!')
                let user = response.data.data
                console.log(user);
            })
    }

    function getVillage(target) {
        const data = target.feature.j;
        const info = {
            village: data.V_Name,
            town: data.T_Name,
            city: data.C_Name
        }
        console.log(info)
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

        google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
            if (e.type != google.maps.drawing.OverlayType.MARKER) {
                // Switch back to non-drawing mode after drawing a shape.
                drawingManager.setDrawingMode(null);
                // To hide:
                drawingManager.setOptions({
                    drawingControl: false
                });
                // mouses down on it.
                var newShape = e.overlay;
                newShape.type = e.type;
                google.maps.event.addListener(newShape, 'click', function () {
                    setSelection(newShape);
                });
                setSelection(newShape);
            }
        });

        // Load Geo Data
        map.data.loadGeoJson(`${protocol}//${domain}/geo/village_bound.json`)
        map.data.setStyle({
            strokeOpacity: 0.5,
            strokeWeight: 1,
            fillOpacity: 0
        });
        map.data.addListener('click', getVillage);

        // Clear the current selection when the drawing mode is changed, or when the
        google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
        google.maps.event.addListener(map, 'click', clearSelection);


        google.maps.event.addDomListener(document.getElementById('remove-shape'), 'click', deleteSelectedShape);
        google.maps.event.addDomListener(document.getElementById('save-member'), 'click', saveMember);
    }

    google.maps.event.addDomListener(window, 'load', initialise);
}
