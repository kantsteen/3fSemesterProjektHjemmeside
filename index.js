Vue.createApp({
    data() {
        return {
            map: null,
            latestMarker: null,
            oldMarkers: [],
            locations: [],
            userLocationMarker: null
        };
    },
    mounted() {
        this.map = L.map('map').setView([55.676098, 12.568337], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        this.fetchLocations();
        setInterval(this.fetchLocations, 30000); // Opdaterer hvert 30. sekund, kunde valgt

        this.getUserLocation();
    },
    methods: {
        async fetchLocations() {
            try {
                const response = await fetch('https://restredning20250504122455.azurewebsites.net/api/GPS'); // Rettes til vores rigtige endpoint
                const data = await response.json();
                this.locations = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sorter efter timestamp

                // Fjern gamle markører
                this.oldMarkers.forEach(marker => this.map.removeLayer(marker));
                this.oldMarkers = [];

                const limitedData = this.locations.slice(0, 10); // Begræns til de seneste 10 lokationer, kunde valgt

                limitedData.forEach((loc, index) => {
                    const opacity = 0.7 - (index * 0.07); // Ændrer opacitet for ældre markører
                    const marker = L.circleMarker([loc.latitude, loc.longitude], {
                        radius: 6,
                        color: index === 0 ? 'red' : 'gray', // nyeste = rød, andre = grå
                        fillOpacity: 0.7 === 0 ? 0.7 : Math.max(opacity, 0.1) // mindst 0.1
                    }).addTo(this.map);

                    if (index > 0) this.oldMarkers.push(marker);
                    else {
                        this.latestMarker = marker;
                        this.map.setView([loc.latitude, loc.longitude], 13);
                    }
                });

                this.updateTable();
            } catch (error) {
                console.error('Fejl ved hentning af lokationer:', error);
            }
        },
        updateTable() {
            const tbody = document.querySelector('tbody');
            tbody.innerHTML = '';

            const limitedLocations = this.locations.slice(0, 10); // Begræns til de seneste 10 lokationer, kunde valgt

            limitedLocations.forEach((loc, index) => {
<<<<<<< HEAD
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
        }
=======
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
>>>>>>> 1061e393a945f1ab3ccfdabb224cda51fa8530bd
    }
}).mount('#app');