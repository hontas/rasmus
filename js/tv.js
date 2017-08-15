var TV = (function() {
  const auth = '<LOGIN authenticationkey="2dfa6ea579bd45e3ac3810eb1a97adb6" />';
  const locations = {
    home: { lat: 59.30, long: 17.98 },
    centralStation: { lat: 59.330714, long: 18.057920 }
  };
  const stationMap = {};

  const api = {
    TrainStation({ lat, long } = {}, radius = 500) { // station close to
      return !lat ? '<FILTER />' : `
        <FILTER>
          <WITHIN name="Geometry.WGS84" shape="center" value="${long} ${lat}" radius="${radius}m" />
        </FILTER>
      `;
    },
    TrainMessage(station) { // message at station
      return `
        <FILTER>
          <EQ name="AffectedLocation" value="${station}" />
        </FILTER>
      `;
    },
    TrainAnnouncement(station) { // departures at station
      return `
        <FILTER>
          <AND>
            <EQ name="ActivityType" value="Avgang" />
            <EQ name="LocationSignature" value="${station}" />
            <GT name="AdvertisedTimeAtLocation" value="$dateadd(-00:15:00)" />
            <LT name="AdvertisedTimeAtLocation" value="$dateadd(05:00:00)" />
          </AND>
        </FILTER>
      `;
    }
  };

  function tvApiRequest(objectType, ...args) {
    return fetch('http://api.trafikinfo.trafikverket.se/v1.2/data.json', {
      body: `
        <REQUEST>
          ${auth}
          <QUERY objecttype="${objectType}" ${(objectType === 'TrainAnnouncement') ? 'orderby="AdvertisedTimeAtLocation"' : ''}>
            ${api[objectType](...args)}
          </QUERY>
        </REQUEST>
      `,
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/xml'
      }
    })
      .then((resp) => {
        const jsonPromise = resp.json().then((json) => json.RESPONSE.RESULT);
        if (resp.ok) return jsonPromise;
        return jsonPromise.then((err) => Promise.reject(err));
      })
      .then((json) => json[0][objectType])
      .catch((err) => console.error(err));
  }

  function logMiddleware(resp) {
    console.log(resp || 'No results');
    return resp;
  }

  tvApiRequest('TrainStation')
    .then((stations) => stations.forEach((station) => {
      stationMap[station.LocationSignature] = station.AdvertisedLocationName;
    }));

  return {
    getClosestStops(lat, long) {
      return tvApiRequest('TrainStation', { lat, long }, 5000)
        .then((response) => response
          .slice(0, 5)
          .map((station) => Object.assign({}, station, {
            name: station.AdvertisedLocationName,
            id: station.LocationSignature,
            region: 'TV'
          }))
        )
    },
    getClosestStop(lat, long) {
      return getClosestStops(lat, long)
        .then((stops) => stops[0]);
    },
    getDeparturesFrom(station) {
      return tvApiRequest('TrainAnnouncement', station)
        .then((resp) => (resp || []).slice(0, 10))
        .then(logMiddleware)
        .then((deps) => deps.map((dep) => ({
          id: dep.LocationSignature,
          direction: TV.stationMap[dep.ToLocation[0].LocationName],
          name: `${dep.TypeOfTraffic} ${dep.TechnicalTrainIdent}`,
          time: dep.AdvertisedTimeAtLocation.substr(-8, 5),
          isLate: false,
          track: dep.TrackAtLocation
        })));
    },
    stationMap
  };
}());
