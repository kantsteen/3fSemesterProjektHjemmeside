Vue.createApp({
    data() {
        return {
          
        };
    },
    mounted(){
        this.map = L.map('map').setView([55.676098, 12.568337], 13); // Coordinates for Copenhagen
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);    },
    methods: {
      
    }
}).mount('#app');

