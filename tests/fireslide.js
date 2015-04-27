var assert = require('assert');
var webdriverio = require('webdriverio');


var seleniumHubSettings = {
    host: 'localhost',
    port: 9515,
    desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: [
                'window-size=340,750'
            ]
        }

    }
};

describe.skip('Fireslide', function() {

    var client, client2;

    this.timeout(20000);
    before(function(done) {
        client = webdriverio.remote(seleniumHubSettings);
        client2 = webdriverio.remote(seleniumHubSettings);
        client2.init();
        client.init(done);
    });

    after(function(done) {
        client.end();
        client2.end(done);
    });

    it('should have a title FireSlide', function(done) {
        client.url('localhost:8080')
            .getTitle(function(err, title) {
                assert.equal('FireSlide', title);
            })
            .call(done);
    });

    it('should have a panic button in attender mode', function(done) {
        client.url('localhost:8080')
            .getText('[data-ta="vote-panic"]', function(err, text) {
                assert.equal('panic', text);
            })
            .call(done);
    });


    it('should open remote mode', function(done) {
        client.url('localhost:8080/#/remote')
            .pause(1000)
            .call(done);
    });


    it('should show number of panic button press ( with hard coded waits )', function(done) {
        var remote = client.url('localhost:8080/#/remote');
        var attender = client2.url('localhost:8080');
        attender.pause(3000);
        attender.click('[data-ta="vote-panic"]');
        remote.pause(10000);
        remote.getText('.vote-info-panic span', function(err, text) {
            assert.equal(text, '1', 'There is no panic in here!!!');
        }).call(done);
    });

    it('should show number of panic button press ( with minimal waiting )', function(done) {
        var remote = client.url('localhost:8080/#/remote');
        var attender = client2.url('localhost:8080');
        attender.waitForExist('div.loading', 5000, true);
        attender.waitForExist('[data-ta="vote-panic"]', function(err, isthere) {
            assert(isthere);
            attender.click('[data-ta="vote-panic"]');
        });
        attender.call(function() {
            var timeout = 5000,
                expectedValue = '1',
                waiting = true,
                match = false;

            setTimeout(function() {
                waiting = false;
            }, timeout);

            function check() {
                remote.getText('.vote-info-panic span', function(err, text) {    
                    if (text == expectedValue) {
                        match = true;
                    }
                });
                if (waiting && !match) {
                    setTimeout(check, 100);
                } else {
                    assert(match, 'The panic press has not been registered!');
                    done();
                }
            }

            check();
        });
    });
});