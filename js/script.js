window.addEventListener('DOMContentLoaded', () => {
  const positionPromise = getPosition();

  VT.getAccessToken()
    .then(() => Promise.resolve(positionPromise))
    .then((position) => VT.getClosestStop(position.coords.latitude, position.coords.longitude));

  positionPromise
    .then((position) => SL.closestStop(position.coords.latitude, position.coords.longitude));
}, false);

function getPosition() {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject();

    navigator.geolocation.getCurrentPosition(resolve);
  });
}
