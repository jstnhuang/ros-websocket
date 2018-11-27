import 'eventemitter2/lib/eventemitter2.js';
import 'roslib/build/roslib.js';

import {PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * An element wrapping around
 * [roslibjs](https://github.com/RobotWebTools/roslibjs).
 * See the documentation and tutorials for roslibjs to learn the basics.
 *
 * This element represents the
 * [`ROSLIB.Ros`](http://robotwebtools.org/jsdoc/roslibjs/current/global.html#ROSLIB)
 * object.
 *
 * By default, this element will establish a connection with the server at the
 * same
 * hostname as the page, with port 9090:
 *
 *     <ros-websocket auto></ros-websocket>
 *
 * You can also specify a websocket URL explicitly:
 *
 *     <ros-websocket auto url="ws://localhost:9090"></ros-websocket>
 *
 * If the `auto` attribute is set, the element will try to establish a
 * connection immediately or whenever the URL changes.
 * You can manually connect by calling `connect()`.
 *
 * @demo demo/index.html
*/
class RosWebSocket extends PolymerElement {
  static get properties() {
    return {
      /**
       * If true, automatically connects to the websocket URL on startup and
       * whenever the URL changes.
       *
       * @type boolean
       */
      auto: {type: Boolean, value: false},

      /**
       * The URL of the websocket server to connect to. By default, it is the
       * same hostname as the page, at port 9090.
       * For example, if the page URL is http://robotsite.com/foo, then the
       * default websocket URL is ws://robotsite.com:9090.
       *
       * @type string
       */
      url: {
        type: String,
        value: function() {
          var hostname = window.location.hostname;
          var protocol = 'ws:';
          if (window.location.protocol == 'https:') {
            protocol = 'wss:'
          }
          return protocol + '//' + hostname + ':9090';
        },
        notify: true
      },

      /**
       * The ROSLIB.Ros object this elements wraps.
       */
      ros: {type: Object, notify: true}

      /**
       * The `connection` event is fired when the connection to the websocket
       * server is established.
       *
       * @event connection
       */

      /**
       * The `error` event is fired if there was an error connecting to the
       * websocket server.
       *
       * @event error
       */

      /**
       * The `close` event is fired when the connection to the websocket server
       * is closed.
       *
       * @event close
       */
    };
  }

  static get observers() { return ['_connectionParamsChanged(auto, url)'] }

  /**
   * Connects to the websocket server given by the url attribute.
   */
  connect() {
    if (this.ros && this.ros.isConnected) {
      this.ros.close();
    }
    this.ros = new ROSLIB.Ros({url: this.url});
    var that = this;
    this.ros.on('connection', function() {
      that.dispatchEvent(new CustomEvent('connection'));
    });
    this.ros.on('error', function(error) {
      that.dispatchEvent(new CustomEvent('error'));
    });
    this.ros.on(
        'close', function() { that.dispatchEvent(new CustomEvent('close')); });
  }

  _connectionParamsChanged(auto, url) {
    if (auto && url) {
      this.connect()
    }
  }
}

window.customElements.define('ros-websocket', RosWebSocket);
