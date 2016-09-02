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

  return {
    closestStop
  };
}());
