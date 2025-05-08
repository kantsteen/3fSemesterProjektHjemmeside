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
                const response = await fetch('mockdata.json'); // Rettes til vores rigtige endpoint
                const data = await response.json();
                this.locations = data.reverse(); // vis nyeste øverst

                // Fjern gamle markører, hvor mange er nødvendige?
                this.oldMarkers.forEach(marker => this.map.removeLayer(marker));
                this.oldMarkers = [];

                data.forEach((loc, index) => {
                    const marker = L.circleMarker([loc.latitude, loc.longitude], {
                        radius: 6,
                        color: index === 0 ? 'red' : 'gray', // nyeste = rød, andre = grå
                        fillOpacity: 0.7
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

            this.locations.forEach((loc, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <th scope="row">${loc.id}</th>
                    <td>${new Date(loc.timestamp).toLocaleTimeString()}</td>
                    <td>${loc.longitude.toFixed(5)}</td>
                    <td>${loc.latitude.toFixed(5)}</td>
                    <td>${loc.speed_knots.toFixed(1)}</td>

                `;
                tbody.appendChild(row);
            });
        }
    }
}).mount('#app');