(function iife() {
  const getUrl = (url) => `${document.location.protocol}//api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
  const urlSthlm = "http://api.sr.se/api/rss/pod/10326";
  const urlGbg = "http://api.sr.se/api/rss/pod/18748";
  var lastPubDate;

  function success(data) {
    const item = data.items[0];

    if (lastPubDate === item.pubDate) return;
    lastPubDate = item.pubDate;

    console.log('Trafikmeddelanden hämtade', item);
    $('#trafiken h3').text(item.title);
    $('#audio').attr('src', item.link);
  }

  function pollForMessages() {
    console.log('fetching messages...');
    $.ajax({
      url: getUrl(urlSthlm),
      dataType: 'json',
      success
    });
  }

  pollForMessages();
  setInterval(pollForMessages, 1000 * 60 * 5); // check every five minutes
}());
