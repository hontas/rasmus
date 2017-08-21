window.RR = (function resrRobot() {
  const key = 'bfd0187f-cbbb-4ad3-b1d3-3cc12d180ea1';
  const baseUrl = 'https://api.resrobot.se/v2';

  function findStops(text) {
    if (text.length === 0) {
      return Promise.resolve([]);
    }

    return makeRequest(`${baseUrl}/location.name?input=${encodeURIComponent(text)}&format=json`)
      .then(stopLocationMiddleware);
  }

  function getClosestStop(loc) {
    return getClosestStops(loc)
      .then((stops) => stops[0]);
  }

  function getClosestStops({ lat, long }) {
    return makeRequest(`${baseUrl}/location.nearbystops?originCoordLat=${lat}&originCoordLong=${long}&format=json`)
      .then(stopLocationMiddleware);
  }

  function getTripSuggestion(from, to) {
    const getStop = (stop) => ({
      name: stop.name.replace(/ \([^)]*\)/, ''), // remove stuff in parentheses
      time: (stop.rtTime || stop.time).substr(0, 5), // only keep hours and minutes
      track: (stop.track ? `läge ${stop.track}` : ''),
      realTime: !!stop.rtTime,
    });

    const catCodes = {
      1: 'SnabbTåg', // ”Express”, 'Arlanda Express'
      2: 'Regional', // 'InterCity',
      3: 'Expressbuss', // ”Flygbussar”,
      4: 'Tåg', // ”PågaTåg”, ”Öresundståg”,
      5: 'Tunnelbana',
      6: 'Spårvagn',
      7: 'Buss',
      8: 'Färja', // ”Utrikes Färja”,
    };

    const readableTime = (str) => str
      .replace('PT', '')
      .replace('H', 'h')
      .replace('M', 'min');

    return makeRequest(`${baseUrl}/trip?&originId=${from}&destId=${to}&format=json`)
      .then(logMiddleware)
      .then((json) => json.Trip
        .map((trip) => trip.LegList.Leg
          .map(({ type, name, Product, Destination, Origin, duration }) => {
            const orig = getStop(Origin);
            const dest = getStop(Destination);
            return {
              type,
              name: (type === 'WALK' ? 'Gå' : name),
              from: orig,
              to: dest,
              text: (type === 'WALK' ?
                `${orig.time } Gå till ${dest.name} (${readableTime(duration)})` :
                `${orig.time } ${catCodes[Product.catCode]} ${Product.num} från ${orig.name} ${orig.track}`),
            };
          })))
      .then(logMiddleware);
  }

  function asArray(arg) {
    return Array.isArray(arg) ? arg : [].concat(arg);
  }

  function makeRequest(url) {
    return fetch(`${url}&key=${key}`)
      .then(fetchMiddleware);
  }

  function stopLocationMiddleware(json) {
    return asArray(json.StopLocation);
  }

  function logMiddleware(resp) {
    console.log(resp);
    return resp;
  }

  function fetchMiddleware(response) {
    if (response.ok) return response.json();
    return response.json().then((err) => Promise.reject(err));
  }

  return {
    findStops,
    getClosestStop,
    getClosestStops,
    getTripSuggestion,
  };
}());
