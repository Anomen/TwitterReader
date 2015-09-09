define(function (require) {
    "use strict";

    var Backbone = require("backbone"),
        TweetsCollection = require("collections/TweetsCollection"),
        $        = require("jquery"),
        _        = require("underscore");

    return Backbone.Model.extend({
        defaults: {
            username: null,
            tweets: null,
            numberOfTweets: 25,
            from: null,
            to: null
        },
        initialize: function () {
            this.set("tweets", new TweetsCollection());
            this.on("change:username", this._resetTweets, this);
        },
        validate: function (attrs) {
            var errors = {};

            if (attrs.username.search(/^[0-9a-zA-Z]+$/) === -1) {
                errors.username = "Invalid entry.";
            }

            if (!_.isNumber(attrs.numberOfTweets)) {
                errors.numberOfTweets = "Invalid entry: it must be a number.";
            }

            if (attrs.from !== null && !_.isDate(attrs.from)) {
                errors.from = "Invalid date.";
            }

            if (attrs.to !== null && !_.isDate(attrs.to)) {
                errors.to = "Invalid date";
            }

            return _.size(errors) > 0 ? errors : false;
        },
        _resetTweets: function () {
            this.get("tweets").reset(null);
        },
        fetch: function () {
            var _this = this;

            Backbone.trigger("loading", this);

            $.ajax({
                url: "/twitter_server.php?url=" + encodeURIComponent("statuses/user_timeline.json?screen_name=" + this.get("username")),
                success: function (response) {
                    if (response.error || response.errors || !_.isArray(response)) {
                        _this.trigger("error", response.error || (response.errors && response.errors[0].message) || "An error occurred. Please retry with a different username.");
                    }
                    else {
                        var tweets = _.map(response, function (res) {
                            var isRetweeted = !!res.retweeted_status,
                                userInfo = isRetweeted ? res.retweeted_status.user : res.user;

                            return {
                                content: res.text,
                                createdAt: new Date(res.created_at),
                                id: res.id,
                                userName: userInfo.name,
                                userAvatar: userInfo.profile_image_url,
                                isRetweeted: isRetweeted
                            };
                        });

                        _this.get("tweets").reset(tweets);
                        _this.trigger("success");
                    }
                }
                // @TODO: error callback
            });
        }
    });
});