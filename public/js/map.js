let map;

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 25.0330, lng: 121.5654 },
        zoom: 15,
    });
}