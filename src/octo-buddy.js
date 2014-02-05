$(function(){
    var base_url="https://api.github.com/repos/vs-networks/vsn/pulls";
    var pull_template = $('#pull_template').text();

    var token = localStorage["token"];
    var user = localStorage["user"];

    if (token && user) {
        //$('#needs-config').addClass('hidden');
        $.getJSON(base_url + "?access_token=" + token)
            .done(function(data){
                for(var i in data) {
                    var pull = data[i];
                    var $el = $( Mustache.render(pull_template, data[i]));
                    if (user === pull.user.login) {
                        $('#my-pulls').append($el);
                        $('#my-pulls').prev('h2').removeClass('hidden');
                    }
                    var lines = pull.body.split('\n');
                    for(var j in lines) {
                        var line = lines[j].toLowerCase();
                        if (line.indexOf('cc') < 0 &&
                            line.indexOf('@' + user) > 0) {
                            $("#my-reviews").append($el);
                            $("#my-reviews").prev('h2').removeClass('hidden');
                        }
                    }
                }
            })
            .fail(function(data){
                $('#needs-config').text(data).removeClass("hidden");

            });
    } else {
        $('#needs-config').removeClass('hidden');
    }
});
