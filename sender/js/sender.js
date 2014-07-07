/*jshint jquery:true, undef:true, devel:true, indent:2, curly:true, strict:true, browser:true */
/*global chrome */

(function() {
  "use strict";

  var
  session,
  appId = "41F577EA",
  namespace = "urn:x-cast:at.diesocialisten.dev.wallcast",
  initInterval,

  initializeCastApi = function() {
    var
    sessionRequest = new chrome.cast.SessionRequest(appId),
    apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

    chrome.cast.initialize(apiConfig, function() {
      $(".connect-chromecast").removeClass("hidden");
    }, onError);
  },

  sessionListener = function(e) {
    session = e;
    session.addUpdateListener(sessionUpdateListener);
    session.addMessageListener(namespace, receiverMessage);
  },

  receiverListener = function(e) {

  },

  sessionUpdateListener = function(isAlive) {
    if (!isAlive) {
      session = null;
    }
  },

  receiverMessage = function(namespace, message) {

  },

  onError = function(message) {
    console.error(message);
  },

  applyFilter = function(filter) {
    if (session) {
      session.sendMessage(namespace, {
        filter: filter
      }, function() {}, onError);
    }
  };

  initInterval = setInterval(function() {
    if (chrome.cast && chrome.cast.isAvailable) {
      initializeCastApi();
      clearInterval(initInterval);
    }
  }, 500);

  $(".connect-chromecast").on("click", function() {
    chrome.cast.requestSession(function(e) {
      session = e;
    }, onError);

    return false;
  });

  $("[data-action='apply-filter']").on("click", function() {
    applyFilter($(this).data("filter"));

    return false;
  });
}());
