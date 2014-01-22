/**
 * Created by Andy <andy@sumskoy.com> on 19/01/14.
 */
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var async = require('async');
var app = require('../app'),
    config = require('../config/app'),
    user = config.defaultUsers[0];

describe('#key', function(){
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

        it('list', function(done){
            request(url)
                .get('/api/v1/key')
                .set('cookie', cookie)
                .expect(200)
                .expect(function(res){
                    res.body.should.be.instanceof(Array);
                })
                .end(done);
        });

        it('create key & delete key', function(done){
            var key;
            var KeyModel = require('../models/key');
            async.waterfall([
                function(done){
                    KeyModel.removeByCode("test", function(err){ done(); });
                },
                function(done){
                    request(url)
                        .post('/api/v1/key')
                        .send({code: "test"})
                        .set('cookie', cookie)
                        .expect(200)
                        .expect(function(res){
                            key = res.body;
                            res.body.code.should.equal("test");
                        })
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .post('/api/v1/key')
                        .send({code: "test"})
                        .set('cookie', cookie)
                        .expect(409)
                        .expect(function(res){
                            res.body.code.should.equal("K1001");
                        })
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .del('/api/v1/key/' + key.id)
                        .set('cookie', cookie)
                        .expect(204)
                        .end(function(err){ done(err); });
                },
                function(done){
                    request(url)
                        .get('/api/v1/key/'+key.id)
                        .set('cookie', cookie)
                        .expect(404)
                        .end(function(err){ done(err); });
                }
            ], done);
        });


    });
});