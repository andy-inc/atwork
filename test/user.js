/**
 * Created by Andy <andy@sumskoy.com> on 19/01/14.
 */
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var async = require('async');
var app = require('../app'),
    config = require('a.config'),
    user = config.defaultUsers[0];

describe('#user', function(){
    var url = 'http://' + config.server.ip+":"+config.server.port;
    before(function(done){
        app.init(done);
    });

    after(function(done){
        app.stop();
        done();
    });
    describe('#root', function(){
        var cookie;

        before(function(done){
            request(url)
                .post('/api/v1/auth')
                .send({email: user.email, password: user.password})
                .end(function(err, res){
                    cookie = res.headers['set-cookie'];
                    done(err);
                });
        });

        it('list users', function(done){
            request(url)
                .get('/api/v1/user')
                .set('cookie', cookie)
                .expect(200)
                .expect(function(res){
                    res.body.should.be.instanceof(Array);
                    res.body.length.should.be.greaterThan(config.defaultUsers.length-1);
                    res.body[0].should.be.an.Object.and.have.property('email');
                    res.body[0].should.have.property('fio');
                    res.body[0].should.have.property('alias');
                    res.body[0].should.have.property('sys');
                    res.body[0].should.have.property('key');
                    res.body[0].should.have.property('id');
                })
                .end(done);
        });

        it('get self', function(done){
            var id;
            async.waterfall([

                function(done){
                    request(url)
                        .get('/api/v1/user/self')
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            id = res.body.id;
                            res.body.should.be.an.Object.and.have.property('email').and.equal(user.email);
                        })
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .get('/api/v1/user/'+id)
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            res.body.id.should.equal(id);
                        })
                        .end(function(err){ done(err); });
                }

            ], done);

        });

        it('update self', function(done){

            var user;
            async.waterfall([

                function(done){
                    request(url)
                        .get('/api/v1/user/self')
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            user = res.body;
                            res.body.should.be.an.Object.and.have.property('email').and.equal(user.email);
                        })
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .put('/api/v1/user/'+user.id)
                        .send({alias: "TEST"})
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            res.body.alias.should.equal("TEST");
                        })
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .put('/api/v1/user/'+user.id)
                        .send({alias: user.alias})
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            res.body.alias.should.equal(user.alias);
                        })
                        .end(function(err){ done(err); });
                }

            ], done);

        });

        it('create user & delete user', function(done){
            var user;
            var userModel = require('../models/user');
            async.waterfall([
                function(done){
                    userModel.removeByEmail("test@test.com", function(err){ done(); });
                },
                function(done){
                    request(url)
                        .post('/api/v1/user')
                        .send({email: "test@test.com", password: "testing", alias: "TEST"})
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            user = res.body;
                            res.body.email.should.equal("test@test.com");
                        })
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .post('/api/v1/user')
                        .send({email: "test@test.com", password: "testing", alias: "TEST"})
                        .set('cookie', cookie)
                        .expect(409)
                        .expect(function(res){
                            res.body.code.should.equal("U1001");
                        })
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .del('/api/v1/user/' + user.id)
                        .set('cookie', cookie)
                        .expect(204)
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .get('/api/v1/user/'+user.id)
                        .set('cookie', cookie)
                        .expect(404)
                        .end(function(err){ done(err); });
                }
            ], done);
        });


    });
});