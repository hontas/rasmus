// Västtrafik api

var VT = (function() {

  const baseUrl = "https://api.vasttrafik.se/bin/rest.exe/v2";
  let authToken;

  function getTripSuggestion(from, dest) {
    const date = moment().format("YYYY-MM-DD");
    const time = moment().format("HH:mm");
    const tripUrl = `${baseUrl}/trip?originId=${from}&destId=${dest}&date=${date}&time=${time}`;
    return anropaVasttrafik(tripUrl)
      .then((json) => asArray(json.TripList.Trip)
        .map((trip) => asArray(trip.Leg))
      );
  }

  function getLocationSuggestions(text) {
    const requestUrl = `${baseUrl}/location.name?input=${encodeURIComponent(text)}`;
    return anropaVasttrafik(requestUrl)
      .then((json) => asArray(json.LocationList.StopLocation));
  }

  function anropaVasttrafik(url) {
    const headers = {
      Authorization: `Bearer ${authToken}`
    };

    return fetch(`${url}&format=json`, {
      headers
    })
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

  function getClosestStop(lat, long) {
    const url = `${baseUrl}/location.nearbystops?originCoordLat=${lat}&originCoordLong=${long}&maxNo=1`;
    anropaVasttrafik(url)
      .then((json) => {
        if (json.LocationList.StopLocation) {
          console.log(json.LocationList.StopLocation);
          $fran.prop("value", json.LocationList.StopLocation.id);
          $fran.parent().find('.label').prop('value', json.LocationList.StopLocation.name);
        } else {
          console.log('No nearby stop found in Västra Götalandsregionen');
        }
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
        console.log(authToken);
        const expDate = new Date(Date.now() + resp.expires_in * 1000);
        console.log(`AuthToken expires ${expDate.toLocaleString()}`);
      });
  }

  function fetchMiddleware(response) {
    if (response.ok) return response.json();
    return response.json().then((err) => Promise.reject(err));
  }

  function asArray(arg) {
    return arg && [].concat(arg) || [];
  }

  return {
    getAccessToken,
    getClosestStop,
    getLocationSuggestions,
    getTripSuggestion
  };

}());
