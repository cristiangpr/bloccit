'use strict';
module.exports = (sequelize, DataTypes) => {
  var Post = sequelize.define('Post', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
        type: DataTypes.STRING,
        allowNull: false
      },
    topicId: {
      type: DataTypes.INTEGER,
      allowNull: false
  },
   userId: {
     type: DataTypes.INTEGER,
     allowNull: false
   },

userId: {
  type: DataTypes.INTEGER,
  allowNull: false
}



  }, {});
  Post.associate = function(models) {
    Post.belongsTo(models.Topic, {
        foreignKey: "topicId",
        onDelete: "CASCADE"
      });
  Post.belongsTo(models.User, {
    foreignKey: "userId",
    onDelete: "CASCADE"
  });
      Post.hasOne(models.Flair, {
         foreignKey: "postId",
         as: "flair"
       });
       Post.hasMany(models.Comment, {
    foreignKey: "postId",
    as: "comments"
  });
  Post.hasMany(models.Vote, {
   foreignKey: "postId",
   as: "votes"
 });
 Post.hasMany(models.Favorite, {
   foreignKey: "postId",
   as: "favorites"
 });
  };
  Post.prototype.getPoints = function(){

 // #1
     if(this.votes.length === 0) return 0

 // #2
     return this.votes
       .map((v) => { return v.value })
       .reduce((prev, next) => { return prev + next });
   };
   Post.prototype.hasUpvoteFor = function(userId){
  return this.getVotes({where: {userId, postId: this.id, value: 1}}).then(votes => votes.length > 0 ? true : false)

};

Post.prototype.hasDownvoteFor = function(userId){
  return this.getVotes({where: {userId, postId: this.id, value: -1}}).then(votes => votes.length > 0 ? true: false)
};
Post.prototype.getFavoriteFor = function(userId){
   return this.favorites.find((favorite) => { return favorite.userId == userId });
 };

  return Post;
};
