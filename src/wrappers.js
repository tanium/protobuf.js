"use strict";

/**
 * Wrappers for common types.
 * @type {Object.<string,IWrapper>}
 * @const
 */
var wrappers = exports;

var Message = require("./message");

/**
 * From object converter part of an {@link IWrapper}.
 * @typedef WrapperFromObjectConverter
 * @type {function}
 * @param {Object.<string,*>} object Plain object
 * @returns {Message<{}>} Message instance
 * @this Type
 */

/**
 * To object converter part of an {@link IWrapper}.
 * @typedef WrapperToObjectConverter
 * @type {function}
 * @param {Message<{}>} message Message instance
 * @param {IConversionOptions} [options] Conversion options
 * @returns {Object.<string,*>} Plain object
 * @this Type
 */

/**
 * Common type wrapper part of {@link wrappers}.
 * @interface IWrapper
 * @property {WrapperFromObjectConverter} [fromObject] From object converter
 * @property {WrapperToObjectConverter} [toObject] To object converter
 */

// Custom wrapper for Any
wrappers[".google.protobuf.Any"] = {
    fromObject: function(object) {
        // unwrap value type if mapped
        if (object && object["@type"]) {
            // Only use fully qualified type name after the last '/'
            var name = object["@type"].substring(object["@type"].lastIndexOf("/") + 1);
            var type = this.lookup(name);
            /* istanbul ignore else */
            if (type) {
                // type_url does not accept leading "."
                var type_url = object["@type"].charAt(0) === "." ? object["@type"].substr(1) : object["@type"];
                // type_url prefix is optional, but path seperator is required
                if (type_url.indexOf("/") === -1) {
                    type_url = "/" + type_url;
                }
                return this.create({
                    type_url: type_url,
                    value: type.encode(type.fromObject(object)).finish()
                });
            }
        }

        return this.fromObject(object);
    },

    toObject: function(message, options) {
        // Default prefix
        var googleApi = "type.googleapis.com/";
        var prefix = "";

        // decode value if requested and unmapped
        if (options && options.json && message.type_url && message.value) {
            // Only use fully qualified type name after the last '/'
            var name = message.type_url.substring(message.type_url.lastIndexOf("/") + 1);
            // Separate the prefix used
            prefix = message.type_url.substring(0, message.type_url.lastIndexOf("/") + 1);
            var type = this.lookup(name);
            /* istanbul ignore else */
            if (type) message = type.decode(message.value);
        }

        // wrap value if unmapped
        if (!(message instanceof this.ctor) && message instanceof Message) {
            var object = message.$type.toObject(message, options);
            var messageName =
                message.$type.fullName[0] === "." ? message.$type.fullName.substr(1) : message.$type.fullName;
            // Default to type.googleapis.com prefix if no prefix is used
            if (prefix === "") {
                prefix = googleApi;
            }
            var name = prefix + messageName;
            object["@type"] = name;
            return object;
        }

        return this.toObject(message, options);
    }
};

// Custom wrapper for Timestamp
wrappers[".google.protobuf.Timestamp"] = {
    fromObject: function(object) {
        if (typeof object === "string") {
            const ts = new Date(object);
            const seconds = Math.floor(ts.getTime() / 1000);
            const nanos = ts.getMilliseconds() * 1000000;
            return this.create({
                seconds: seconds,
                nanos: nanos
            });
        } else if (object instanceof Date) {
            const seconds = Math.floor(object.getTime() / 1000);
            const nanos = object.getMilliseconds() * 1000000;
            return this.create({
                seconds: seconds,
                nanos: nanos
            });
        }

        return this.fromObject(object);
    },

    toObject: function(message, options) {
        if (options && options.json) {
            return new Date(message.seconds * 1000 + message.nanos / 1000000);
        }
        return this.toObject(message, options);
    }
};

// Custom wrapper for Duration
wrappers[".google.protobuf.Duration"] = {
    fromObject: function(object) {
        if (typeof object === "string") {
            const unit = function() {
                if (object.slice(-1) == "s") return 1;
                if (object.slice(-1) == "m") return 60;
                if (object.slice(-1) == "h") return 60 * 60;
                if (object.slice(-1) == "d") return 60 * 60 * 24;
                throw new Error("invalid duration unit : must be one of s, m, h, or d")
            }();
            const value = parseInt(object.slice(0,-1));
            const seconds = value * unit;
            return this.create({
                seconds: seconds,
                nanos: 0,
            });
        }
        return this.fromObject(object);
    },

    toObject: function(message, options) {
        if (options && options.json && message.nanos == 0) {
            return message.seconds.toString() + "s"
        }
        return this.toObject(message, options);
    }
};
