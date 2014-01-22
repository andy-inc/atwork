/**
 * Created by Andy <andy@sumskoy.com> on 19/01/14.
 */
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var async = require('async');
var app = require('../app'),
    config = require('../config/app'),
    defaultUser = config.defaultUsers[0];

describe('#visit', function(){
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
        var key, user;
        var d = new Date();

        before(function(done){
            var userModel = require('../models/user'),
                keyModel = require('../models/key');
            async.waterfall([

                function(done){
                    request(url)
                        .post('/api/v1/auth')
                        .send({email: defaultUser.email, password: defaultUser.password})
                        .end(function(err, res){
                            cookie = res.headers['set-cookie'];
                            done(err);
                        });
                },

                function(done){
                    userModel.removeByEmail("test-visit@test.com", function(err){ done(); });
                },

                function(done){
                    request(url)
                        .post('/api/v1/user')
                        .send({email: "test-visit@test.com", password: "testing", alias: "TEST"})
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            user = res.body;
                            res.body.email.should.equal("test-visit@test.com");
                        })
                        .end(function(err){ done(err); });
                },
                function(done){
                    keyModel.removeByCode("test", function(err){ done(); });
                },
                function(done){
                    request(url)
                        .post('/api/v1/key')
                        .send({code: "test", userId: user.id})
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            key = res.body;
                            res.body.code.should.equal("test");
                        })
                        .end(function(err){ done(err); });
                }

            ], done);

        });

        it('register visit', function(done){
            async.waterfall([
                function(done){
                    request(url)
                        .post('/api/v1/visit')
                        .send({keyId: "test", date: d})
                        .set('cookie', cookie)
                        .expect(200)
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .get('/api/v1/visit/'+user.id)
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            res.body.should.be.instanceof(Array);
                            res.body.length.should.be.equal(1);
                        })
                        .end(function(err){ done(err); });
                }
            ], done);
        });

    });
});