var assert = require('assert');
var webdriverio = require('webdriverio');
var optionsAttender = {
    host: 'localhost',
    port: 9515,
    desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: ['window-size=320,550', 'window-position=0,0']
        }
    }
};
var optionsRemote = {
    host: 'localhost',
    port: 9515,
    desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: ['window-size=320,550', 'window-position=400,0']
        }
    }
};

function customize(client) {
    client.addCommand('waitForTextValue', function(selector, expectedValue, timeout, cb) {
        var waiting = true,
            match = false,
            client = this;

        setTimeout(function() {
            waiting = false;
        }, timeout);

        function check() {
            if (waiting) {
                client.getText(selector, function(err, text) {
                    if (text == expectedValue) {
                        match = true;
                    }
                }).call(function() {
                    if (match) {
                        cb();
                    } else {
                        setTimeout(check, 100);
                    }
                });
            } else {
                cb();
            }
        }
        check();
    });
}
var async = require('async');
describe('Fireslide', function() {
    var remote, attender;
    this.timeout(20000);

    it('should have a title FireSlide', function(done) {
        var attender = webdriverio.remote(optionsAttender).init()
            .url('localhost:8080')
            .getTitle(function(err, title) {
                assert.equal('FireSlide', title);
            })
            .end(done);
    });

    it('should have a panic button in attender mode', function(done) {
        var attender = webdriverio.remote(optionsAttender).init()
            .url('localhost:8080')
            .waitForExist('div.loading', 5000, true)
            .getText('[data-ta="vote-panic"]', function(err, text) {
                assert.equal('panic', text);
            })
            .end(done);
    });

    it('should show number of panic button press ( with hard coded waits )', function(done) {
        var attender = webdriverio.remote(optionsAttender).init()
            .url('localhost:8080')
            .pause(3000)
            .click('[data-ta="vote-panic"]')
            .end();
        var remote = webdriverio.remote(optionsRemote).init()
            .url('localhost:8080/#/remote')
            .pause(6000)
            .getText('.vote-info-panic span', function(err, text) {
                assert.equal(text, '1', 'There is no panic in here!!!');
            })
            .end(done);
    });

    it('should show number of panic button press ( with minimal waiting )', function(done) {
        var currentPanic;
        var attender = webdriverio.remote(optionsAttender).init()
            .url('localhost:8080');
        var remote = webdriverio.remote(optionsRemote).init()
            .url('localhost:8080/#/remote')
            .waitForExist('div.loading', 5000, true)
            .pause(2000)
            .getText('.vote-info-panic span', function(err, text) {
                currentPanic = parseInt(text);
            })
            .call(
                function() {
                    attender.waitForExist('div.loading', 5000, true)
                        .waitForExist('[data-ta="vote-panic"]', function(err, isthere) {
                            assert(isthere);
                            attender.click('[data-ta="vote-panic"]');
                        })
                        .end(function() {
                            customize(remote);
                            remote.waitForTextValue('.vote-info-panic span', 1 + currentPanic, 5000)
                                .end(done);
                        });
                });
    });
});