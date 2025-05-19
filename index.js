Vue.createApp({
    data() {
        return {
            map: null,
            latestMarker: null,
            oldMarkers: [],
            locations: [],
            userLocationMarker: null,
            buffer: [],
            fetchIntervalId: null,
            displayIntervalId: null,
            selectedMarker: null,
            id: null
        };
    },
    mounted() {
        this.map = L.map('map').setView([55.676098, 12.568337], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Fetch newest location every 5 seconds
        this.fetchIntervalId = setInterval(this.bufferFetchLocation, 5000);

        // Display newest fetched location every 30 seconds
        this.displayIntervalId = setInterval(this.displayLatestBufferedLocation, 1000)

        this.getUserLocation();
    },
    beforeUnmount() {
        clearInterval(this.fetchIntervalId);
        clearInterval(this.displayIntervalId);
    },
    methods: {
        async bufferFetchLocation() {
            try {
                const response = await fetch('https://restredning20250504122455.azurewebsites.net/api/GPSNew'); // Rettes til vores rigtige endpoint
                const data = await response.json();

                const latest = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                if (latest) {
                    
                latest.id = `${latest.timestamp}`;
                    
                this.buffer.push(latest)
                }
            } catch (error) {
                console.error('Fejl ved hentning af lokationer:', error);
            }
        },
        displayLatestBufferedLocation() {
            if (this.buffer.length === 0) return;
            const latest = this.buffer[this.buffer.length - 1];

            this.locations.unshift(latest);
            this.locations = this.locations.slice(0, 10);
            this.buffer = [];
            this.updateMarkers();
            this.updateTable();
        },
        updateMarkers() {
            // Remove old markers
            this.oldMarkers.forEach(marker => this.map.removeLayer(marker));
            if (this.latestMarker) this.map.removeLayer(this.latestMarker);
            this.oldMarkers = [];

            this.locations.forEach((loc, index) => {
                const marker = L.circleMarker([loc.latitude, loc.longitude], {
                    radius: 6,
                    color: index === 0 ? 'red' : 'gray',
                    fillOpacity: index === 0 ? 0.7 : 0.4
                }).addTo(this.map).bindPopup(`Id: ${loc.id}<br>Time: ${new Date(loc.timestamp).toLocaleTimeString()}`)
                .on('click', () => {
                    this.markerId = loc.id;
                    this.updateTable();
                });

                if (index === 0) {
                    this.latestMarker = marker;
                    this.map.setView([loc.latitude, loc.longitude], 17);
                } else {
                    this.oldMarkers.push(marker);
                }
            });

        },

        updateTable() {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = '';
            this.locations.forEach((loc, index) => {
                const row = document.createElement('tr');
                if (loc.id === this.markerId) {
                    row.classList.add('table-primary');
                }
                loc.id = this.markerId;
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

            console.log('User Location: Lat ${lat}, Lon ${lng}, Accuracy ${accuracy} meters')

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
}
).mount('#app');