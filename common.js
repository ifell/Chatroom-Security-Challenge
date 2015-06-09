// ------------------ Collection & Schema ----------------- //
Messages = new Mongo.Collection("messages");

MessageSchema = new SimpleSchema({
  body: {
    type: String
  },
  createdAt: {
    type: Date
  },
  userId: {
    type: String
  },
  likes: {
    type: [String]
  },
  likesCount: {
    type: Number
  }
});

// ------------------ Insert ----------------- //

// Inserting is taken care of via a method
Meteor.methods({
  insertMessage: function (message) {
    if (this.userId) {
      Messages.insert({
        body: message,
        createdAt: new Date(),
        userId: this.userId,
        likes: [],
        likesCount: 0
      });
    }
  }
});

// ------------------ Allow & Deny ----------------- //

// Start here

Messages.allow({
  update: function (userId, doc, fields, modifier) {
    // can only edit own messages
    if (_.contains(fields, 'body') && modifier.$set && modifier.$set.body && userId === doc.userId) {
      fields = _.difference(fields, ['body']);
    }

    // likes
    if (_.contains(fields, 'likes') && _.contains(fields, 'likesCount')) {

      // add if not already liked
      if ( ( !_.contains(doc.likes, userId) && modifier.$addToSet && modifier.$addToSet.likes === userId && modifier.$inc && modifier.$inc.likesCount === 1 ) ){
        fields = _.difference(fields, ['likes', 'likesCount']);
      }

      // remove if already liked
      if ( ( _.contains(doc.likes, userId) && modifier.$pull && modifier.$pull.likes === userId && modifier.$inc && modifier.$inc.likesCount === -1 ) ) {
        fields = _.difference(fields, ['likes', 'likesCount']);
      }
    }

    // do not allow other fields to be updated
    return !fields.length;
  }
});

// must be logged in
Messages.deny({
  update: function (userId, docs, fields, modifier) {
    return !userId;
  }
});
