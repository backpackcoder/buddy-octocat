// Saves options to localStorage.
function save_options() {
  localStorage["token"] = $("#token").val();
  localStorage["user"] = $("#user").val();
  $('#status').removeClass("hidden")
  setTimeout(function() { $('#status').addClass("hidden"); }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    $("#token").val( localStorage["token"] );
    $("#user").val( localStorage["user"] );
}

$(function(){
    restore_options();
    $('button').click(function(ev){
        ev.preventDefault();
        save_options();
    });
});