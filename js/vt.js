// Västtrafik api

var VT = (function() {

  const baseUrl = "https://api.vasttrafik.se/bin/rest.exe/v2";
  let authToken;
  let expDate;

  function getTripSuggestion(from, dest) {
    const date = moment().format("YYYY-MM-DD");
    const time = moment().format("HH:mm");
    const tripUrl = `${baseUrl}/trip?originId=${from}&destId=${dest}&date=${date}&time=${time}&format=json`;
    return anropaVasttrafik(tripUrl)
      .then((json) => asArray(json.TripList.Trip)
        .map((trip) => asArray(trip.Leg))
      );
  }

  function findStops(text) {
    const requestUrl = `${baseUrl}/location.name?input=${encodeURIComponent(text)}&format=json`;
    return anropaVasttrafik(requestUrl)
      .then((json) => asArray(json.LocationList.StopLocation).slice(0, 5))
      .then((stops) => stops.map((stop) => Object.assign({}, stop, {
        region: 'VT'
      })));
  }

  function getDeparturesFrom(id) {
    const requestUrl = `${baseUrl}/departureBoard?id=${encodeURIComponent(id)}&format=json`;
    return anropaVasttrafik(requestUrl)
      .then((res) => {
        const { error, errorText } = res;
        if (error || errorText) {
          console.log('Error:', error || errorText);
        }
        return res;
      })
      .then((json) => asArray(json.DepartureBoard.Departure))
      .then((trips) => trips.filter((item, pos) => {
        const similar = trips.find((trip) => (trip.name === item.name && trip.time === item.time))
        return !similar || trips.indexOf(similar) === pos;
      }))
      .then((trips) => {
        return trips.map((trip) => {
          const isLate = trip.rtTime && trip.rtTime !== trip.time;
          // const journeyDetail = await anropaVasttrafik(trip.JourneyDetailRef.ref);
          return Object.assign({}, trip, {
            name: trip.sname || trip.name,
            region: 'VT',
            isLate
          });
        });
      });
  }

  function anropaVasttrafik(url) {
    const accessTokenPromise = Promise.resolve();
    const headers = {
      Authorization: `Bearer ${authToken}`
    };

    if (!expDate || expDate.getTime() < Date.now()) {
      console.log('Need to update authtoken');
      accessTokenPromise.then(getAccessToken);
    }

    return accessTokenPromise
      .then(() => fetch(url, { headers }))
      .then(fetchMiddleware);
  }

  function getLeg(leg) {
    var text;

    if (Array.isArray(leg)) {
      text = leg.map(getOneLeg);
      text.push(getDestText(leg[leg.length - 1]));

      return text.join('<br>');
    } else {
      return `${getOneLeg(leg)} <br> ${getDestText(leg)}`;
    }
  }

  function getOneLeg(leg) {
    var track = leg.Origin.track ? `, läge ${leg.Origin.track}` : '';
    var realTime = leg.Origin.rtTime;
    var time = leg.Origin.time;
    var timeStr = (realTime && realTime !== time) ? `${time} (${realTime})` : `${time}`;
    return `${timeStr} ${leg.name} från ${leg.Origin.name}${track}`;
  }

  function getDestText(leg) {
    var track = leg.Destination.track ? `, läge ${leg.Destination.track}` : '';
    var realTime = leg.Destination.rtTime;
    var time = leg.Destination.time;
    var timeStr = (realTime && realTime !== time) ? `${time} (${realTime})` : `${time}`;
    return `${timeStr} ${leg.Destination.name}${track}`;
  }

  function getClosestStops({ lat, long }, limit = 5) {
    const url = `${baseUrl}/location.nearbystops?originCoordLat=${lat}&originCoordLong=${long}&maxNo=${limit}&format=json`;
    anropaVasttrafik(url)
      .then((json) => {
        if (json.LocationList.errorText) {
          throw new Error(json.LocationList.errorText);
        }

        const stop = json.LocationList.StopLocation;
        return Object.assign({}, stop, {
          region: 'VT'
        });
      });
  }

  function getAccessToken() {
    return fetch('https://api.vasttrafik.se:443/token', {
      headers: {
        Authorization: 'Basic V3NWQzVFOEFvYnBaRV9DOGRpX3FFZF9DU0dJYTpLT3FmY3o3cmpBNW1DeFQ5RkJtVEhnQ3N4R01h',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      body: 'grant_type=client_credentials'
    })
      .then(fetchMiddleware)
      .then((resp) => {
        authToken = resp.access_token;
        expDate = new Date(Date.now() + resp.expires_in * 1000);
        console.log(`AuthToken expires ${expDate.toLocaleString()}`);
        return resp.access_token;
      });
  }

  function fetchMiddleware(response) {
    if (response.ok) return response.json();
    return response.json().then((err) => Promise.reject(err));
  }

  function asArray(arg) {
    return arg && [].concat(arg) || [];
  }

  const authTokenPromise = getAccessToken();

  function init() {
    return authTokenPromise;
  }

  return {
    init,
    getClosestStop: (lat, long) => getClosestStops({ lat, long }, 1),
    getClosestStops,
    findStops,
    getTripSuggestion,
    getDeparturesFrom
  };

}());
