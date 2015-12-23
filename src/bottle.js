!(function startBottleService (root) {

  if (!root.navigator) {
    console.error('Missing navigator');
    return;
  }

  if (!root.navigator.serviceWorker) {
    console.error('Sorry, not ServiceWorker feature, maybe enable it?');
    console.error('http://jakearchibald.com/2014/using-serviceworker-today/');
    return;
  }

  // TODO package using webpack

  function toString(x) {
    return typeof x === 'string' ? x : JSON.stringify(x);
  }

  function la(condition) {
    if (!condition) {
      var args = Array.prototype.slice.call(arguments, 1)
        .map(toString);
      throw new Error(args.join(' '));
    }
  }

  function isFunction(f) {
    return typeof f === 'function';
  }

  function isString(f) {
    return typeof f === 'string';
  }

  function isUnemptyString(s) {
    return isString(s) && s;
  }

  function getCurrentScriptFolder() {
    var scriptEls = document.getElementsByTagName( 'script' );
    var thisScriptEl = scriptEls[scriptEls.length - 1];
    var scriptPath = thisScriptEl.src;
    return scriptPath.substr(0, scriptPath.lastIndexOf( '/' ) + 1 );
  }

  var serviceScriptUrl = getCurrentScriptFolder() + 'bottle-service.js';
  var scope = '/';

  var send = function mockSend() {
    console.error('Bottle service not initialized yet')
  };

  function registeredWorker(registration) {
    la(registration, 'missing service worker registration');
    la(registration.active, 'missing active service worker');
    la(isFunction(registration.active.postMessage),
      'expected function postMessage to communicate with service worker');

    send = registration.active.postMessage.bind(registration.active);
    var info = '\nbottle-service - .\n' +
      'I have a valid service-turtle, use `bottleService` object to update cached page';
    console.log(info);

    /*
    function sendMock(url, options) {
      la(isUnemptyString(url), 'expected url pattern', url);

      if (typeof options === 'number') {
        options = {
          code: options
        };
      }

      la(options && options.code, 'expected at least return code', options);

      send({
        method: 'get',
        url: url,
        options: options
      });
    }
    */

    registration.active.onmessage = function messageFromServiceWorker(e) {
      console.log('received message from the service worker', e);
    };
  }

  function onError(err) {
    if (err.message.indexOf('missing active')) {
      // the service worker is installed
      window.reload();
    } else {
      console.error('bottle service error', err);
    }
  }

  root.navigator.serviceWorker.register(serviceScriptUrl, { scope: scope })
    .then(registeredWorker)
    .catch(onError);

  root.bottleService = {
    refill: function refill(id) {
      console.log('sending html back to the bottle service for element with id', id)
      var el = document.getElementById(id)
      la(el, 'could not find element with id', id)
      var html = el.innerHTML
      console.log(html)
      send({
        cmd: 'refill',
        html: html,
        id: id
      })
    },
    print: function print() {
      send({
        cmd: 'print'
      })
    },
    clear: function clear() {
      send({
        cmd: 'clear'
      })
    }
  }

}(window));
