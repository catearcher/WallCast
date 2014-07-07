window.onload = function() {
  "use strict";

  var
  wallUrl = "https://beta.walls.io/api/posts.json",
  postTemplate = "<div data-id='#{id}>' class='#{type} post' data-type='#{type}'><strong>#{external_name}</strong> #{comment}<img src='#{post_image}'><small>#{type}</small></div>",
  wallParams = {
    access_token:"5f864451221b0e8d2ff61b3179ac1a3b5d4ac9e3",
    after: 0,
    limit: 5,
    types: "",
    fields: "id,comment,external_name,type,post_image"
  },

  setFilter = function(filter) {
    wallParams.types = filter;

    if (filter) {
      $("div[data-type='" + filter + "']").removeClass("hidden");
      $("div[data-type!='" + filter + "']").addClass("hidden");
    } else {
      wallParams.after = $("div").eq(0).data("id");
      $("div").removeClass("hidden");
    }

    fetchPosts({
      after: 0,
      types: filter
    });
  },

  fetchPosts = function(customParams) {
    var params = $.extend(wallParams, customParams);

    $.getJSON(wallUrl + "?" + $.param(params) + "&callback=?")
    .then(function(result) {
      var posts = result.data;

      if (posts.length) {
        wallParams.after = posts[0].id;
      }

      posts.reverse().forEach(function(post) {
        var postHtml = postTemplate;

        $.each(post, function(name, value) {
          postHtml = postHtml.replace(new RegExp("#{" + name + "}", "g"), value);
        });

        $("main").prepend(postHtml);
      });

      $(".post").slice(10).remove();
    });

    if (!customParams) {
      setTimeout(fetchPosts, 5000);
    }
  };


  cast.receiver.logger.setLevelValue(cast.receiver.LoggerLevel.DEBUG);
  window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
  console.log('Starting Receiver Manager');

  // handler for the 'ready' event
  castReceiverManager.onReady = function(event) {
    fetchPosts();

    console.log('Received Ready event: ' + JSON.stringify(event.data));
    window.castReceiverManager.setApplicationState("Application status is ready...");
  };

  castReceiverManager.onSenderDisconnected = function(event) {
    console.log('Received Sender Disconnected event: ' + event.data);
    if (window.castReceiverManager.getSenders().length === 0) {
      window.close();
    }
  };

  // create a CastMessageBus to handle messages for a custom namespace
  window.messageBus =
    window.castReceiverManager.getCastMessageBus(
        'urn:x-cast:at.diesocialisten.dev.wallcast');

  // handler for the CastMessageBus message event
  window.messageBus.onMessage = function(e) {
    console.log('Message [' + e.senderId + ']: ' + e.data);

    var data = JSON.parse(e.data);

    if (typeof data.filter !== "undefined") {
      setFilter(data.filter);
    }

    // inform all senders on the CastMessageBus of the incoming message event
    // sender message listener will be invoked
    window.messageBus.send(e.senderId, e.data);
  };

  // initialize the CastReceiverManager with an application status message
  window.castReceiverManager.start({statusText: "Application is starting"});
};
