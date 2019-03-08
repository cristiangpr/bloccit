const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/posts";
const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const Flair = require("../../src/db/models").Flair;

describe("routes : flairs", () => {

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
        this.user = user;

        Topic.create({
          title: "Winter Games",
          description: "Post your Winter Games stories.",
          posts: [{
            title: "Snowball Fighting",
            body: "So much snow!",
            userId: this.user.id
          }]
        }, {
          include: {
           model: Post,
           as: "posts"
          }
        })
        .then((topic) => {
          this.topic = topic;
          this.post = topic.posts[0];

          Flair.create({
            name: "Lucy",
            color: "purple",
            postId: this.post.id
          })
          .then((flair) => {
            this.flair = flair;
            done();
          })
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });

  });

  describe("GET /posts/:postId/flairs/new", () => {

    it("should render a new flair form", (done) => {
      request.get(`${base}/${this.post.id}/flairs/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Flair");
        done();
      });
    });

  });

  describe("POST /posts/:postId/flairs/create", () => {

   it("should create a new flair and redirect", (done) => {
      const options = {
        url: `${base}/${this.post.id}/flairs/create`,
        form: {
          name: "Lucy",
          color: "purple"
        }
      };
      request.post(options,
        (err, res, body) => {

          Flair.findOne({where: {name: "Lucy"}})
          .then((flair) => {
            expect(flair).not.toBeNull();
            expect(flair.name).toBe("Lucy");
            expect(flair.color).toBe("purple");
            expect(flair.postId).not.toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          });
        }
      );
    });

 });

  describe("GET /topics/:topicId/posts/:postId/flairs/:id", () => {

    it("should render a view with the selected flair", (done) => {
      request.get(`${base}/${this.post.id}/flairs/${this.flair.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Lucy");
        done();
      });
    });

  });

  describe("POST /topics/:topicId/posts/:postId/flairs/:id/destroy", () => {

     it("should delete the flair with the associated ID", (done) => {

       expect(this.flair.id).toBe(1);

       request.post(`${base}/${this.post.id}/flairs/${this.flair.id}/destroy`, (err, res, body) => {

         Flair.findById(1)
         .then((flair) => {
           expect(err).toBeNull();
           expect(flair).toBeNull();
           done();
         })
       });

     });

   });

   describe("GET /topics/:topicId/posts/:postId/flairs/:id/edit", () => {

     it("should render a view with an edit flair form", (done) => {
       request.get(`${base}/${this.post.id}/flairs/${this.flair.id}/edit`, (err, res, body) => {
         expect(err).toBeNull();
         expect(body).toContain("Edit Flair");
         expect(body).toContain("Lucy");
         done();
       });
     });

   });

   describe("POST /topics/:topicId/posts/:postId/flairs/:id/update", () => {

     it("should return a status code 302", (done) => {
       request.post({
         url: `${base}/${this.post.id}/flairs/${this.flair.id}/update`,
         form: {
           name: "Lucy",
           color: "purple"
         }
       }, (err, res, body) => {
         expect(res.statusCode).toBe(302);
         done();
       });
     });

     it("should update the flair with the given values", (done) => {
       const options = {
         url: `${base}/${this.post.id}/flairs/${this.flair.id}/update`,
         form: {
           name: "Lucy",
           color: "purple"
         }
       };
       request.post(options,
         (err, res, body) => {

           expect(err).toBeNull();

           Flair.findOne({
             where: {id: this.flair.id}
           })
           .then((flair) => {
             expect(flair.name).toBe("Lucy");
             done();
           });
         });
      });

    });

});
