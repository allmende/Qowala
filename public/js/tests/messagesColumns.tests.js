describe("messagesColumns", function(){
	describe("addMessage()", function(){
		beforeEach(function() { 
			this.messagesColumn = new MessagesColumn('type', 'id', 'MessageDisplayObject');
			this.messagesColumn.limitNumberMessages = 3;
		});

		it("should add a message to the messagesList when it's empty", function(){
			this.messagesColumn.messagesList = [];

			var testMessage = {id_str: '5', user: 'John', text: 'Some content', entities: {}};
			var addedMessage = this.messagesColumn.addMessage(testMessage);

			expect(this.messagesColumn.messagesList).toBeDefined();
			expect(this.messagesColumn.messagesList).not.toBe(null);
			expect(this.messagesColumn.messagesList).toEqual([addedMessage]);
			expect(this.messagesColumn.messagesList.length).toEqual(1);
		});

		it("should add a message to the messagesList when there are already some in it", function(){
			this.messagesColumn.messagesList = [
				{id_str: '2', user: 'Conor', text: 'Some content', entities: {}},
			];

			var testMessage = {id_str: '5', user: 'John', text: 'Some content', entities: {}};
			var addedMessage = this.messagesColumn.addMessage(testMessage);

			expect(this.messagesColumn.messagesList).toBeDefined();
			expect(this.messagesColumn.messagesList).not.toBe(null);
			expect(this.messagesColumn.messagesList).toContain(addedMessage);
			expect(this.messagesColumn.messagesList).toContain(jasmine.objectContaining(
			    {
			      id_str: '2'
			    }
		    ));
			expect(this.messagesColumn.messagesList.length).toEqual(2);
		});

		it("should shift the messages when the list is full", function(){
			this.messagesColumn.messagesList = [
				{id_str: '3', user: 'Bob', text: 'Some content', entities: {}},
				{id_str: '2', user: 'Conor', text: 'Some content', entities: {}},
				{id_str: '1', user: 'Sarah', text: 'Some content', entities: {}},
			];
			
			var testMessage = {id_str: '5', user: 'John', text: 'Some content', entities: {}};
			
			var addedMessage = this.messagesColumn.addMessage(testMessage);

			expect(this.messagesColumn.messagesList).toBeDefined();
			expect(this.messagesColumn.messagesList).not.toBe(null);
			expect(this.messagesColumn.messagesList).toContain(jasmine.objectContaining(
				{
			      id_str: '3'
			    },
			    {
			      id_str: '2'
			    }
		    ));
			expect(this.messagesColumn.messagesList).not.toContain(jasmine.objectContaining(
			    {
			      id_str: '1'
			    }
		    ));
			expect(this.messagesColumn.messagesList).toContain(addedMessage);
			expect(this.messagesColumn.messagesList.length).toEqual(this.messagesColumn.limitNumberMessages);
		});

	});
		
});