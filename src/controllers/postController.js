const postQueries = require("../db/queries.posts.js");
 const Authorizer = require("../policies/post");
module.exports = {
  new(req, res, next){
  // #2
      const authorized = new Authorizer(req.user).new();

      if(authorized) {
        res.render("posts/new");
      } else {
        req.flash("notice", "You are not authorized to do that.");
        res.redirect("/posts");
      }
    },
    create(req, res, next){

     // #1
         const authorized = new Authorizer(req.user).create();

     // #2
         if(authorized) {
           let newPost = {
             title: req.body.title,
             body: req.body.body
           };
           postQueries.addPost(newPost, (err, post) => {
             if(err){
               res.redirect(500, "posts/new");
             } else {
               res.redirect(303, `/posts/${post.id}`);
             }
           });
         } else {

     // #3
           req.flash("notice", "You are not authorized to do that.");
           res.redirect("/posts");
         }
       },
  show(req, res, next){
   postQueries.getPost(req.params.id, (err, post) => {
     if(err || post == null){
       res.redirect(404, "/");
     } else {
       res.render("posts/show", {post});
     }
   });
 },
 edit(req, res, next){

 // #1
     postQueries.getPost(req.params.id, (err, post) => {
       if(err || post == null){
         res.redirect(404, "/");
       } else {

 // #2
         const authorized = new Authorizer(req.user, post).edit();

 // #3
         if(authorized){
           res.render("posts/edit", {post});
         } else {
           req.flash("You are not authorized to do that.")
           res.redirect(`/posts/${req.params.id}`)
         }
       }
     });
   },
   destroy(req, res, next){

   // #1
       postQueries.deletePost(req, (err, post) => {
         if(err){
           res.redirect(err, `/posts/${req.params.id}`)
         } else {
           res.redirect(303, "/posts")
         }
       });
     },
     update(req, res, next){

  // #1
      postQueries.updatePost(req, req.body, (err, post) => {
        if(err || post == null){
          res.redirect(401, `/posts/${req.params.id}/edit`);
        } else {
          res.redirect(`/posts/${req.params.id}`);
        }
      });
    }
}
