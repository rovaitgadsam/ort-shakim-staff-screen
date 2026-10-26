export function createWeatherLoader({ getCity, escapeHtml }) {
const weatherCodes={
  0:['בהיר','☀️'],1:['בהיר ברובו','🌤️'],2:['מעונן חלקית','⛅'],3:['מעונן','☁️'],
  45:['ערפל','🌫️'],48:['ערפל','🌫️'],51:['טפטוף קל','🌦️'],53:['טפטוף','🌦️'],55:['טפטוף חזק','🌧️'],
  56:['טפטוף קופא קל','🌧️'],57:['טפטוף קופא','🌧️'],61:['גשם קל','🌦️'],63:['גשם','🌧️'],65:['גשם חזק','🌧️'],
  66:['גשם קופא קל','🌧️'],67:['גשם קופא','🌧️'],71:['שלג קל','🌨️'],73:['שלג','🌨️'],75:['שלג כבד','❄️'],
  77:['פתיתי שלג','🌨️'],80:['ממטרים','🌦️'],81:['ממטרים','🌧️'],82:['ממטרים חזקים','⛈️'],
  85:['ממטרי שלג','🌨️'],86:['ממטרי שלג חזקים','🌨️'],95:['סופת רעמים','⛈️'],96:['סופת רעמים וברד','⛈️'],99:['סופת רעמים וברד חזק','⛈️']
};

// For the school's default city, use fixed coordinates so weather does not depend
// on the geocoding service matching Hebrew place names.
const knownWeatherLocations = {
  'נהריה': {name:'נהריה', latitude:33.005, longitude:35.094},
  'nahariya': {name:'נהריה', latitude:33.005, longitude:35.094},
  'naharia': {name:'נהריה', latitude:33.005, longitude:35.094},
  'חיפה': {name:'חיפה', latitude:32.794, longitude:34.989},
  'haifa': {name:'Haifa', latitude:32.794, longitude:34.989},
  'עכו': {name:'עכו', latitude:32.927, longitude:35.082},
  'acre': {name:'Acre', latitude:32.927, longitude:35.082},
  'ירושלים': {name:'ירושלים', latitude:31.769, longitude:35.216},
  'jerusalem': {name:'Jerusalem', latitude:31.769, longitude:35.216},
  'תל אביב': {name:'תל אביב', latitude:32.085, longitude:34.782},
  'תל אביב-יפו': {name:'תל אביב-יפו', latitude:32.085, longitude:34.782},
  'tel aviv': {name:'Tel Aviv', latitude:32.085, longitude:34.782},
  'באר שבע': {name:'באר שבע', latitude:31.252, longitude:34.791},
  'beer sheva': {name:'Beer Sheva', latitude:31.252, longitude:34.791},
  'אילת': {name:'אילת', latitude:29.558, longitude:34.952},
  'eilat': {name:'Eilat', latitude:29.558, longitude:34.952},
  'טבריה': {name:'טבריה', latitude:32.792, longitude:35.531},
  'tiberias': {name:'Tiberias', latitude:32.792, longitude:35.531},
  'נתניה': {name:'נתניה', latitude:32.321, longitude:34.853},
  'netanya': {name:'Netanya', latitude:32.321, longitude:34.853},
  'כרמיאל': {name:'כרמיאל', latitude:32.919, longitude:35.296},
  'karmiel': {name:'Karmiel', latitude:32.919, longitude:35.296},
  'צפת': {name:'צפת', latitude:32.965, longitude:35.498},
  'safed': {name:'Safed', latitude:32.965, longitude:35.498},
  'אשדוד': {name:'אשדוד', latitude:31.804, longitude:34.655},
  'ashdod': {name:'Ashdod', latitude:31.804, longitude:34.655}
};

async function locateWeatherCity(city) {
  const key = city.trim().toLocaleLowerCase('he');
  if (knownWeatherLocations[key]) return knownWeatherLocations[key];

  // Try Israel first, then a global match. Open-Meteo supports searching location
  // names in different languages; "language" controls returned labels, not search.
  const query = encodeURIComponent(city.trim());
  const urls = [
    `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&format=json&countryCode=IL`,
    `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&format=json`
  ];
  let lastError = null;
  for (const url of urls) {
    try {
      const response = await fetch(url, {cache:'no-store'});
      if (!response.ok) throw new Error('Geocoding HTTP ' + response.status);
      const data = await response.json();
      if (data.error) throw new Error(data.reason || 'Geocoding error');
      if (Array.isArray(data.results) && data.results.length) {
        const result = data.results.find(item => item.country_code === 'IL') || data.results[0];
        return {name: result.name || city, latitude: result.latitude, longitude: result.longitude};
      }
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('לא נמצאה עיר בשם הזה');
}

async function loadWeather() {
  const city = (getCity() || 'נהריה').trim() || 'נהריה';
  const tempNode = document.getElementById('temp');
  const detailNode = document.getElementById('weatherDetail');
  const iconNode = document.getElementById('weatherIcon');
  const footNode = document.getElementById('weatherFoot');
  try {
    const location = await locateWeatherCity(city);
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'Asia/Jerusalem'
    });
    const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params.toString(), {cache:'no-store'});
    if (!response.ok) throw new Error('Weather HTTP ' + response.status);
    const data = await response.json();
    if (data.error) throw new Error(data.reason || 'Weather API error');
    const current = data.current;
    if (!current || !Number.isFinite(Number(current.temperature_2m))) {
      throw new Error('נתוני מזג האוויר חסרים בתשובת השירות');
    }
    const weather = weatherCodes[current.weather_code] || ['תנאי מזג אוויר משתנים','🌤️'];
    tempNode.textContent = Math.round(Number(current.temperature_2m)) + '°';
    detailNode.innerHTML = escapeHtml(weather[0]) +
      '<br>מרגיש כמו ' + Math.round(Number(current.apparent_temperature)) + '°' +
      '<br>לחות ' + Math.round(Number(current.relative_humidity_2m)) + '% · רוח ' +
      Math.round(Number(current.wind_speed_10m)) + ' קמ״ש';
    iconNode.textContent = weather[1];
    footNode.textContent = 'תחזית ל' + location.name + ' · עדכון ' +
      new Date().toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'});
  } catch (error) {
    console.error('טעינת מזג האוויר נכשלה:', error);
    tempNode.textContent = '--°';
    detailNode.textContent = 'לא ניתן לטעון תחזית כרגע';
    iconNode.textContent = '🌤️';
    footNode.textContent = 'בדקו חיבור לאינטרנט או את שם העיר במסך הניהול';
  }
}

  return loadWeather;
}
