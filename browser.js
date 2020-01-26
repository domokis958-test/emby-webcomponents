﻿define([], function () {
    'use strict';

    function isTv() {

        // This is going to be really difficult to get right
        var userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.indexOf('tv') !== -1) {
            return true;
        }

        if (userAgent.indexOf('samsungbrowser') !== -1) {
            return true;
        }

        if (userAgent.indexOf('nintendo') !== -1) {
            return true;
        }

        if (userAgent.indexOf('viera') !== -1) {
            return true;
        }

        if (userAgent.indexOf('web0s') !== -1) {
            return true;
        }

        return false;
    }

    function hasKeyboard(browser) {

        if (browser.xboxOne) {
            return true;
        }

        if (browser.ps4) {
            return true;
        }

        if (browser.edgeUwp) {
            // This is OK for now, but this won't always be true
            // Should we use this?
            // https://gist.github.com/wagonli/40d8a31bd0d6f0dd7a5d
            return true;
        }

        if (browser.tv) {
            return true;
        }

        if (typeof document !== 'undefined') {
            if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
                return true;
            }
        }

        return false;
    }

    function tizenVersion() {
        if (self.tizen && self.tizen.systeminfo) {
            var v = tizen.systeminfo.getCapability('http://tizen.org/feature/platform.version');

            return parseFloat(v);
        }
    }

    var _supportsCssAnimation;
    var _supportsCssAnimationWithPrefix;
    function supportsCssAnimation(allowPrefix) {

        if (allowPrefix) {
            if (_supportsCssAnimationWithPrefix === true || _supportsCssAnimationWithPrefix === false) {
                return _supportsCssAnimationWithPrefix;
            }
        } else {
            if (_supportsCssAnimation === true || _supportsCssAnimation === false) {
                return _supportsCssAnimation;
            }
        }

        var animation = false,
            animationstring = 'animation',
            keyframeprefix = '',
            domPrefixes = ['Webkit', 'O', 'Moz'],
            pfx = '',
            elm = document.createElement('div');

        if (elm.style.animationName !== undefined) { animation = true; }

        if (animation === false && allowPrefix) {
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
                    pfx = domPrefixes[i];
                    animationstring = pfx + 'Animation';
                    keyframeprefix = '-' + pfx.toLowerCase() + '-';
                    animation = true;
                    break;
                }
            }
        }

        if (allowPrefix) {
            _supportsCssAnimationWithPrefix = animation;
            return _supportsCssAnimationWithPrefix;
        } else {
            _supportsCssAnimation = animation;
            return _supportsCssAnimation;
        }
    }

    var uaMatch = function (ua) {
        ua = ua.toLowerCase();

        var match = /(edge)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)[ \/]([\w.]+)/.exec(ua) ||
            /(opr)[ \/]([\w.]+)/.exec(ua) ||
            /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(safari)[ \/]([\w.]+)/.exec(ua) ||
            /(firefox)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            [];

        var platform_match = /(ipad)/.exec(ua) ||
            /(iphone)/.exec(ua) ||
            /(android)/.exec(ua) ||
            [];

        var browser = match[1] || "";

        if (browser === "edge") {
            platform_match = [""];
        } else {
            if (ua.indexOf("windows phone") !== -1 || ua.indexOf("iemobile") !== -1) {

                // http://www.neowin.net/news/ie11-fakes-user-agent-to-fool-gmail-in-windows-phone-81-gdr1-update
                browser = "msie";
            }
            else if (ua.indexOf("like gecko") !== -1 && ua.indexOf('webkit') === -1 && ua.indexOf('opera') === -1 && ua.indexOf('chrome') === -1 && ua.indexOf('safari') === -1) {
                browser = "msie";
            }
        }

        if (browser === 'opr') {
            browser = 'opera';
        }

        return {
            browser: browser,
            platform: platform_match[0] || ""
        };
    };

    var userAgent = navigator.userAgent;

    var matched = uaMatch(userAgent);
    var browser = {};

    if (matched.browser) {
        browser[matched.browser] = true;
    }

    if (matched.platform) {
        browser[matched.platform] = true;
    }

    var userAgentLower = userAgent.toLowerCase();

    if (!browser.chrome && !browser.msie && !browser.edge && !browser.opera && userAgentLower.indexOf("webkit") !== -1) {
        browser.safari = true;
    }

    if (userAgentLower.indexOf("playstation 4") !== -1) {
        browser.ps4 = true;
        browser.tv = true;
    }

    browser.xboxOne = userAgentLower.indexOf('xbox') !== -1;
    browser.animate = typeof document !== 'undefined' && document.documentElement.animate != null;
    browser.tizen = userAgentLower.indexOf('tizen') !== -1 || self.tizen != null;
    browser.web0s = userAgentLower.indexOf('Web0S'.toLowerCase()) !== -1;
    browser.netcast = userAgentLower.indexOf('netcast') !== -1;
    browser.edgeUwp = browser.edge && (userAgentLower.indexOf('msapphost') !== -1 || userAgentLower.indexOf('webview') !== -1);

    if (!browser.tizen) {
        browser.orsay = userAgentLower.indexOf('smarthub') !== -1;
    }

    if (browser.tizen) {
        browser.sdkVersion = tizenVersion();
    }

    if (browser.edgeUwp) {
        browser.edge = true;
    }

    browser.tv = isTv();
    browser.operaTv = browser.tv && userAgentLower.indexOf('opr/') !== -1;

    browser.keyboard = hasKeyboard(browser);
    browser.supportsCssAnimation = supportsCssAnimation;

    browser.iOS = browser.ipad || browser.iphone || browser.ipod;

    if (!browser.iOS) {
        browser.osx = userAgentLower.indexOf('os x') !== -1;
    }

    browser.customBuiltInElements = ('customElements' in self) && !browser.iOS && !browser.safari && customElements.upgrade;

    browser.chromecast = browser.chrome && userAgentLower.indexOf('crkey') !== -1;

    return browser;
});