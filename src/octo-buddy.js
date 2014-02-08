$(function(){
    var base_url="https://api.github.com/repos/" + localStorage["repo"] + "/pulls";
    var pull_template = $("#pull_template").text();

    var token = localStorage["token"];
    var user = localStorage["user"];
    var repo = localStorage["repo"];

    var $pulls = $("#pulls");
    var $reviews = $("#reviews");

    var regex = /@\S+/ig

    function count_plus_ones(pull, last_commit_time) {
        // Check for +1's
        $.getJSON(pull.comments_url + "?access_token=" + token
            , function(comments) {
                for(var j in comments) {
                    var ts = Date.parse(comments[j].updated_at);
                    if (ts > last_commit_time) {
                        if (comments[j].body.indexOf("+1") > -1 ||
                            comments[j].body.indexOf(":b") > -1) {
                            console.log(pull.number + " +1 " + comments[j].user.login);
                            var img = $('#pull_' + pull.number + ' img[title="' + comments[j].user.login + '"]');
                            var canvas = $('<canvas width="20px" height="20px"></canvas>');
                            //console.log(img);
                            if (img.length) {
                                var ctx = canvas[0].getContext("2d");
                                ctx.font = "bold 16px Arial";
                                ctx.fillStyle = "#0E410E";
                                ctx.globalAlpha = 0.5;
                                ctx.drawImage(img[0], 0, 0, 20, 20);
                                ctx.globalAlpha = 1.0;
                                ctx.fillText("+1", 0, 16);
                                canvas.attr("title", img.attr("title"));
                                img.replaceWith(canvas);
                            }
                        }
                    }
                }
            });
    }

    function calc_plus_ones(pull) {
        // Get last commit time
        $.getJSON(pull.commits_url + "?access_token=" + token
            ,function(commits){
                var last_commit_time = 0;
                for(var i in commits) {
                    var date_str = commits[i].commit.committer.date;
                    last_commit_time = Math.max(last_commit_time, Date.parse(date_str));
                }
                count_plus_ones(pull, last_commit_time)
            });
    }


    if (token && user && repo) {
        $.getJSON(base_url + "?access_token=" + token)
            .done(function(data){
                for(var i in data) {
                    var pull = data[i];

                    pull.ext = {
                        width : 300,
                        reviewers: []
                    }
                    var lines = pull.body.split('\n');
                    for(var j in lines) {
                        var line = lines[j].toLowerCase();
                        if (line.indexOf('cc') < 0 &&
                            line.indexOf('@') > -1) {
                            var matched = line.match(regex);
                            for (var k in matched) {
                                var login = matched[k].replace(/[@,]/g,'');
                                pull.ext.width -= 24;
                                pull.ext.reviewers.push({
                                    login: login,
                                    avatar_url: localStorage["cache.user." + login]
                                });
                            }
                        }
                    }

                    console.log(pull);
                    var $el = $(Mustache.render(pull_template, data[i]));
                    if (user === pull.user.login) {
                        $pulls.append($el);
                        $pulls.prev('h2').removeClass('hidden');
                    }
                    for(var j in lines) {
                        var line = lines[j].toLowerCase();
                        if (line.indexOf('cc') < 0 &&
                            line.indexOf('@' + user) > -1) {
                            $reviews.append($el);
                            $reviews.prev('h2').removeClass('hidden');
                        }
                    }
                    calc_plus_ones(pull);
                }
            })
            .fail(function(data){
                console.log("ERROR", data);
            });
    } else {
        $('#needs-config').removeClass('hidden');
    }
});
