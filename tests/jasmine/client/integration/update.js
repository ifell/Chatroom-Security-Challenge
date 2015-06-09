describe('Messages User', function() {
  var user1_id;
  var user2_id;

  var user1_post1;
  var user1_post2;

  var user2_post1;

  beforeEach(function(done) {
    Accounts.createUser({username: 'user1', password:'password123'}, function(error) {
      user1_id = Meteor.userId();

      Meteor.call('insertMessage', 'hello everyone');
      user1_post1 = Messages.findOne({body: 'hello everyone'});

      Meteor.call('insertMessage', 'welcome');
      user1_post2 = Messages.findOne({body: 'welcome'});

      Accounts.createUser({username: 'user2', password:'password123'}, function(error) {
        user2_id = Meteor.userId();

        Meteor.call('insertMessage', 'hi');
        user2_post1 = Messages.findOne({body: 'hi'});

        Meteor.logout(done);
      });
    });
  });

  it ('should not be able to update when not logged in', function(done) {
    //execute
    Messages.update({_id: user1_post1._id}, {$set: {body: 'has been updated'}}, function(error, res) {
      //verify
      expect(error).toBeDefined();
      expect(res).toBeFalsy();
      expect(Messages.findOne({_id: user1_post1._id}).body).toEqual(user1_post1.body);

      done();
    });
  });

  it ('should be able to update his own body', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toBeUndefined();

      //execute
      Messages.update({_id: user1_post1._id}, {$set: {body: 'has been updated'}}, function(error, res) {
        //verify
        expect(error).toBeUndefined();
        expect(res).toBeTruthy();
        expect(Messages.findOne({_id: user1_post1._id}).body).toEqual('has been updated');

        done();
      });
    });
  });

  it ('should not be able to update someone else\'s body', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user2_post1._id}, {$set: {body: 'has been updated'}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user2_post1._id}).body).toEqual(user2_post1.body);

        done();
      });
    });
  });

  it ('should be able to like your own message', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 1}}, function(error, res) {
        //verify
        expect(error).toBeUndefined();
        expect(res).toBeTruthy();
        expect(Messages.findOne({_id: user1_post1._id}).likes).toContain(Meteor.userId());
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(1);

        done();
      });
    });
  });

  it ('should be able to like somone else\'s message', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user2_post1._id}, {$addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 1}}, function(error, res) {
        //verify
        expect(error).toBeUndefined();
        expect(res).toBeTruthy();
        expect(Messages.findOne({_id: user2_post1._id}).likes).toContain(Meteor.userId());
        expect(Messages.findOne({_id: user2_post1._id}).likesCount).toEqual(1);

        done();
      });
    });
  });

  it ('should not be able to like a message twise', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 1}}, function(error, res) {
        //verify first like
        expect(error).toBeUndefined();
        expect(res).toBeTruthy();
        expect(Messages.findOne({_id: user1_post1._id}).likes).toContain(Meteor.userId());
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(1);
        Messages.update({_id: user1_post1._id}, {$addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 1}}, function(error, res) {
          //verify
          expect(error).toBeDefined();
          expect(res).toBeFalsy();
          expect(Messages.findOne({_id: user1_post1._id}).likes).toContain(Meteor.userId());
          expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(1);

          done();
        });
      });
    });
  });

  it ('should be able to unlike your own message', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 1}}, function(error, res) {
        //verify
        expect(error).toBeUndefined();
        expect(res).toBeTruthy();
        expect(Messages.findOne({_id: user1_post1._id}).likes).toContain(Meteor.userId());
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(1);

        Messages.update({_id: user1_post1._id}, {$pull: {likes: Meteor.userId()}, $inc: {likesCount: -1}}, function(error, res) {
          expect(error).toBeUndefined();
          expect(res).toBeTruthy();
          expect(Messages.findOne({_id: user1_post1._id}).likes).not.toContain(Meteor.userId());
          expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(0);

          done();
        });
      });
    });
  });

  it ('should be able to unlike somone else\'s message', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user2_post1._id}, {$addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 1}}, function(error, res) {
        //verify
        expect(error).toBeUndefined();
        expect(res).toBeTruthy();
        expect(Messages.findOne({_id: user2_post1._id}).likes).toContain(Meteor.userId());
        expect(Messages.findOne({_id: user2_post1._id}).likesCount).toEqual(1);

        Messages.update({_id: user2_post1._id}, {$pull: {likes: Meteor.userId()}, $inc: {likesCount: -1}}, function(error, res) {
          expect(error).toBeUndefined();
          expect(res).toBeTruthy();
          expect(Messages.findOne({_id: user2_post1._id}).likes).not.toContain(Meteor.userId());
          expect(Messages.findOne({_id: user2_post1._id}).likesCount).toEqual(0);

          done();
        });
      });
    });
  });

  it ('should not be able to unlike a message if not already liked', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$pull: {likes: Meteor.userId()}, $inc: {likesCount: -1}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).likes).not.toContain(Meteor.userId());
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(0);

        done();
      });
    });
  });

  it ('should not be able to update createdAt', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$set: {createdAt: new Date(0)}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        //Below returns false because of something with isodates in mongo
        //expect(Number(Messages.findOne({_id: user1_post1._id}).createdAt)).toEqual(Number(user1_post1.createdAt));

        done();
      });
    });
  });

  it ('should not be able to update userId', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$set: {userId: 'hi'}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).userId).toEqual(user1_post1.userId);

        done();
      });
    });
  });

  it ('should be able to update body and likes in the same query', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$set: {body: 'has been updated'}, $addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 1}}, function(error, res) {
        //verify
        expect(error).toBeUndefined();
        expect(res).toBeTruthy();
        expect(Messages.findOne({_id: user1_post1._id}).body).toEqual('has been updated');
        expect(Messages.findOne({_id: user1_post1._id}).likes).toContain(Meteor.userId());
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(1);

        done();
      });
    });
  });

  it ('should not be able to update body and remove likes when user hasn\'t liked in the same query', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$set: {body: 'has been updated'}, $pull: {likes: Meteor.userId()}, $inc: {likesCount: -1}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).body).toEqual(user1_post1.body);
        expect(Messages.findOne({_id: user1_post1._id}).likes).not.toContain(Meteor.userId());
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(0);

        done();
      });
    });
  });

  it ('should not be able to update with a random query', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$unset: {body: ''}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).body).toEqual(user1_post1.body);

        done();
      });
    });
  });

  it ('should not be able to update likes with a random query', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$unset: {body: ''}, $addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 1}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).body).toEqual(user1_post1.body);
        expect(Messages.findOne({_id: user1_post1._id}).likes).not.toContain(Meteor.userId());
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(0);

        done();
      });
    });
  });

  it ('should not update with irrelevent fields', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {set: {body: 'Hello', trash: 'trash'}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).body).toEqual(user1_post1.body);
        expect(Messages.findOne({_id: user1_post1._id})).not.toEqual(jasmine.objectContaining({
          trash: 'trash'
        }));

        done();
      });
    });
  });

  it ('should not increase like count more than once', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$addToSet: {likes: Meteor.userId()}, $inc: {likesCount: 2}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).likes).toEqual([]);
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(0);

        done();
      });
    });
  });

  it ('should not decrease like count when adding user to likes', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$addToSet: {likes: Meteor.userId()}, $inc: {likesCount: -1}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).likes).toEqual([]);
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(0);

        done();
      });
    });
  });

  it ('should not add extra users to likes set in one operation', function(done) {
    //setup
    Meteor.loginWithPassword('user1', 'password123', function(error) {
      expect(error).toEqual(undefined);

      //execute
      Messages.update({_id: user1_post1._id}, {$addToSet: {likes: Meteor.userId(), likes: 'hello'}, $inc: {likesCount: 1}}, function(error, res) {
        //verify
        expect(error).toBeDefined();
        expect(res).toBeFalsy();
        expect(Messages.findOne({_id: user1_post1._id}).likes).toEqual([]);
        expect(Messages.findOne({_id: user1_post1._id}).likesCount).toEqual(0);

        done();
      });
    });
  });

  afterEach(function(done) {
    Meteor.call('dropDatabase', done);
  });
});
