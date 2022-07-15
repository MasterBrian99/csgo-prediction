import os
from flask import Flask, render_template, request
import mysql.connector
import numpy as np
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import confusion_matrix
import datetime

app = Flask(__name__)

conn = mysql.connector.connect(host="127.0.0.1",
                               user="root",
                               password="1234",
                               database="csgo_data"
                               )
PEOPLE_FOLDER = os.path.join('static')
app.config['UPLOAD_FOLDER'] = PEOPLE_FOLDER


@app.route('/')
def hello_world():  # put application's code here
    full_filename = os.path.join(app.config['UPLOAD_FOLDER'],
                                 'csgo-ak-47-fire-serpent-skin-hd-wallpaper-1920x1200-46.jpg')
    return render_template("index.html", img_url=full_filename)


@app.route('/player')
def plater_stats():
    cursor = conn.cursor()
    cursor.execute("select * from player_stats")
    players = cursor.fetchall()
    player_list = []
    for i in players:
        obj = PlayerObj()
        obj.id = i[0]
        obj.title = i[1]
        obj.count = i[2]
        obj.name = i[3]
        obj.image_url = i[4]
        player_list.append(obj)
        player_table=  get_player_table()
    return render_template('player.html', player_list=player_list,player_table= player_table)


@app.route('/team', methods=["GET", "POST"])
def team_info():
    if request.method == "POST":
        country_1 = request.form['country_1']
        country_2 = request.form['country_2']
        map = request.form['map']
        prediction_team_win(country_1, country_2, map)

        return render_template("team.html", ButtonPressed='new result')
    return render_template("team.html", ButtonPressed='hello')


class PlayerObj:
    def __int__(self):
        self.id = None
        self.title = None
        self.count = None
        self.name = None
        self.image_url = None


class PlayerTableObj:
    def __int__(self):
        self.id=None
        self.name=None
        self.country=None
        self.maps_played=None
        self.rounds_played=None
        self.kd_ratio=None
        self.rating=None
        self.total_kills=None


def get_player_table():
    print("asd")
    cursor = conn.cursor()
    cursor.execute("select * from player_table")
    players = cursor.fetchall()
    player_list = []
    for i in players:
        print(i)
        obj = PlayerTableObj()
        obj.id=i[0]
        obj.name=i[1]
        obj.country=i[2]
        obj.maps_played=i[3]
        obj.rounds_played=i[4]
        obj.kd_ratio=i[5]
        obj.rating=i[6]
        obj.total_kills=i[7]
        player_list.append(obj)
    return player_list

def prediction_team_win(team_1,team_2,map):
    print(team_1)
    print(team_2)
    print(map)

if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
