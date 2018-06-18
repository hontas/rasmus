/* globals gapi */
(function iife() {
  const CLIENT_ID = '499673240843-8f8bn77590948esm040d5cl5s4k32hkq.apps.googleusercontent.com';
  const API_KEY = 'AIzaSyAQVyCYvuXOxLcIMlT68G-ELLSxMVDqDGc';
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
  const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.metadata.readonly'
  ].join(' ');

  /**
   *  On load, called to load the auth2 library and API client library.
   */
  window.handleClientLoad = function handleClientLoad() {
    gapi.load('client:auth2', initClient);
  };

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  let googleInitPromise;
  function initClient() {
    googleInitPromise = gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => console.log('gapi initiated'));
  }

  window.getTheGoogleStuffs = function getTheGoogleStuffs() {
    googleInitPromise.then(() => {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  };

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      printFile();
    } else {
      gapi.auth2.getAuthInstance().signIn();
    }
  }

  /**
   * Print file
   */
  function printFile() {
    gapi.client.drive.files.export({
      fileId: '1TRE1P4EmB3kwlURit8lICniBtRp7aqnhcU8x7D6yzqI',
      mimeType: 'text/html'
    }).then((response) => {
      const content = response.body.match(/<body[^>]*>(.*)<\/body><\/html>$/)[1];
      const doc = document.getElementById('gdoc');
      doc.innerHTML = content;
    }).catch((e) => console.error(e));
  }
}());
