const app = Vue.createApp({
    data() {
        return {
            gpsData: [],
            map: null,
            markerGroup: null
        };
    },
    methods: {
        async fetchGPSData() {
            try {
                const response = await axios.get("https://restredning20250504122455.azurewebsites.net/api/GPS");
                this.gpsData = response.data;
                this.plotMarkers();
            } catch (error) {
                console.error("Fejl ved hentning af GPS-data:", error);
            }
        },
        plotMarkers() {
            if (this.markerGroup) {
                this.map.removeLayer(this.markerGroup);
            }

            this.markerGroup = L.layerGroup();

            this.gpsData.forEach(point => {
                const marker = L.marker([point.latitude, point.longitude])
                    .bindPopup(`
                        <strong>Tidspunkt:</strong> ${new Date(point.timestamp).toLocaleString()}<br>
                        <strong>Fart:</strong> ${point.speedKnots} knob
                    `);
                this.markerGroup.addLayer(marker);
            });

            this.markerGroup.addTo(this.map);

            const bounds = this.markerGroup.getBounds();
            if (bounds.isValid()) {
                this.map.fitBounds(bounds);
            }
        },
        initializeMap() {
            this.map = L.map("map").setView([56.0, 11.5], 7);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.map);
        }
    },
    mounted() {
        this.initializeMap();
        this.fetchGPSData();
    }
});

app.mount("#app");
