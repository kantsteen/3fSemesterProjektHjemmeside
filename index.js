Vue.createApp({
    data() {
        return {
            map: null,
            latestMarker: null,
            oldMarkers: [],
            shownLocations: [],
            lastTimestamp: null,
            userLocationMarker: null
        };
    },
    mounted() {
        this.map = L.map('map').setView([55.676098, 12.568337], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.fetchNextLocation(); // Fetch first location
        setInterval(this.fetchNextLocation, 3000); // Then fetch every 30 seconds

        this.getUserLocation();
    },
    methods: {
        async fetchNextLocation() {
            try {
                const response = await fetch(mockdata.json);
                const data = await response.json();
                if (!data || data.length === 0) return;

                // Get latest location by timestamp
                const latest = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

                // Skip if same as last shown
                if (this.lastTimestamp === latest.timestamp) return;
                this.lastTimestamp = latest.timestamp;

                // Add new location at the beginning
                this.shownLocations.unshift(latest);

                // Limit to 10 most recent
                if (this.shownLocations.length > 10) {
                    this.shownLocations.pop();
                }

                this.updateMap();
                this.updateTable();
            } catch (error) {
                console.error('Fejl ved hentning af GPS-data:', error);
            }
        },

        updateMap() {
            // Remove all existing markers
            this.oldMarkers.forEach(marker => this.map.removeLayer(marker));
            this.oldMarkers = [];

            this.shownLocations.forEach((loc, index) => {
                const opacity = 0.7 - index * 0.07;
                const marker = L.circleMarker([loc.latitude, loc.longitude], {
                    radius: 6,
                    color: index === 0 ? 'red' : 'gray',
                    fillOpacity: Math.max(opacity, 0.1)
                }).addTo(this.map);

                if (index === 0) {
                    this.latestMarker = marker;
                    this.map.setView([loc.latitude, loc.longitude], 13);
                } else {
                    this.oldMarkers.push(marker);
                }
            });
        },

        updateTable() {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = '';

            this.shownLocations.forEach(loc => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <th scope="row">${loc.id}</th>
                    <td>${new Date(loc.timestamp).toLocaleTimeString()}</td>
                    <td>${loc.latitude.toFixed(5)}</td>
                    <td>${loc.longitude.toFixed(5)}</td>
                    <td>${loc.speedKnots?.toFixed(1) ?? '-'}</td>
                `;
                tbody.appendChild(row);
            });
        },

        getUserLocation() {
            if ('geolocation' in navigator) {
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
                default:
                    message += 'An unknown error occurred.';
            }
            console.error(message);
        }
    }
}).mount('#app');