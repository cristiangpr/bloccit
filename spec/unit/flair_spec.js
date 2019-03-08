const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Flair = require("../../src/db/models").Flair;
const User = require("../../src/db/models").User;

describe("Flair", () => {

  beforeEach((done) => {
    this.topic;
    this.post;
    this.flair;
    this.user;

    sequelize.sync({force: true}).then((res) => {

      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user; //store the user

        Topic.create({
          title: "Expeditions to Alpha Centauri",
          description: "A compilation of reports from recent visits to the star system.",
          posts: [{
            title: "My first visit to Proxima Centauri b",
            body: "I saw some rocks.",
            userId: this.user.id
          }]
        }, {
          include: {
            model: Post,
            as: "posts"
          }
        })
        .then((topic) => {
          this.topic = topic; //store the topic
          this.post = topic.posts[0]; //store the post
          done();



          Flair.create({
            name: "Buzz",
            color: "blue",
            postId: this.post.id

          })
          .then((flair) => {
            this.flair = flair;
              done();
          });
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });

    });
      });



  describe("#create()", () => {

    it("should create a flair object with a name, color, and an assigned post", (done) => {

      Flair.create({
        name: "Peter",
        color: "purple",
        postId: this.post.id
      })
      .then((flair) => {

        expect(flair.name).toBe("Peter");
        expect(flair.color).toBe("purple");
        done();

      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });

  });


   describe("#setPost()", () => {

     it("should associate a post and a flair together", () => {

       Post.create({
         title: "My first visit to Proxima Centauri b",
         body: "I saw some rocks.",
         topicId: this.topic.id
       })
       .then((newPost) => {

         expect(this.flair.postId).toBe(this.post.id);

         this.flair.setPost(newPost)
         .then((flair) => {

           expect(flair.postId).toBe(newPost.id);
           

         });
       })
     });

   });

   describe("#getPost()", () => {

     it("should return the associated post", (done) => {

       this.flair.getPost()
       .then((associatedPost) => {
         expect(associatedPost.title).toBe("My first visit to Proxima Centauri b");
         done();
       });

     });

   });
});
