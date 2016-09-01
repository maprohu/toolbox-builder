"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @class Images
 * This class loads images and keeps them stored.
 */
var Images = function () {
    function Images(callback) {
        _classCallCheck(this, Images);

        this.images = {};
        this.imageBroken = {};
        this.callback = callback;
    }

    /**
     * @param {string} url                      The Url to cache the image as 
      * @return {Image} imageToLoadBrokenUrlOn  The image object
     */


    _createClass(Images, [{
        key: "_addImageToCache",
        value: function _addImageToCache(url, imageToCache) {
            // IE11 fix -- thanks dponch!
            if (imageToCache.width === 0) {
                document.body.appendChild(imageToCache);
                imageToCache.width = imageToCache.offsetWidth;
                imageToCache.height = imageToCache.offsetHeight;
                document.body.removeChild(imageToCache);
            }

            this.images[url] = imageToCache;
        }

        /**
         * @param {string} url                      The original Url that failed to load, if the broken image is successfully loaded it will be added to the cache using this Url as the key so that subsequent requests for this Url will return the broken image
         * @param {string} brokenUrl                Url the broken image to try and load
         * @return {Image} imageToLoadBrokenUrlOn   The image object
         */

    }, {
        key: "_tryloadBrokenUrl",
        value: function _tryloadBrokenUrl(url, brokenUrl, imageToLoadBrokenUrlOn) {
            var _this = this;

            //If any of the parameters aren't specified then exit the function because nothing constructive can be done
            if (url === undefined || brokenUrl === undefined || imageToLoadBrokenUrlOn === undefined) return;

            //Clear the old subscription to the error event and put a new in place that only handle errors in loading the brokenImageUrl
            imageToLoadBrokenUrlOn.onerror = function () {
                console.error("Could not load brokenImage:", brokenUrl);
                //Add an empty image to the cache so that when subsequent load calls are made for the url we don't try load the image and broken image again
                _this._addImageToCache(url, new Image());
            };

            //Set the source of the image to the brokenUrl, this is actually what kicks off the loading of the broken image
            imageToLoadBrokenUrlOn.src = brokenUrl;
        }

        /**
         * @return {Image} imageToRedrawWith The images that will be passed to the callback when it is invoked
         */

    }, {
        key: "_redrawWithImage",
        value: function _redrawWithImage(imageToRedrawWith) {
            if (this.callback) {
                this.callback(imageToRedrawWith);
            }
        }

        /**
         * @param {string} url          Url of the image
         * @param {string} brokenUrl    Url of an image to use if the url image is not found
         * @return {Image} img          The image object
         */

    }, {
        key: "load",
        value: function load(url, brokenUrl, id) {
            var _this2 = this;

            //Try and get the image from the cache, if successful then return the cached image   
            var cachedImage = this.images[url];
            if (cachedImage) return cachedImage;

            //Create a new image
            var img = new Image();

            //Subscribe to the event that is raised if the image loads successfully 
            img.onload = function () {
                //Add the image to the cache and then request a redraw
                _this2._addImageToCache(url, img);
                _this2._redrawWithImage(img);
            };

            //Subscribe to the event that is raised if the image fails to load
            img.onerror = function () {
                console.error("Could not load image:", url);
                //Try and load the image specified by the brokenUrl using
                _this2._tryloadBrokenUrl(url, brokenUrl, img);
            };

            //Set the source of the image to the url, this is actuall what kicks off the loading of the image
            img.src = url;

            //Return the new image
            return img;
        }
    }]);

    return Images;
}();

exports.default = Images;