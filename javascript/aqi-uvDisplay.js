// Function to get weather based on city name
function getWeather() {
    const apiKey = '66e860199c0f6438c737b4997bf7ba6d';
    const city = document.getElementById('city').value.trim();

    if (!city) {
        alert('Please enter a city');
        return;
    }

    console.log('Fetching weather for city:', city); // Debug log

    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

    fetch(currentWeatherUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Current Weather API Response:', data); // Debug log
            displayWeather(data);

            // Fetch hourly forecast using Weatherbit.io
            const lat = data.coord.lat;
            const lon = data.coord.lon;
            getHourlyForecast(lat, lon);
        })
        .catch(error => {
            console.error('Error fetching current weather data:', error);
            alert('Error fetching current weather data. Please try again.');
        });

    updateFeelsLike(); // Ensure this function is called
}

// Function to get weather based on geolocation (current location)
function getWeatherByGeolocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const apiKey = '66e860199c0f6438c737b4997bf7ba6d';

            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

            fetch(currentWeatherUrl)
                .then(response => response.json())
                .then(data => {
                    displayWeather(data);

                    // Fetch hourly forecast using Weatherbit.io
                    getHourlyForecast(lat, lon);
                })
                .catch(error => {
                    console.error('Error fetching current weather data:', error);
                    alert('Error fetching current weather data. Please try again.');
                });
        }, function (error) {
            alert('Geolocation error: ' + error.message);
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }

    updateFeelsLikeByGeolocation(); // Added call to update "Feels Like" temperature using geolocation
}

// Function to fetch AQI and UV data using Weatherbit.io API
async function fetchAQIandUV(lat, lon) {
    const weatherbitApiKey = '11db04fedfef47a38aefad4afbc440c1';

    // Fetch AQI from Weatherbit.io API
    const aqiPromise = fetch(`https://api.weatherbit.io/v2.0/current/airquality?lat=${lat}&lon=${lon}&key=${weatherbitApiKey}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch AQI data');
            return response.json();
        })
        .then(data => {
            console.log('Weatherbit AQI API Response:', data); // Debug log
            return data.data[0]?.aqi ?? 'N/A'; // AQI value
        })
        .catch(error => {
            console.error('Error fetching AQI data:', error);
            return 'N/A'; // Return 'N/A' if an error occurs
        });

    // Fetch UV index from Weatherbit.io API
    const uvPromise = fetch(`https://api.weatherbit.io/v2.0/current?lat=${lat}&lon=${lon}&key=${weatherbitApiKey}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch UV Index data');
            return response.json();
        })
        .then(data => {
            console.log('Weatherbit UV API Response:', data); // Debug log
            return data.data[0]?.uv ?? 'N/A'; // UV index
        })
        .catch(error => {
            console.error('Error fetching UV Index data:', error);
            return 'N/A'; // Return 'N/A' if an error occurs
        });

    return Promise.all([aqiPromise, uvPromise])
        .then(([aqi, uv]) => ({ aqi, uv }))
        .catch(error => {
            console.error('Error fetching AQI and UV data:', error);
            return { aqi: 'N/A', uv: 'N/A' }; // Return 'N/A' for both if an error occurs
        });
}

// Function to fetch weather alerts using OpenWeather One Call API
async function fetchWeatherAlerts(lat, lon) {
    const apiKey = '66e860199c0f6438c737b4997bf7ba6d';
    const weatherAlertsUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    return fetch(weatherAlertsUrl)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch weather alerts');
            return response.json();
        })
        .then(data => data.alerts || []) // Return alerts array or an empty array if no alerts
        .catch(error => {
            console.error('Error fetching weather alerts:', error);
            return []; // Return an empty array if an error occurs
        });
}

// Function to calculate the time until the next event (sunrise or sunset)
function getTimeUntil(eventTime, currentTime) {
    const timeDifference = eventTime - currentTime; // Time difference in milliseconds
    const hours = Math.floor(timeDifference / (1000 * 60 * 60)); // Convert to hours
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)); // Convert to minutes
    return `${hours}h ${minutes}m`; // Return formatted time
}

// Function to determine the upcoming event (sunrise or sunset)
function getUpcomingEvent(sunriseTime, sunsetTime, currentTime) {
    if (currentTime < sunriseTime) {
        return {
            name: 'Sunrise',
            timeUntil: getTimeUntil(sunriseTime, currentTime)
        };
    } else if (currentTime < sunsetTime) {
        return {
            name: 'Sunset',
            timeUntil: getTimeUntil(sunsetTime, currentTime)
        };
    } else {
        const nextDaySunrise = new Date(sunriseTime);
        nextDaySunrise.setDate(nextDaySunrise.getDate() + 1);
        return {
            name: 'Sunrise (next day)',
            timeUntil: getTimeUntil(nextDaySunrise, currentTime)
        };
    }
}

// Function to toggle the visibility of the details section
function toggleDetails() {
    const details = document.getElementById('details-content');
    const button = document.getElementById('toggle-details-btn');

    // Toggle the visibility of the details section
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.textContent = 'Hide Details';
    } else {
        details.style.display = 'none';
        button.textContent = 'More Details';
    }

    // Ensure the city 
    //  box and other elements remain visible
    document.getElementById('city').style.display = 'block';
    document.getElementById('geo-location').style.display = 'inline-block';
    document.getElementById('settings-button').style.display = 'inline-block';
}

// Function to show the weather icon
function showImage() {
    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.style.display = 'block'; // Make the image visible once it's loaded
}

// Function to categorize AQI values
function getAQICategory(aqi) {
    if (aqi <= 50) return { category: 'Good', color: 'green' };
    if (aqi <= 100) return { category: 'Moderate', color: 'yellow' };
    if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: 'orange' };
    if (aqi <= 200) return { category: 'Unhealthy', color: 'red' };
    if (aqi <= 300) return { category: 'Very Unhealthy', color: 'purple' };
    if (aqi > 300) return { category: 'Hazardous', color: 'maroon' };
    return { category: 'N/A', color: 'gray' };
}

// Function to categorize UV index values
function getUVCategory(uv) {
    if (uv <= 2) return { category: 'Low', color: 'green' };
    if (uv <= 5) return { category: 'Moderate', color: 'yellow' };
    if (uv <= 7) return { category: 'High', color: 'orange' };
    if (uv <= 10) return { category: 'Very High', color: 'red' };
    if (uv > 10) return { category: 'Extreme', color: 'purple' };
    return { category: 'N/A', color: 'gray' };
}

// Updated displayWeather function to include AQI, UV index, and weather alerts
async function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div');
    const weatherInfoDiv = document.getElementById('weather-info');
    const weatherIcon = document.getElementById('weather-icon');
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    const detailsContent = document.getElementById('details-content'); // Defined variable
    const dateDiv = document.getElementById('date-div'); // Added for displaying the date

    // Clear previous content
    weatherInfoDiv.innerHTML = '';
    hourlyForecastDiv.innerHTML = '';
    tempDivInfo.innerHTML = '';
    detailsContent.innerHTML = ''; // Clear details content
    dateDiv.innerHTML = ''; // Clear previous date content

    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>${data.message}</p>`;
    } else {
        const cityName = data.name;
        const country = data.sys.country; // Country code (e.g., "US")
        let state = ''; // Initialize state as empty

        // Fetch state information if the country is the United States
        if (country === 'US') {
            const geocodingApiKey = '66e860199c0f6438c737b4997bf7ba6d';
            const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName},${country}&limit=1&appid=${geocodingApiKey}`;
            try {
                const geocodingResponse = await fetch(geocodingUrl);
                const geocodingData = await geocodingResponse.json();
                if (geocodingData.length > 0) {
                    state = geocodingData[0].state || ''; // Extract state if available
                }
            } catch (error) {
                console.error('Error fetching state information:', error);
            }
        }

        const location = state ? `${cityName}, ${state}, ${country}` : `${cityName}, ${country}`; // Format location

        const temperature = Math.round(data.main.temp);
        const description = data.weather[0].description;
        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

        // Display the current date
        const currentDate = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        dateDiv.innerHTML = `<p>${currentDate}</p>`;

        const temperatureHTML = `<p>${temperature}°F</p>`;
        const weatherHtml = `<p>${location}</p><p>${description}</p>`; // Include location in the display

        tempDivInfo.innerHTML = temperatureHTML;
        weatherInfoDiv.innerHTML = weatherHtml;

        // Set the weather icon URL
        weatherIcon.src = iconUrl;
        weatherIcon.alt = description;
        weatherIcon.style.display = 'block';

        const feelsLikeTemp = Math.round(data.main.feels_like);
        const showFeelsLike = localStorage.getItem('showFeelsLike') === 'true';
        if (showFeelsLike) {
            document.getElementById('feels-like').innerText = `Feels Like: ${feelsLikeTemp}°F`;
        } else {
            document.getElementById('feels-like').innerText = '';
        }

        const lat = data.coord.lat;
        const lon = data.coord.lon;

        const sunriseTime = new Date(data.sys.sunrise * 1000);
        const sunsetTime = new Date(data.sys.sunset * 1000);
        const currentTime = new Date();

        const sunrise = sunriseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const sunset = sunsetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const upcomingEvent = getUpcomingEvent(sunriseTime, sunsetTime, currentTime);

        // Add sunrise, sunset, and upcoming event details
        detailsContent.innerHTML += `
            <p>🌞 Sunrise: ${sunrise}</p>
            <p>🌙 Sunset: ${sunset}</p>
            <p>Upcoming: ${upcomingEvent.name}</p>
            <p>Time until next event: ${upcomingEvent.timeUntil}</p>
        `;

        // Fetch AQI, UV, and weather alerts if the toggle is enabled
        const showAQIUV = localStorage.getItem('enableAQI') === 'true';
        const showWeatherAlerts = localStorage.getItem('enableWeatherAlerts') === 'true';

        if (showAQIUV || showWeatherAlerts) {
            const [aqiUvData, weatherAlerts] = await Promise.all([
                showAQIUV ? fetchAQIandUV(lat, lon) : Promise.resolve({ aqi: 'N/A', uv: 'N/A' }),
                showWeatherAlerts ? fetchWeatherAlerts(lat, lon) : Promise.resolve([])
            ]);

            if (showAQIUV) {
                const aqiCategory = getAQICategory(aqiUvData.aqi);
                const uvCategory = getUVCategory(aqiUvData.uv);

                detailsContent.innerHTML += `
                    <p style="color: ${aqiCategory.color};">
                        🌫️ Air Quality Index (AQI): ${aqiUvData.aqi !== 'N/A' ? `${aqiUvData.aqi} (${aqiCategory.category})` : 'Data unavailable'}
                    </p>
                    <div class="color-bar" style="background: ${aqiCategory.color};"></div>
                `;
                if (aqiCategory.category === 'Unhealthy' || aqiCategory.category === 'Very Unhealthy' || aqiCategory.category === 'Hazardous') {
                    detailsContent.innerHTML += `
                        <p class="advisory-message">⚠️ Air quality is hazardous. Avoid outdoor activities.</p>
                    `;
                }

                detailsContent.innerHTML += `
                    <p style="color: ${uvCategory.color};">
                        ☀️ UV Index: ${aqiUvData.uv !== 'N/A' ? `${aqiUvData.uv} (${uvCategory.category})` : 'Data unavailable'}
                    </p>
                    <div class="color-bar" style="background: ${uvCategory.color};"></div>
                `;
                if (uvCategory.category === 'Very High' || uvCategory.category === 'Extreme') {
                    detailsContent.innerHTML += `
                        <p class="advisory-message">⚠️ UV levels are dangerous. Wear sunscreen and limit sun exposure.</p>
                    `;
                }
            }

            if (showWeatherAlerts && weatherAlerts.length > 0) {
                detailsContent.innerHTML += `<h3>Weather Alerts:</h3>`;
                weatherAlerts.forEach(alert => {
                    detailsContent.innerHTML += `
                        <div class="alert">
                            <h4>${alert.event}</h4>
                            <p><strong>Start:</strong> ${new Date(alert.start * 1000).toLocaleString()}</p>
                            <p><strong>End:</strong> ${new Date(alert.end * 1000).toLocaleString()}</p>
                            <p><strong>Description:</strong> ${alert.description}</p>
                        </div>
                    `;
                });
            } else if (showWeatherAlerts) {
                detailsContent.innerHTML += `<p>No weather alerts for ${cityName}.</p>`;
            }
        }

        const detailsButton = document.getElementById('toggle-details-btn');
        detailsButton.style.display = 'inline-block';
        document.getElementById('details-content').style.display = 'none';
        detailsButton.textContent = 'More Details';

        showImage();
    }
}

// Function to fetch hourly forecast using OpenWeatherMap free forecast API
function getHourlyForecast(lat, lon) {
    const apiKey = '66e860199c0f6438c737b4997bf7ba6d';
    const hourlyForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial&cnt=8`;

    fetch(hourlyForecastUrl)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch hourly forecast data');
            return response.json();
        })
        .then(data => {
            displayHourlyForecast(data.list);
        })
        .catch(error => {
            console.error('Error fetching hourly forecast data:', error);
        });
}

// Function to display hourly forecast
function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';

    hourlyData.forEach(item => {
        const dateTime = new Date(item.dt * 1000);
        const localTime = dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        const temperature = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const hourlyItemHtml = `
            <div class="hourly-item">
                <span>${localTime}</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°F</span>
            </div>
        `;

        hourlyForecastDiv.innerHTML += hourlyItemHtml;
    });
}

// Converts Fahrenheit to Celsius
function convertFahrenheitToCelsius(fahrenheit) {
    return (fahrenheit - 32) * 5 / 9;
}
  
// Converts Celsius to Fahrenheit
function convertCelsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}
  
// Example conversion for wind speed (km/h <-> mph)
function convertMphToKmh(mph) {
    return mph / 0.621371;
}
  
function convertKmhToMph(kmh) {
    return kmh * 0.621371;
}