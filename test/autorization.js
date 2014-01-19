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

var cookie;

describe('#authorization', function(){
    var url = 'http://' + config.server.ip+":"+config.server.port;
    before(function(done){
        app.init(done);
    });

    after(function(done){
        app.stop();
        done();
    });

    it('- #login with '+ user.password + ':' + user.email, function(done){
        request(url)
            .post('/api/v1/auth')
            .send({email: user.email, password: user.password})
            .expect(200)
            .expect(function(res){
                res.body.email.should.equal(user.email);
            })
            .end(done);
    });

    it('- #access denied without login', function(done){
        request(url)
            .get('/api/v1/auth')
            .expect(401)
            .expect(function(res){
                res.body.message.should.equal('Omnis.Authorization: Unauthorized');
            })
            .end(done);
    });

    it('- #access denied on logout if not login', function(done){
        request(url)
            .del('/api/v1/auth')
            .expect(401)
            .expect(function(res){
                res.body.message.should.equal('Omnis.Authorization: Unauthorized');
            })
            .end(done);
    });

    it('- #login and logout', function(done){

        async.waterfall([

            function(done){
                request(url)
                    .post('/api/v1/auth')
                    .send({email: user.email, password: user.password})
                    .end(function(err, res){
                        cookie = res.headers['set-cookie'];
                        done(err);
                    });
            },
            function(done){
                request(url)
                    .del('/api/v1/auth')
                    .expect(204)
                    .set('cookie', cookie)
                    .end(function(err){
                        done(err);
                    });
            },
            function(done){
                request(url)
                    .get('/api/v1/auth')
                    .set('cookie', cookie)
                    .expect(401)
                    .expect(function(res){
                        res.body.message.should.equal('Omnis.Authorization: Unauthorized');
                    })
                    .end(function(err){ done(err); });
            }

        ], done);
    });
});
