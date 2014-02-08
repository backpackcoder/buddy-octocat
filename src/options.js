// Saves options to localStorage.
function save_options() {
  localStorage["token"] = $("#token").val();
  localStorage["user"] = $("#user").val();
  localStorage["repo"] = $("#repo").val();
  $('#status').removeClass("hidden");
  setTimeout(function() { $('#status').addClass("hidden"); }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    $("#token").val( localStorage["token"] );
    $("#user").val( localStorage["user"] );
    load_repos();
}


function update_user_img(name, url) {
    localStorage["cache.user." + name] = url;
}

function load_users(org) {
    $.getJSON("https://api.github.com/orgs/" + org + "/members?access_token=" + $("#token").val(),
        function(members) {
            for(var i in members) {
                update_user_img(members[i].login, members[i].avatar_url);
            }
        });
}

var repo_list = [], old_cursor = null;
function load_repos() {
    repo_list = [];
    old_cursor = $('#repo').css("cursor");
    $('#repo')
        .empty()
        .append($('<option>loading...</option>'))
        .prop("disabled", true)
        .css('cursor', 'wait');
    $.getJSON("https://api.github.com/user?access_token=" + $("#token").val(),
        function(user){
            $('#user').val(user.login);
            var repos_loaded = 0, total_repos = 1;
            function repo_load_complete() {
                repos_loaded++;
                if (repos_loaded == total_repos) {
                    $('#repo')
                        .empty()
                        .prop("disabled", false)
                        .css("cursor", old_cursor);
                    for(var i=0; i < repo_list.length; i++){
                        if (repo_list[i] == localStorage["repo"]) {
                            $('#repo')
                                .append($('<option selected="selected">' + repo_list[i] + '</option>'))
                        } else {
                            $('#repo')
                                .append($('<option>' + repo_list[i] + '</option>'))
                        }
                    }
                }
            }

            function load_repos(org) {
                $.getJSON("https://api.github.com/orgs/" + org + "/repos?access_token=" + $("#token").val(),
                    function(repos) {
                        for(var i=0; i < repos.length; i++){
                            repo_list.push(org + '/' + repos[i].name);
                        }
                        repo_load_complete();
                });
            }

            $.getJSON("https://api.github.com/user/orgs?access_token=" + $("#token").val(),
                function(orgs){
                    total_repos += orgs.length;
                    for(var i=0; i < orgs.length; i++) {
                        load_repos(orgs[i].login);
                        load_users(orgs[i].login);
                    }
            });

            $.getJSON("https://api.github.com/user/repos?access_token=" + $("#token").val(),
                function(repos){
                    for(var i=0; i < repos.length; i++) {
                        repo_list.push(user.login + '/' + repos[i].name);
                    }
                    repo_load_complete();
                });
        });
};

$(function(){
    restore_options();

    $('button').click(function(ev){
        ev.preventDefault();
        save_options();
    });

    $('#token').change(function(){
        load_repos();
    })
});