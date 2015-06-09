// Method for jasmine testing purposes
Meteor.methods({
  dropDatabase: function() {
    if (process.env.NODE_ENV === 'development') {
      Meteor.users.remove({});
      Messages.remove({});
    } else {
      console.log('Can only drop the database in development mode');
    }
  }
});
