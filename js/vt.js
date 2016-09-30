// Västtrafik api

var VT = (function($) {

  const baseUrl = "https://api.vasttrafik.se/bin/rest.exe/v2";
  const ANTAL_STATIONS_FORSLAG = 3;
  let authToken;

  const stationInputWrapper = document.querySelectorAll(".stationInputWrapper");
  const $trips = $("#trips");
  const $resPlanForm = $("#resPlanForm");
  const $fran = $("#fran");
  const $till = $("#till");

  $resPlanForm.on("submit", function(evt) {
    evt.preventDefault();
    const from = $fran.prop("value");
    const dest = $till.prop("value");
    const date = moment().format("YYYY-MM-DD");
    const time = moment().format("HH:mm");

    const tripUrl = `${baseUrl}/trip?originId=${from}&destId=${dest}&date=${date}&time=${time}`;
    anropaVasttrafik(tripUrl)
      .then(visaReseForslag);
  });

  stationInputWrapper.forEach(function(wrapper) {
    const input = wrapper.querySelector('.label');
    const value = wrapper.querySelector('.value');
    const suggestions = wrapper.querySelector('.suggestions');

    input.addEventListener('input', (evt) => {
      evt.preventDefault();
      const text = evt.target.value;
      const requestUrl = `${baseUrl}/location.name?input=${encodeURIComponent(text)}`;
      anropaVasttrafik(requestUrl)
        .then((json) => {
          suggestions.innerHTML = visaStationsForslag(json);
          suggestions.classList.add("active");
        });
    }, false);

    suggestions.addEventListener('click', (evt) => {
      evt.preventDefault();
      input.value = evt.target.textContent;
      value.value = evt.target.dataset.id;
      suggestions.classList.remove("active");
    }, false);
  });

  function anropaVasttrafik(url) {
    const headers = {
      Authorization: `Bearer ${authToken}`
    };

    return new Promise((resolve, reject) => {
      $.ajax({
        dataType: "json",
        url: `${url}&format=json`,
        headers,
        success(json) {
          resolve(json);
        },
        error(err) {
          reject(err);
        }
      });
    });
  }

  function visaStationsForslag(json) {
    console.log(json);
    const stops = json.LocationList && json.LocationList.StopLocation;

    return Array.isArray(stops) ? stops
      .slice(0, ANTAL_STATIONS_FORSLAG)
      .map((loc) => `<li data-id="${loc.id}">${loc.name}</li>`)
      .join('\n') : '';
  }

  function getDetails(trips) {
    return Promise.all(trips.map(getDetail));
  }

  function getDetail(trip) {
    const ref = getTripRef(trip);
    return anropaVasttrafik(`${baseUrl}/journeyDetail?ref=${ref}`);
  }

  function getTripRef(trip) {
    return decodeURIComponent(trip.Leg.JourneyDetailRef.ref).split('?ref=')[1];
  }

  function visaReseForslag(json) {
    console.log(json);
    const trips = json.TripList.Trip;

    if (!Array.isArray(trips)) {
      $trips.html('');
      return;
    }

    renderToDOM(trips);
  }

  function renderToDOM(trips) {
    $trips.html('');
    const html = trips.map((trip) => {
      return getLeg(trip.Leg);
    }).map((resa) => {
      return `<li>${resa}</li>`;
    }).join('<br>');

    $trips.html(html);
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
    return new Promise((resolve, reject) => {
      $.ajax('https://api.vasttrafik.se:443/token', {
        headers: {
          Authorization: 'Basic V3NWQzVFOEFvYnBaRV9DOGRpX3FFZF9DU0dJYTpLT3FmY3o3cmpBNW1DeFQ5RkJtVEhnQ3N4R01h'
        },
        method: 'POST',
        data: {
          grant_type: 'client_credentials'
        },
        success(resp) {
          authToken = resp.access_token;
          console.log(authToken);
          const expDate = new Date(Date.now() + resp.expires_in * 1000);
          console.log(`AuthToken expires ${expDate.toLocaleString()}`);
          resolve();
        },
        error(err) {
          reject(err);
        }
      });
    });
  }

  return {
    getAccessToken,
    getClosestStop
  };

}(jQuery));
