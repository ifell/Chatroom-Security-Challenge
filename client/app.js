Accounts.ui.config({
  passwordSignupFields: 'USERNAME_ONLY'
});

Template.chatroom.helpers({
  messages: function () {
    return Messages.find();
  }
});

Template.chatroom.events({
  'click #submit': function () {
    Meteor.call("insertMessage", Template.instance().$("#message").val());
  }
});

Template.message.helpers({
  username: function () {
    var user = Meteor.users.findOne(this.userId);
    return user && user.username;
  }
});

Template.message.events({
  'click .like': function () {
    Messages.update(Template.currentData()._id, {
      $addToSet: {likes: Meteor.userId()},
      $inc: {likesCount: 1}
    });
  }
});