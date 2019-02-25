const Table = (function() {
    // Fetch data from API
    function updateDataArray() {
        fetch(this.api_url).then(response => response.json()).then(data => {
            this.dataArray = extractFlights(data);
            sortDataArray();
            updateUI();
        });
    }

    // Extract flights
    function extractFlights(data) {
        dataCopy = {...data};
        delete dataCopy.full_count;
        delete dataCopy.version;
        return Object.values(dataCopy);
    }

    // Sort data array
    function sortDataArray() {
        const airport_latitude = this.airport_coords.latitude;
        const airport_longitude = this.airport_coords.longitude; 
        this.dataArray.sort((a, b) => {
            return getDistance(a[1], a[2], airport_latitude, airport_longitude) > getDistance(b[1], b[2], airport_latitude, airport_longitude) ? 1 : -1;
        });
    }

    // Calculate distance
    function getDistance(lat1, lon1, lat2, lon2) {
        const p = 0.017453292519943295;    // Math.PI / 180
        const c = Math.cos;
        const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
        return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
    }    

    // Render table data
    function updateUI() {
        const rootName = this.rootName;
        const tableBody = document.querySelector(`.${rootName}__body`);
        tableBody.innerHTML = this.dataArray.map(flight => `
            <tr class="${rootName}__row">
                <td class="${rootName}__data">${flight[1]}, ${flight[2]}</td>
                <td class="${rootName}__data">${flight[5]}</td>
                <td class="${rootName}__data">${flight[3]}</td>
                <td class="${rootName}__data">${flight[4]}</td>
                <td class="${rootName}__data">${flight[11]}-${flight[12]}</td>
                <td class="${rootName}__data">${flight[13]}</td>
            </tr>
        `).join('');
    }

    function getHeaderMarkup() {
        const rootName = this.rootName;
        return `
            <thead class="${rootName}__header-row">
                <th class="${rootName}__header-column">координаты самолета</th>
                <th class="${rootName}__header-column">скорость в км/ч</th>
                <th class="${rootName}__header-column">курс в градусах</th>
                <th class="${rootName}__header-column">высота полета самолета в метрах</th>
                <th class="${rootName}__header-column">коды аэропортов вылета и назначения</th>
                <th class="${rootName}__header-column">номер рейса</th>
            </thead>        
        `;
    }

    function initUI(parentElement) {
        const table = document.createElement('table');
        table.className = this.rootName;
        table.innerHTML = `
            ${getHeaderMarkup()}
            <tbody class="${this.rootName}__body"></tbody>
        `;
        parentElement.appendChild(table);
    }
    
    return class {
        constructor({
            rootName = 'table',
            api_url = 'https://data-live.flightradar24.com/zones/fcgi/feed.js?bounds=56.84,55.27,33.48,41.48',
            airport_coords = {
                latitude: 55.410307,
                longitude: 37.902451
            },
            time_update_interval = 5000
        } = {}) {
            this.rootName = rootName;
            this.api_url = api_url;
            this.airport_coords = airport_coords;
            this.time_update_interval = time_update_interval;
            
            // Bind private methods to context
            updateDataArray = updateDataArray.bind(this);
            sortDataArray = sortDataArray.bind(this);
            getHeaderMarkup = getHeaderMarkup.bind(this);
            updateUI = updateUI.bind(this);
            initUI = initUI.bind(this);
        }

        render(parentElement) {
            initUI(parentElement);
            updateDataArray();
            setInterval(() => {
                updateDataArray();
            }, this.time_update_interval);        
        }
    }
})();