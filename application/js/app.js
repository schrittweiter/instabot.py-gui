// # window size

var size = [480,800];
window.resizeTo(size[0],size[1]);
$(window).resize(function(){
    window.resizeTo(size[0],size[1]);
});

var app = angular.module('app', ['angular-carousel','ngTagsInput']);

app.controller('appController', function appController($scope) {

    // # default scope values

    $scope.states = {
        view_login: true,
        view_log: false,
        loader: false
    }

    // # get previous entered data

    $scope.bot = {
        'username':         localStorage.getItem('username'),
        'password':         localStorage.getItem('password'),
        'likes':            parseInt(localStorage.getItem('likes')),
        'likes_tag':        parseInt(localStorage.getItem('likes_tag')),
        'follows_day':      parseInt(localStorage.getItem('follows_day')),
        'unfollows_day':    parseInt(localStorage.getItem('unfollows_day')),
        'hashtags_white':   (localStorage.getItem('hashtags_white') ? localStorage.getItem('hashtags_white').split(',') : null),
        'hashtags_black':   (localStorage.getItem('hashtags_black') ? localStorage.getItem('hashtags_black').split(',') : null),
        'user_black':       (localStorage.getItem('user_black') ? localStorage.getItem('user_black').split(',') : null),
        'user_white':       (localStorage.getItem('user_white') ? localStorage.getItem('user_white').split(',') : null)
    }

    // # reset log

    $scope.logs = [];

    // # trigger license check

    $scope.checkLogin = function(bot) {

        // # store inputs in local storage

        localStorage.setItem('username',        bot.username);
        localStorage.setItem('password',        bot.password);
        localStorage.setItem('likes',           bot.likes);
        localStorage.setItem('likes_tag',       bot.likes_tag);
        localStorage.setItem('follows_day',     bot.follows_day);
        localStorage.setItem('unfollows_day',   bot.unfollows_day);
        
        if(bot.hashtags_white) {
            localStorage.setItem('hashtags_white',  (bot.hashtags_white ? Array.prototype.map.call(bot.hashtags_white, s => s.text).toString()  : null));
        }

        if(bot.hashtags_black) {
            localStorage.setItem('hashtags_black',  (bot.hashtags_black ? Array.prototype.map.call(bot.hashtags_black, s => s.text).toString()  : null));
        }

        if(bot.user_black) {
            localStorage.setItem('user_black',      (bot.user_black ? Array.prototype.map.call(bot.user_black, s => s.text).toString()  : null));
        }
        
        if(bot.user_white) {
            localStorage.setItem('user_white',      (bot.user_white ? Array.prototype.map.call(bot.user_white, s => s.text).toString()  : null));
        }

        // # set states
       
        $scope.states.view_login   = false;
        $scope.states.loader       = true;

        // # build json array

        $scope.options = {
            'username':         bot.username,
            'password':         bot.password,
            'likes':            bot.likes,
            'likes_tag':        bot.likes_tag,
            'follows_day':      bot.follows_day,
            'unfollows_day':    bot.unfollows_day,
            'hashtags_white':   (bot.hashtags_white ? Array.prototype.map.call(bot.hashtags_white, s => s.text).toString()  : null),
            'hashtags_black':   (bot.hashtags_black ? Array.prototype.map.call(bot.hashtags_black, s => s.text).toString()  : null),
            'user_black':       (bot.user_black ? Array.prototype.map.call(bot.user_black, s => s.text).toString()  : null),
            'user_white':       (bot.user_white ? Array.prototype.map.call(bot.user_white, s => s.text).toString()  : null)
        }

        // # login to instagram and start bot
        
        eel.login_instagram($scope.options);

    }

    // # Incorrect login credentials

    eel.expose(bot_incorret_login);
    function bot_incorret_login() {

        // # wrong credentials

        UIkit.notification('username and/or password wrong! please try again. In case you\'re using the 2 Factor-Auth, you have to turn it off for using instabot.py.', { status: 'danger' });
        
        // # set states
       	
       	$scope.$apply(function () {
            $scope.states.view_login  = true;
            $scope.states.loader        = false;
        });

    }

    // # Incorrect login credentials

    eel.expose(bot_corret_login);
    function bot_corret_login() {

        // # set states
       
        $scope.$apply(function () {
            $scope.states.view_login   = false;
            $scope.states.view_log     = true; 
            $scope.states.loader       = false; 
        });
    }

    // # output response

    eel.expose(bot_message);
    function bot_message(message, state = 'primary') {
        
        // # show notificaion
        
        UIkit.notification(message, { status: state });
    }

    // # store image to log

    eel.expose(bot_image);
    function bot_image(time,src) {
        $.ajax({
            url: 'http://api.instagram.com/oembed?url=http://'+src,
            dataType: "jsonp", // important
            cache: false,
            success: function(data) {
                $scope.$apply(function () {
                    $scope.logs = [];
                    $scope.logs.push(data);
                });

                console.log($scope.logs);
            }
        });
        
    }

    $scope.findHashTag = function(hashtag,compare,form) {
        
        var scope = angular.element('#hashtags_white').scope();
        var resultWrapper = '#'+form+ ' .results';

        $.get('https://d212rkvo8t62el.cloudfront.net/tag/'+hashtag, function( data ) {
            if(form == 'find_whitelist') {
                temp_tags = (scope ? scope.bot.hashtags_white : []);
            }


            tags_compare = Array.prototype.map.call(temp_tags, s => s.text).toString();
            console.log(tags_compare);

            if(data.results.length > 0) {
                $(resultWrapper).html('');
                $(resultWrapper).html('<div class="uk-alert-primary" uk-alert><a class="uk-alert-close" uk-close></a><p>Add hashtags to your whitelist by clicking them.</p></div>');
                $.each(data.results, function(i, item) {
                    if( tags_compare.split(',').indexOf(item.tag) > -1 ) {
                    } else {
                        $(resultWrapper).append('<span class="uk-label uk-label-primary hashtag" data-value="'+item.tag+'">#'+item.tag+'</span>');
                    }
                });
            } else {
                $(resultWrapper).html('');
                $(resultWrapper).html('<div class="uk-alert-danger" uk-alert><a class="uk-alert-close" uk-close></a><p>No matching hashtags found!</p></div>');
            }
        });
    };

    $(document).on('click','#find_whitelist .results .hashtag',function($scope){
        var scope = angular.element('#hashtags_white').scope();
        scope.bot.hashtags_white.push({text:$(this).data('value')});
        $(this).hide();
    });
    
});

// # store log from bot

eel.expose(bot_log);
function bot_log(message) {
    //console.log(message)
}


// # send info to chrome app console

eel.expose(bot_console);
function bot_console(message) {
    console.log(message);
}
