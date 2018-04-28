#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import time
import posixpath
import sys

import eel

from src import InstaBot
from src.check_status import check_status
from src.feed_scanner import feed_scanner
from src.follow_protocol import follow_protocol
from src.unfollow_protocol import unfollow_protocol

import requests, json

# init eel

eel.init('application')

# check instagram login credentials

@eel.expose
def login_instagram(data):

    if data["likes"]:
        ig_instagram_likes = int(float(data["likes"]))
    else:
        ig_instagram_likes = 1000

    if data["likes_tag"]:
        ig_instagram_likes_hashtag = int(float(data["likes_tag"]))
    else:
        ig_instagram_likes_hashtag = 50

    if data["follows_day"]:
        ig_instagram_follows = int(float(data["follows_day"]))
    else:
        ig_instagram_follows = 300

    if data["unfollows_day"]:
        ig_instagram_unfollows = int(float(data["unfollows_day"]))
    else:
        ig_instagram_unfollows = 300

    ig_hashtags_white = data["hashtags_white"]
    if ig_hashtags_white:
        ig_hashtags_white = ig_hashtags_white.split(",")
        ig_hashtags_white = (','.join(item for item in ig_hashtags_white))
        ig_hashtags_white = ig_hashtags_white.split(",")
    else:
        ig_hashtags_white = []    

    ig_hashtags_black = data["hashtags_black"]
    if ig_hashtags_black:
        ig_hashtags_black = ig_hashtags_black.split(",")
        ig_hashtags_black = (','.join("'" + item + "'" for item in ig_hashtags_black))
        ig_hashtags_black = ig_hashtags_black.split(",")
    else:
        ig_hashtags_black = []

    ig_user_black = data["user_black"]
    if ig_user_black:
        ig_user_black = ig_user_black.split(",")
        ig_user_black = (','.join(item for item in ig_user_black))
        ig_user_black = ig_user_black.split(",")
    else:
        ig_user_black = []

    ig_user_white = data["user_white"]
    if ig_user_white:
        ig_user_white = ig_user_white.split(",")
        ig_user_white = (','.join(item for item in ig_user_white))
        ig_user_white = ig_user_white.split(",")#
    else:
        ig_user_white = []

    bot = InstaBot(
        login=data["username"],
        password=data["password"],
        like_per_day=ig_instagram_likes,
        comments_per_day=0,
        tag_list=ig_hashtags_white,
        tag_blacklist=ig_hashtags_black,
        user_blacklist={},
        max_like_for_one_tag=ig_instagram_likes_hashtag,
        follow_per_day=ig_instagram_follows,
        follow_time=1 * 60,
        unfollow_per_day=ig_instagram_unfollows,
        unfollow_break_min=15,
        unfollow_break_max=30,
        log_mod=2,
        unwanted_username_list=ig_user_black,
        unfollow_whitelist=ig_user_white )

    if bot.login_status:
        eel.bot_corret_login()
        
        while True:
            bot.new_auto_mod()
        else:
            bot.logout()
            eel.bot_message('instabot.py gui crashed - please restart!','danger')

    else:

        # if login incorrect cancel

        eel.bot_incorret_login()

# check instagram login credentials

@eel.expose
def stop_bot():
	bot.logout()


web_app_options = {
    'mode': "chrome-app",
    'port': 8080,
    'chromeFlags': ["--start-fullscreen","--window-size=640,960"]
}

eel.start('application.html', options=web_app_options)
