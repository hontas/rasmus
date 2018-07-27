window.fb = (function iife(firebase) {
  // Initialize Firebase
  const config = {
    apiKey: 'APIKEY',
    authDomain: 'resmus-5d6c4.firebaseapp.com',
    databaseURL: 'https://resmus-5d6c4.firebaseio.com',
    projectId: 'resmus-5d6c4',
    storageBucket: '',
    messagingSenderId: '1015684025262'
  };
  firebase.initializeApp(config);

  return {};
}(window.firebase));
