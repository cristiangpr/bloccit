const topicQueries = require("../db/queries.topics.js");

module.exports = {
  index(req, res, next){


//#2
     topicQueries.getAllTopics((err, topics) => {

//#3
       if(err){
         res.redirect(500, "static/index");
       } else {
         res.render("topics/index", {topics});
       }
     })
  },

  new(req, res, next){
    res.render("topics/new");
  }
}
