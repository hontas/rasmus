(function iife() {
  const getUrl = (url) => `${document.location.protocol}//api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
  const urlSthlm = "http://api.sr.se/api/rss/pod/10326";
  const urlGbg = "http://api.sr.se/api/rss/pod/18748";
  var lastPubDates = {};

  function render(data, selector) {
    const item = data.items[0];

    if (lastPubDates[selector] === item.pubDate) return;
    lastPubDates[selector] = item.pubDate;

    console.log('Trafikmeddelanden hämtade', item);
    $(`${selector} h3`).text(item.title);
    $(`${selector} audio`).attr('src', item.link);
  }

  function getJson(url, selector) {
    $.ajax({
      url: getUrl(url),
      dataType: 'json',
      success(data) {
        render(data, selector);
      }
    });
  }

  function pollForMessages() {
    console.log('fetching messages...');
    getJson(urlGbg, '.trafiken-gbg');
    getJson(urlSthlm, '.trafiken-sthlm');
  }

  pollForMessages();
  setInterval(pollForMessages, 1000 * 60 * 5); // check every five minutes
}());
