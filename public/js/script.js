const socket = io();
const deviceId = navigator.userAgent; // Use user agent as a unique identifier for each device

// Emit the device ID upon connection
socket.on("connect", () => {
    console.log(`Connected with device ID: ${deviceId}`);
    socket.emit("register_device", { deviceId });
});

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude: lat, longitude: long } = position.coords;
            console.log(`Sending location from ${deviceId}: Latitude ${lat}, Longitude ${long}`);
            socket.emit("send_location", { deviceId, lat, long });
        },
        (error) => {
            console.log("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,  // no caching
            timeout: 5000
        }
    );
} else {
    console.log("Geolocation is not supported by this browser.");
}

const map = L.map("map").setView([0, 0], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const markers = {};

socket.on("receive-location", (data) => {
    const { id, deviceId, lat, long } = data;
    console.log(`Received location from ${deviceId}: Latitude ${lat}, Longitude ${long}`);
    if (markers[id]) {
        markers[id].setLatLng([lat, long]);
    } else {
        markers[id] = L.marker([lat, long]).addTo(map).bindPopup(deviceId).openPopup();
    }
    map.setView([lat, long], 16);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("user_disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});