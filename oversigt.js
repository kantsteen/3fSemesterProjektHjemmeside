const app = Vue.createApp({
    data() {
      return {
        gpsData: [],
        map: null,
        markerGroup: null,
        startTime: '',
        endTime: '',
        selectedPeriod: '',
      };
    },
    methods: {
      async fetchGPSData() {
        try {
          const response = await axios.get("https://restredning20250504122455.azurewebsites.net/api/GPSNew");
          this.gpsData = response.data;
          this.plotMarkers(this.gpsData, false);
        } catch (error) {
          console.error("Fejl ved hentning af GPS-data:", error);
        }
      },
      plotMarkers(data, zoomToMarkers = true) {
        if (this.markerGroup) {
          this.map.removeLayer(this.markerGroup);
        }
  
        this.markerGroup = L.featureGroup();
  
        data.forEach(point => {
          const marker = L.marker([point.latitude, point.longitude])
            .bindPopup(`
              <strong>Tidspunkt:</strong> ${new Date(point.timestamp).toLocaleString('da-DK', { timeZone: 'Europe/samara' })}<br>
              <strong>Fart:</strong> ${point.speedKnots} knob
            `);
          this.markerGroup.addLayer(marker);
        });
  
        this.markerGroup.addTo(this.map);
  
        if (zoomToMarkers) {
        const bounds = this.markerGroup.getBounds();
        if (bounds.isValid()) {
          this.map.fitBounds(bounds);
        }
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
  
        this.plotMarkers(filtered, true);
      },
      filterByPeriod() {
        if (!this.selectedPeriod) return;
      
        const now = new Date();
        let fromDate;
      
        switch (this.selectedPeriod) {
          case 'day':
            fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case 'week':
            fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            fromDate = new Date();
            fromDate.setMonth(now.getMonth() - 1);
            break;
          case 'year':
            fromDate = new Date();
            fromDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            return;
        }
      
        const filtered = this.gpsData.filter(point => {
          const time = new Date(point.timestamp);
          return time >= fromDate && time <= now;
        });
      
        if (filtered.length === 0) {
          alert("Ingen hændelser fundet for valgt periode.");
        }
      
        this.plotMarkers(filtered);
      },
      
      initializeMap() {
        this.map = L.map("map");
  
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(this.map);
  
        const denmarkBounds = L.latLngBounds(
          [54.4, 5.8],    
          [58.0, 17.1] 
        );
        this.map.fitBounds(denmarkBounds);
      }
    },
    mounted() {
      this.initializeMap();
      this.fetchGPSData();
    }
  });
  
const appInstance = app.mount("#app");
window.vueApp = appInstance; // ✅ NOW vueApp is correctly exposed