var assert = require('assert');
var webdriverio = require('webdriverio');
var optionsAttender = {
    host: 'localhost',
    port: 9515,
    desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: ['window-size=340,750','window-position=100,100']
        }
    }
};
var optionsRemote = {
    host: 'localhost',
    port: 9515,
    desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: ['window-size=340,750','window-position=550,100']
        }
    }
};

var async = require('async');
describe('Fireslide', function() {
    var remote, attender;
    this.timeout(20000);
    before(function(done) {
        async.parallel([

            function(cb) {
                remote = webdriverio.remote(optionsRemote).init(cb);
            },

            function(cb) {
                attender = webdriverio.remote(optionsAttender).init(cb);
            }
        ], done);
    });

    after(function(done) {
        async.parallel([remote.end.bind(remote), attender.end.bind(attender)], done);
    });

    it('should have a title FireSlide', function(done) {
        attender.url('localhost:8080').getTitle(function(err, title) {
            assert.equal('FireSlide', title);
        }).call(done);
    });
    it('should have a panic button in attender mode', function(done) {
        attender.url('localhost:8080')
            .waitForExist('div.loading', 5000, true)
            .getText('[data-ta="vote-panic"]', function(err, text) {
                assert.equal('panic', text);
            }).call(done);
    });

    it('should show number of panic button press ( with hard coded waits )', function(done) {
        attender.url('localhost:8080');
        attender.pause(3000);
        attender.click('[data-ta="vote-panic"]').call(function() {
            remote.url('localhost:8080/#/remote')
                .pause(3000)
                .getText('.vote-info-panic span', function(err, text) {
                    assert.equal(text, '1', 'There is no panic in here!!!');
                })
                .call(done);
        });
    });

    it('should show number of panic button press ( with minimal waiting )', function(done) {
        var currentPanic;
        remote.url('localhost:8080/#/remote')
            .waitForExist('div.loading', 5000, true)
            .pause(2000)
            .getText('.vote-info-panic span', function(err,text){
                currentPanic = text;
            })
            .call(
                function(){
                    attender.url('localhost:8080')
                            .waitForExist('div.loading', 5000, true)
                            .waitForExist('[data-ta="vote-panic"]', function(err, isthere) {
                                assert(isthere);
                                attender.click('[data-ta="vote-panic"]');
                            })
                            .call(function() {
                                var timeout = 5000,
                                    expectedValue = currentPanic+1,
                                    waiting = true,
                                    match = false;
                                setTimeout(function() {
                                    waiting = false;
                                }, timeout);

                                function check() {
                                    remote.getText('.vote-info-panic span', function(err, text) {
                                        if (text != expectedValue) {
                                            match = true;
                                        }
                                    }).call(function() {
                                        if (waiting && !match) {
                                            setTimeout(check, 100);
                                        } else {
                                            assert(match, 'The panic press has not been registered!');
                                            done();
                                        }
                                    });
                                }
                        check();
                    });
        });
    });
});