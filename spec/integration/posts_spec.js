const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/topics";

const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;
const Vote = require("../../src/db/models").Vote;

describe("routes : posts", () => {

    beforeEach((done) => {
        this.topic;
        this.post;
        this.user;

        sequelize.sync({
            force: true
        }).then((res) => {
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
                                title: "Snowman Building Competition",
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


                            done();
                        })
                })
        });

    });
    //paras good to here

    describe("GET /topics/:topicId/posts/:id", () => {

        it("should render a view with the selected post - beginning", (done) => {
            request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Snowman Building Competition");
                done();
            });
        });
    });

    // context of Member User
    describe("Show for Post using Member role - new and create - CRUD", () => {

        beforeEach((done) => { // before each suite in admin context
            request.get({ // mock authentication
                url: "http://localhost:3000/auth/fake",
                form: {
                    role: "member", // mock authenticate as admin user
                    userId: 1,
                }
            });
            done();
        });

        describe("GET /topics/:topicId/posts/new", () => {

            it("should render a new post form", (done) => {
                request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("New Post");
                    done();
                });
            });

        });

        describe("POST /topics/:topicId/posts/create", () => {

            it("should create a new post and redirect", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "Watching snow melt",
                        body: "Without a doubt my favoriting things to do besides watching paint dry!",
                        userId: 1
                    }

                };

                request.post(options,
                    (err, res, body) => {

                        Post.findOne({
                                where: {
                                    title: "Watching snow melt"
                                }
                            })
                            .then((post) => {

                                expect(post).not.toBeNull();
                                expect(post.title).toBe("Watching snow melt");
                                expect(post.body).toBe("Without a doubt my favoriting things to do besides watching paint dry!");
                                expect(post.topicId).not.toBeNull();

                                done();
                            })
                            .catch((err) => {
                                console.log(err);
                                done();
                            });
                    }
                );
            });




            // Add new test here
            it("should not create a new post that fails validations", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {

                        title: "a",
                        body: "b"
                    }
                };

                request.post(options,
                    (err, res, body) => {

                        Post.findOne({
                                where: {
                                    title: "a"
                                }
                            })
                            .then((post) => {
                                expect(post).toBeNull();
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
    });

    // context of Post Owner
    describe("GET /topics/:topicId/posts/:id/edit", () => {

        beforeEach((done) => { // before each suite in admin context
            request.get({ // mock authentication
                url: "http://localhost:3000/auth/fake",
                form: {
                    role: "member", // mock authenticate as admin user
                    userId: 1,
                }
            });





            done();
        });

        it("should render a view with an edit post form", (done) => {

            request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Edit Post");
                expect(body).toContain("Snowman Building Competition");
                done();


            });
        });

        describe("POST /topics/:topicId/posts/:id/update", () => {

            it("should return a status code 302", (done) => {
                request.post({
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition",
                        body: "I love watching them melt slowly."
                    }
                }, (err, res, body) => {
                    expect(res.statusCode).toBe(302);
                    done();
                });
            });

            it("should update the post with the given values", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition"
                    }
                };
                request.post(options,
                    (err, res, body) => {

                        expect(err).toBeNull();

                        Post.findOne({
                                where: {
                                    id: this.post.id
                                }
                            })
                            .then((post) => {
                                expect(post.title).toBe("Snowman Building Competition");
                                done();
                            });
                    });
            });
        });

        describe("POST /topics/:topicId/posts/:id/destroy", () => {

            it("should delete the post with the associated ID", (done) => {

                expect(this.post.id).toBe(1);

                request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {

                    Post.findById(1)
                        .then((post) => {
                            expect(err).toBeNull();
                            expect(post).toBeNull();
                            done();
                        })
                });

            });

        });

    });

    // context of admin
    describe("Show for Post using Admin role - CRUD", () => {

        beforeEach((done) => { // before each suite in admin context
            request.get({ // mock authentication
                url: "http://localhost:3000/auth/fake",
                form: {
                    role: "admin", // mock authenticate as admin user
                    userId: 999,
                }
            });
            done();
        });

        describe("GET /topics/:topicId/posts/:id", () => {

            it("should render a view with the selected post - admin", (done) => {
                request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("So much snow!");
                    done();
                });
            });

        });

        describe("GET /topics/:topicId/posts/new", () => {

            it("should render a new post form", (done) => {
                request.get(`${base}/${this.topic.id}/posts/new`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("New Post");
                    done();
                });
            });

        });

        describe("POST /topics/:topicId/posts/create", () => {

            it("should create a new post and redirect", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {
                        title: "Watching snow melt",
                        body: "Without a doubt my favoriting things to do besides watching paint dry!",
                        userId: 1
                    }

                };

                request.post(options,
                    (err, res, body) => {

                        Post.findOne({
                                where: {
                                    title: "Watching snow melt"
                                }
                            })
                            .then((post) => {

                                expect(post).not.toBeNull();
                                expect(post.title).toBe("Watching snow melt");
                                expect(post.body).toBe("Without a doubt my favoriting things to do besides watching paint dry!");
                                expect(post.topicId).not.toBeNull();

                                done();
                            })
                            .catch((err) => {
                                console.log(err);
                                done();
                            });
                    }
                );
            });




            // Add new test here
            it("should not create a new post that fails validations", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/create`,
                    form: {

                        title: "a",
                        body: "b"
                    }
                };

                request.post(options,
                    (err, res, body) => {

                        Post.findOne({
                                where: {
                                    title: "a"
                                }
                            })
                            .then((post) => {
                                expect(post).toBeNull();
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

        describe("GET /topics/:topicId/posts/:id/edit", () => {

            it("should render a view with an edit post form", (done) => {

                request.get(`${base}/${this.topic.id}/posts/${this.post.id}/edit`, (err, res, body) => {

                    expect(err).toBeNull();
                    expect(body).toContain("Edit Post");
                    expect(body).toContain("Snowman Building Competition");
                    done();
                });
            });

        });

        describe("POST /topics/:topicId/posts/:id/update", () => {

            it("should return a status code 302", (done) => {
                request.post({
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition",
                        body: "I love watching them melt slowly."
                    }
                }, (err, res, body) => {
                    expect(res.statusCode).toBe(302);
                    done();
                });
            });

            it("should update the post with the given values", (done) => {
                const options = {
                    url: `${base}/${this.topic.id}/posts/${this.post.id}/update`,
                    form: {
                        title: "Snowman Building Competition"
                    }
                };
                request.post(options,
                    (err, res, body) => {

                        expect(err).toBeNull();

                        Post.findOne({
                                where: {
                                    id: this.post.id
                                }
                            })
                            .then((post) => {
                                expect(post.title).toBe("Snowman Building Competition");
                                done();
                            });
                    });
            });

        });

        describe("POST /topics/:topicId/posts/:id/destroy", () => {

            it("should delete the post with the associated ID", (done) => {

                expect(this.post.id).toBe(1);

                request.post(`${base}/${this.topic.id}/posts/${this.post.id}/destroy`, (err, res, body) => {

                    Post.findById(1)
                        .then((post) => {
                            expect(err).toBeNull();
                            //expect(post).toBe(1);
                            done();
                        })
                });

            });

        });

    });

    // TESTS FOR VOTING
    describe("Authorization for testing", () => {

        beforeEach((done) => { // before each suite in admin context
            request.get({ // mock authentication
                url: "http://localhost:3000/auth/fake",
                form: {
                    role: "admin",
                    userId: 1,
                }
            });
            done();


            describe("GET /topics/:topicId/posts/:id", () => {

                it("should validate a down vote ", (done) => {
                    Vote.create({
                        value: -1,
                        userId: this.user.id,
                        postId: this.post.id
                    })
                })
                expect(err).toBeNull();
                Vote.findOne({
                        where: {
                            value: -1
                        }
                    })
                    .then((post) => {
                        expect(post).not.toBeNull();
                        expect(post).value.toBe(-1)
                        done();
                    });

            });
            describe("GET /topics/:topicId/posts/:id", () => {

                it("should validate an up vote ", (done) => {

                    request.get(`${base}/${this.topic.id}/posts/${this.post.id}`, (err, res, body) => {

                        Vote.create({
                            value: +1,
                            userId: this.user.id,
                            postId: this.post.id

                        })

                        expect(err).toBeNull();

                        Post.getPoints()

                            .then((post) => {
                                expect(post).toBeGreaterThan(0);


                                done();
                            });

                    });

                });
            });
        })
    });
});
