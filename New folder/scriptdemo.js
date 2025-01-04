// Client-side (script.js): This is where you handle the logic to send the location data to the server only if the distance is greater than 50 meters.
const socket = io();
let lastSentLocation = null;

// Function to calculate the distance between two coordinates using the Haversine formula
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Radius of the Earth in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

// Function to send location data
function sendLocation(deviceId, lat, long) {
    if (lastSentLocation) {
        const distance = getDistanceFromLatLonInMeters(lastSentLocation.lat, lastSentLocation.long, lat, long);
        if (distance < 50) {
            console.log('Distance is less than 50 meters, not sending location.');
            return;
        }
    }
    lastSentLocation = { lat, long };
    socket.emit('send_location', {
        deviceId: deviceId,
        lat: lat,
        long: long
    });
}

// Example usage: sending location data
navigator.geolocation.getCurrentPosition((position) => {
    const deviceId = 'your-device-id'; // Replace with actual device ID
    const lat = position.coords.latitude;
    const long = position.coords.longitude;
    sendLocation(deviceId, lat, long);
});

// Existing code
map.removeLayer(markers[id]);
delete markers[id];


// In summary, axios is used on the server-side to send the location data to your friend's Django server, while the client-side code handles the logic to determine when to send the location data based on the distance.