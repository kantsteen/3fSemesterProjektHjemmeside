const app = Vue.createApp({
    data() {
      return {
        gpsData: [],
        map: null,
        markerGroup: null,
        startTime: '',
        endTime: ''
      };
    },
    methods: {
      async fetchGPSData() {
        try {
          const response = await axios.get("https://restredning20250504122455.azurewebsites.net/api/GPS");
          this.gpsData = response.data;
          this.plotMarkers(this.gpsData);
        } catch (error) {
          console.error("Fejl ved hentning af GPS-data:", error);
        }
      },
      plotMarkers(data) {
        if (this.markerGroup) {
          this.map.removeLayer(this.markerGroup);
        }
  
        this.markerGroup = L.layerGroup();
  
        data.forEach(point => {
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
      async filterByTime() {
        if (!this.startTime || !this.endTime) {
          alert("Udfyld begge tidspunkter.");
          return;
        }
  
        const start = new Date(this.startTime);
        const end = new Date(this.endTime);
  
        const filtered = this.gpsData.filter(point => {
          const time = new Date(point.timestamp);
          return time >= start && time <= end;
        });
  
        if (filtered.length === 0) {
          alert("Ingen hændelser i det valgte tidsinterval.");
        }
  
        this.plotMarkers(filtered);
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
