window.gMap = (function iife() {
  let map;
  const icons = {
    BOAT: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_ship.svg',
    BUS: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_bus.svg',
    TAXI: 'https://image.flaticon.com/icons/png/128/75/75780.png',
    TRAM: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_tram.svg',
    LDT: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_ic.svg', // long distance train
    REG: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_ic.svg', // regionaltåg
    VAS: 'https://rrp.vasttrafik.se/img/build/products/haf_prod_ice.svg' // västtågen
  };
  const icon = {
    scaledSize: new google.maps.Size(20, 20),
    labelOrigin: new google.maps.Point(10, -8),
    anchor: new google.maps.Point(10, 10)
  };

  const getIcon = (prodtype) => ({
    ...icon,
    url: icons[prodtype]
  });

  const toWGS84 = ({ lat, lng }) => ({
    lat: lat * 1000000,
    lng
  });
  const fromWGS84 = (lat, long) => ({
    lat: lat / 1000000,
    lng: long / 1000000
  });

  function initMap({ rootElement, position, zoom = 13 }) {
    map = new google.maps.Map(rootElement, {
      center: position,
      zoom
    });

    new google.maps.Marker({
      position,
      map,
      label: 'Du'
    });

    return map;
  }

  const createVehicleMarker = (vehicle) => {
    const { x, y, name, prodclass } = vehicle;
    const delay = parseInt(vehicle.delay, 10);
    const isDelayed = delay > 0;
    const delayedText = isDelayed ?
      `<p style="margin: .5em 0 0;">${delay} ${delay > 1 ? 'minuter' : 'minut'} försenad.</p>` :
      '';
    const infowindow = new google.maps.InfoWindow({
      content: `
        <div class="marker-info" style="background-color: ${vehicle.bcolor}; color: ${vehicle.lcolor}; padding: .5em;">
          <h3 style="margin: .2em 0;">${name}</h3>
          <small>(${vehicle.gid})</small>
          ${delayedText}
        </div>
      `
    });

    const marker = new google.maps.Marker({
      position: fromWGS84(y, x),
      map,
      title: vehicle.gid,
      icon: getIcon(prodclass)
    });

    marker.addListener('click', () => {
      if (infowindow.map) {
        infowindow.close();
      } else {
        infowindow.open(map, marker);
      }
    });

    return marker;
  };

  function updateVehicleMarkerPosition(marker, { y, x }) {
    marker.setPosition(fromWGS84(y, x));
  }

  return {
    initMap,
    getIcon,
    createVehicleMarker,
    updateVehicleMarkerPosition,
    toWGS84,
    fromWGS84,
  };
}())
