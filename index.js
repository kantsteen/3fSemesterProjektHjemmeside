Vue.createApp({
    data() {
        return {
            map: null,
            markers: [],
            locations: [
                { "id": 1, "timestamp": "2025-05-08T10:18:00", "latitude": 55.6775, "longitude": 12.5681, "speedKnots": 0.6 },
                { "id": 1, "timestamp": "2025-05-08T10:17:00", "latitude": 55.6772, "longitude": 12.5685, "speedKnots": 1.7 },
                { "id": 1, "timestamp": "2025-05-08T10:16:00", "latitude": 55.6769, "longitude": 12.5689, "speedKnots": 2.0 },
                { "id": 1, "timestamp": "2025-05-08T10:19:00", "latitude": 55.6298, "longitude": 12.0771, "speedKnots": 1.0 },
                { "id": 1, "timestamp": "2025-05-08T10:15:00", "latitude": 55.6765, "longitude": 12.5693, "speedKnots": 1.2 },
                { "id": 1, "timestamp": "2025-05-08T10:14:00", "latitude": 55.6762, "longitude": 12.5697, "speedKnots": 0.8 },
                { "id": 1, "timestamp": "2025-05-08T10:13:00", "latitude": 55.6759, "longitude": 12.5701, "speedKnots": 1.5 },
                { "id": 1, "timestamp": "2025-05-08T10:12:00", "latitude": 55.6756, "longitude": 12.5705, "speedKnots": 2.3 },
                { "id": 1, "timestamp": "2025-05-08T10:11:00", "latitude": 55.6753, "longitude": 12.5709, "speedKnots": 1.0 },
                { "id": 1, "timestamp": "2025-05-08T10:10:00", "latitude": 55.6750, "longitude": 12.5713, "speedKnots": 0.9 },
                { "id": 1, "timestamp": "2025-05-08T10:09:00", "latitude": 55.6747, "longitude": 12.5717, "speedKnots": 1.8 },
                { "id": 1, "timestamp": "2025-05-08T10:08:00", "latitude": 55.6747, "longitude": 12.5717, "speedKnots": 1.8 },
                { "id": 1, "timestamp": "2025-05-08T10:07:00", "latitude": 55.6747, "longitude": 12.5717, "speedKnots": 1.8 }
            ],
            displayedLocations: [],
            userLocationMarker: null,
            fetchInterval: null,
            maxLocations: 10 // Maximum number of locations to display
        };
    },
    mounted() {
        this.map = L.map('map').setView([55.676098, 12.568337], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Sort locations by timestamp (newest first)
        this.locations = this.locations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Display the first location immediately
        this.addNextLocation();
        
        // Start the interval to add one location every 30 seconds
        this.startProgressiveDisplay();
        
        this.getUserLocation();
    },
    methods: {
        
        startProgressiveDisplay() {
            // Clear any existing interval
            if (this.fetchInterval) {
                clearInterval(this.fetchInterval);
            }
            
            // Add a new location every 30 seconds
            this.fetchInterval = setInterval(() => {
                this.addNextLocation();
            }, 30000);
        },
        
        addNextLocation() {
            // If we already have the maximum number of locations displayed, do nothing
            if (this.displayedLocations.length >= this.maxLocations) {
                return;
            }
            
            // Get the next location to display
            const nextIndex = this.displayedLocations.length;
            if (nextIndex < this.locations.length) {
                const nextLocation = this.locations[nextIndex];
                this.displayedLocations.push(nextLocation);
                
                // Add marker for this location
                this.addMarkerForLocation(nextLocation, nextIndex);
                
                // Update the displayed locations table
                this.updateTable();
                
                // If this is the first location, center the map on it
                if (nextIndex === 0) {
                    this.map.setView([nextLocation.latitude, nextLocation.longitude], 13);
                }
                
                // If we've reached the maximum, clear the interval
                if (this.displayedLocations.length >= this.maxLocations) {
                    clearInterval(this.fetchInterval);
                    console.log('Reached maximum number of locations. Stopping interval.');
                }
            }
        },
        
        addMarkerForLocation(loc, index) {
            // Calculate opacity based on position (newest = most opaque)
            const opacity = 0.7 - (index * 0.07);
            
            // Create the marker
            const marker = L.circleMarker([loc.latitude, loc.longitude], {
                radius: 6,
                color: index === 0 ? 'red' : 'gray', // newest = red, others = gray
                fillOpacity: index === 0 ? 0.7 : Math.max(opacity, 0.1) // minimum opacity of 0.1
            }).addTo(this.map);
            
            // Add to our markers array
            this.markers.push(marker);
        },
        
        updateTable() {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = '';

            this.displayedLocations.forEach((loc, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <th scope="row">${loc.id}</th>
                    <td>${new Date(loc.timestamp).toLocaleTimeString()}</td>
                    <td>${loc.latitude.toFixed(5)}</td>
                    <td>${loc.longitude.toFixed(5)}</td>
                    <td>${loc.speedKnots.toFixed(1)}</td>
                `;
                tbody.appendChild(row);
            });
        },

        getUserLocation() {
            if ('geolocation' in navigator) {
                console.log('Geolocation is available');
                // Request current position
                navigator.geolocation.getCurrentPosition(
                    this.geolocationSuccess,
                    this.geolocationError,
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            } else {
                console.log('Geolocation is not available for your browser');
            }
        },

        geolocationSuccess(position) {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            console.log(`User Location: Lat ${lat}, Lon ${lng}, Accuracy ${accuracy} meters`);

            // Remove previous user marker if it exists
            if (this.userLocationMarker) {
                this.map.removeLayer(this.userLocationMarker);
            }

            this.userLocationMarker = L.circleMarker([lat, lng], {
                radius: 13,
                color: '#007bff',
                fillColor: '#007bff',
                fillOpacity: 0.3,
                weight: 2
            }).addTo(this.map)
                .bindPopup(`Your Location`)
                .openPopup();
        },

        geolocationError(error) {
            let message = 'Error getting location: ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message += 'User denied the request for Geolocation.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Location information is unavailable.';
                    break;
                case error.TIMEOUT:
                    message += 'The request to get user location timed out.';
                    break;
                case error.UNKNOWN_ERROR:
                    message += 'An unknown error occurred.';
                    break;
            }
            console.error(message, error);
        }    
    }
}).mount('#app');