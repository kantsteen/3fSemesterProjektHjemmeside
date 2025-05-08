Vue.createApp({
    data() {
        return {
            map: null,
            latestMarker: null,
            oldMarkers: [],
            locations: []
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
                const row = document.createElement('tr');
                row.innerHTML = `
                    <th scope="row">${loc.id}</th>
                    <td>${new Date(loc.timestamp).toLocaleTimeString()}</td>
                    <td>${loc.latitude.toFixed(5)}</td>
                    <td>${loc.longtitude.toFixed(5)}</td>
                    <td>${loc.speedKnots.toFixed(1)}</td>

                `;
                tbody.appendChild(row);
            });
        }
    }
}).mount('#app');