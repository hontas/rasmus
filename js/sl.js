var SL = (function() {
  const fetchOptions = {
    method: 'GET'
  }

  function closestStop(lat, long) {
    const url = `/api/sl/closestLocation?lat=${lat}&long=${long}`;
    return makeRequest(url)
      .then((json) => {
        if (json.LocationList.StopLocation) {
          console.log(json.LocationList.StopLocation.name, json.LocationList.StopLocation.id);
        } else {
          console.log('No nearby stop found in Stockholms Län');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function makeRequest(url) {
    return fetch(url, fetchOptions)
      .then((response) => response.json());
  }

  function realTimeInfo(siteId) {
    const key = 'a312919085a9447d839109b9a6880d20';
    const url = `http://api.sl.se/api2/realtimedeparturesV4.<FORMAT>?key=${key}&siteid=${siteId}&timewindow=30&format=json`;
    return makeRequest(url);
  }

  return {
    closestStop
  };
}());
