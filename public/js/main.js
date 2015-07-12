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
	buttonOpenMessageEdition: document.getElementById('buttonOpenMessageEdition'),
	buttonAddColumn: document.getElementById('buttonAddColumn'),
	messageEditionPanel: document.getElementById('messageEditionPanel'),
	messageTextarea: document.getElementById('messageTextarea'),
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
	var statisticsSidebar = null;
	var messagesDisplay = null;

	var socket = socket;

	var init = function(mapping, callback){

		// Create the main components of the application
		messagesDisplay = new MessagesDisplay(mapping.columnsList);
		mainSidebar = new MainSidebar(mapping, messagesDisplay.createBlankColumn.bind(messagesDisplay));
		statisticsSidebar = new StatisticsSidebar();

		// Generate the defaults columns
		messagesDisplay.createUserColumn();
		// messagesDisplay.addColumn('tracking', 'Tracking');
		// messagesDisplay.displayColumns();

		mainSidebar.init();

		// Emit a message to connect to the server
		socket.on('connect', function () {
			if(userId != undefined){
				socket.emit('auth', userId);
				// console.log('Fires auth');
			}
		});

		callback();
	}

	var listen = function(){
		socket.on('columnsLayout', function(columnsLayout){
			// console.log('Got columnsLayout : ', columnsLayout);
			if(columnsLayout != ""){
				// console.log('Gonna process columnsLayout');
				messagesDisplay.storeColumnsLayout(columnsLayout);
				messagesDisplay.addAllColumns();
			}
		});

		socket.on('tweet', function(message){
			messagesDisplay.processIncoming(message);
		});

		socket.on('lists-list', function(listsObject){
			messagesDisplay.storeTwitterLists(listsObject);
			messagesDisplay.updateColumnsTwitterLists();
		});

		socket.on('home-timeline', function(timeline){
			// console.log('got home timeline');
			var messagesToDisplay = messagesDisplay.addAllMessages(
					timeline,
					'home'
				);
			if(messagesToDisplay != undefined){
				messagesDisplay.displayAllMessagesOnePerOne(messagesToDisplay, 'home');
			}
		});

		socket.on('delete tweet', function(message){
			messagesDisplay.deleteMessage(message);
		});

		socket.on('numberConnectedUsers', function(numberConnectedUsers){
			// console.log('Receive update message: ', numberConnectedUsers);
			mainSidebar.updateNumberConnectedUsers(numberConnectedUsers);
		});

		socket.on('disconnect', function(){
			console.log('Got disconnected');
		})
	}

	return {
		init:init,
		listen:listen
	};

})(socket);

dashboard.init(mapping, function(){
	dashboard.listen();
});




