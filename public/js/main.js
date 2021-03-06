/**
 * Socket initialization
 * @type {Object}
 */
var socket = io();

/**
 * Mapping object with the HTML elements
 * @type {Object}
 */
var mapping = {
  wakeyButton: document.getElementById('wakey-button'),
  buttonOpenMessageEdition: document.getElementById('buttonOpenMessageEdition'),
  buttonAddColumn: document.getElementById('buttonAddColumn'),
  buttonOpenNotificationPanel: document.getElementById('buttonOpenNotificationPanel'),
  notificationsCounter: document.getElementById('notificationsCounter'),
  messageEditionPanel: document.getElementById('messageEditionPanel'),
  userProfilePanel: document.getElementById('userProfilePanel'),
  notificationPanel: document.getElementById('notificationPanel'),
  messageTextarea: document.getElementById('messageTextarea'),
  suggestionPanel: document.getElementById('suggestionPanel'),
  numberCharactersLeft: document.getElementById('numberCharactersLeft'),
  sendTweetButton: document.getElementById('sendTweetButton'),
  inputTag: document.getElementById('tagInput'),
  tagContainer: document.getElementById('tagContainer'),
  numberConnectedUsersSpan: document.getElementById('numberConnectedUsers'),
  koalaPlural: document.getElementById('koalaPlural'),
  columnsList: document.getElementById('tweets-columns-list')
};

/**
 * Dashboard main module
 * @param  {Object} socket        Web socket
 * @return {[type]}               [description]
 */
var dashboard = (function (socket){
  var mainSidebar = null;
  var messagesDisplay = null;

  var socket = socket;

  var init = function(mapping, callback){

    // Create the main components of the application
    messagesDisplay = new MessagesDisplay(mapping.columnsList);
    mainSidebar = new MainSidebar(
      mapping,
      messagesDisplay.createBlankColumn.bind(messagesDisplay)
    );
    notificationPanel = new NotificationPanel(mapping);

    // Add reload function to Wakey button
    mapping.wakeyButton.addEventListener('click', function() {
      document.location.reload();
    });

    // Generate the defaults columns
    mainSidebar.init();

    // Disable inline-flex-box as it contains no columns
    if(userId === undefined){
      mapping.columnsList.style.display = "block";
    }

    // Emit a message to connect to the server
    socket.on('connect', function () {
      if(userId != undefined){
        messagesDisplay.createUserColumn();
        socket.emit('auth', userId);
      }
    });

    // Check if browser version is recent enough
    try {
      var promise = new Promise(function(){
      });
    } catch (error) {
      var popup = document.getElementById('deprecatedBrowserPopup');
      popup.style.display = 'block';
    }
    callback();
  }

  var listen = function(){
    socket.on('columnsLayout', function(columnsLayout){
      if(columnsLayout != ""){
        messagesDisplay.storeColumnsLayout(columnsLayout);
        messagesDisplay.addAllColumns();
      }
    });

    socket.on('tweet', function(message){
      messagesDisplay.processIncoming(message);
    });

    socket.on('notification', function(notification){
      notificationPanel.processNotification(notification);
    });

    socket.on('notifications history', function(notifications){
      for (var i = 0; i < notifications.length; i++) {
        notificationPanel.processNotification(notifications[i], true);
      }
    });

    socket.on('lists-list', function(listsObject){
      messagesDisplay.storeTwitterLists(listsObject);
      messagesDisplay.updateColumnsTwitterLists();
    });

    socket.on('home-timeline', function(timeline){
      var messagesToDisplay = messagesDisplay.addAllMessages(
          timeline,
          'home'
        );
      if(messagesToDisplay != undefined){
        messagesDisplay.displayAllMessagesOnePerOne(messagesToDisplay);
      }
    });

    socket.on('delete tweet', function(message){
      messagesDisplay.deleteMessage(message);
    });

    socket.on('numberConnectedUsers', function(numberConnectedUsers){
      mainSidebar.updateNumberConnectedUsers(numberConnectedUsers);
    });

    socket.on('search-user', function(suggestions){
      mainSidebar.receiveUserSuggestion(suggestions);
    });

    socket.on('returnFollowedBy', function(followers){
      var userProfileFollowedBy = document.getElementById('userProfileFollowedBy');
      var keys = Object.keys(followers);
      userProfileFollowedBy.innerHTML = 'Followed by <a href="'+ followers[keys[0]].link +'">' + followers[keys[0]].name + '</a>';
      userProfileFollowedBy.innerHTML += ', <a href="'+ followers[keys[1]].link +'">' + followers[keys[1]].name + '</a>';
      userProfileFollowedBy.innerHTML += ' and <a href="'+ followers[keys[2]].link +'">' + followers[keys[2]].name +'</a>';
    });

    socket.on('disconnect', function(){
      console.log('Got disconnected');
      var ribbonOverlay = document.getElementById('ribbon-overlay');
      ribbonOverlay.style.display = 'block';
    })

    // Internal listeners
    document.addEventListener('prepareReply', function(reply){
      mainSidebar.openMessageEdition(true);
      mainSidebar.insertMessage('@' + reply.tweetRecipientUsername);
      mainSidebar.tweetRecipient.tweetRecipientUsername = reply.tweetRecipientUsername;
      mainSidebar.tweetRecipient.tweetRecipientId = reply.tweetRecipientId;
    });
    document.addEventListener('toggleNotificationPanel', function(force){
      notificationPanel.toggleNotificationPanel(force);
    });
  }

  return {
    init:init,
    listen:listen
  };

})(socket);

dashboard.init(mapping, function(){
  dashboard.listen();
});
