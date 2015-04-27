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

describe('Demo page', function() {

    var client, client2;

    this.timeout(20000);
    before(function(done) {
        client = webdriverio.remote(seleniumHubSettings);
        client.init(done);
    });

    after(function(done) {
        client.end(done);
    });

    it('should have a proper title', function(done) {
        client.url('localhost:8080/demo.html')
            .getTitle(function(err, title) {
                assert.equal('Functional testing demo', title, "Title is not correct");
            })
            .call(done);
    });

    it('should have heading with welcome text', function(done) {
        client.url('localhost:8080/demo.html')
            .getText('h1', function(err, text) {
                assert.equal('Welcome to simple testing', text);
            })
            .call(done);
    });


    it('should increment the counter when we hit the instant increment button', function(done) {
        client.url('localhost:8080/demo.html')
            .click('#instant')
            .getText('#counter', function(err, text) {
                assert.equal(text, '1');
            })
            .call(done);
    });

    it('should increment the counter when we hit the delayed increment button', function(done) {
        client.url('localhost:8080/demo.html')
            .click('#delayed')
            .pause(5000)
            .getText('#counter', function(err, text) {
                assert.equal(text, '1');
            })
            .call(done);
    });


    it('should increment the counter when we hit the delayed increment button without a hardcoded pause', function(done) {
        client.url('localhost:8080/demo.html')
            .click('#delayed');

        var maxwait = 5000,
            waiting = true,
            match = false;

        function check() {
            client.getText('#counter', function(err, text) {
                if (text == '1') {
                    match = true;
                }
                if (waiting && !match) {
                    setTimeout(check, 100);
                } else {
                    assert(match, "The value didn't increment!!!");
                    done();
                }
            })
        };

        check();
        setTimeout(function() {
            waiting = false;
        }, maxwait);
    });

    before(function() {
        client.addCommand("assertText", function(selector, expected, timeout, cb) {
            var waiting = true,
                match = false;

            function check() {
                client.getText(selector, function(err, text) {
                    if (text == expected) {
                        match = true;
                    }
                    if (waiting && !match) {
                        setTimeout(check, 100);
                    } else {
                        assert.equal(text, expected);
                        cb(err);
                    }
                })
            };

            check();

            setTimeout(function() {
                waiting = false;
            }, timeout);
        });
    });


    it('should increment the counter when we hit the delayed increment button without a hardcoded pause (short version)', function(done) {
        client.url('localhost:8080/demo.html')
            .click('#delayed')
            .assertText('#counter', '1', 5000)
            .call(done);
    });
});