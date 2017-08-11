var SL = (function() {
  const baseUrl = 'http://api.sl.se/api2';
  const fetchOptions = {
    method: 'GET'
  }

  function getClosestStop(lat, long) {
    const key = 'bf8e1f49392843a19e86ef1ccbaa15a0';
    const url = `nearbystops.json?key=${key}&originCoordLat=${lat}&originCoordLong=${long}&maxresults=1`;
    return makeRequest(url)
      .then((json) => {
        const stop = json.LocationList.StopLocation;
        return Object.assign({}, stop, {
          HafasId: stop.id,
          id: stop.id.substr(-4),
          region: 'SL'
        });
      });
  }

  function findStops(term) {
    const key = '76ea4bd8c1014b6490418de04bfd0b32';
    const url = `typeahead.json?key=${key}&searchstring=${encodeURIComponent(term)}&maxresults=5`;
    return makeRequest(url)
      .then((json) => asArray(json.ResponseData))
      .then((stops) => stops.slice(0, 5).map((stop) => Object.assign({}, stop, {
        name: stop.Name,
        id: stop.SiteId,
        region: 'SL'
      })));
  }

  const vehicules = {
    BUS: 'Buss',
    METRO: 'T-bana',
    SHIP: 'Båt',
    TRAIN: 'Tåg',
    TRAM: 'Spårvagn'
  };
  function vehicule(key) {
    return vehicules[key] || key;
  }

  function getDeparturesFrom(siteId) {
    console.log('siteId', siteId);
    const key = 'a312919085a9447d839109b9a6880d20';
    const url = `realtimedeparturesV4.json?key=${key}&siteid=${siteId}&timewindow=30`;
    return makeRequest(url)
      .then((json) => [
        ...json.ResponseData.Buses,
        ...json.ResponseData.Metros,
        ...json.ResponseData.Ships,
        ...json.ResponseData.Trains,
        ...json.ResponseData.Trams
      ].map((trip) => Object.assign({}, trip, {
        direction: trip.Destination,
        time: trip.DisplayTime,
        name: `${vehicule(trip.TransportMode)} ${trip.LineNumber}`,
        track: trip.StopPointDesignation,
        region: 'SL',
        href: '#',
        isLate: trip.TimeTabledDateTime !== trip.ExpectedDateTime
      })));
  }

  function fetchMiddleware(response) {
    if (response.ok && response.status !== 204) {
      return response.json();
    }

    if (!response.ok) {
      return response.json()
        .then((err) => Promise.reject(err));
    }

    console.log('fetchMiddleware: not json and no error');
    return response;
  }

  function asArray(arg) {
    return arg && [].concat(arg) || [];
  }

  function makeRequest(path) {
    const url = `${baseUrl}/${path}`;
    const requestUrl = `https://request-proxy.herokuapp.com/?url=${encodeURIComponent(url)}`
    return fetch(requestUrl, fetchOptions)
      .then(fetchMiddleware)
      .catch((err) => console.error(err));
  }

  return {
    getClosestStop,
    getDeparturesFrom,
    findStops
  };
}());
