import os
from flask import Flask, render_template
import mysql.connector


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
    full_filename = os.path.join(app.config['UPLOAD_FOLDER'], 'csgo-ak-47-fire-serpent-skin-hd-wallpaper-1920x1200-46.jpg')
    return render_template("index.html",img_url=full_filename)


@app.route('/player')
def plater_stats():
    cursor = conn.cursor()
    cursor.execute("select * from player_stats")
    players = cursor.fetchall()
    player_list = []
    my_data = [{'id': 1, 'name': 'Frank'}, {'id': 2, 'name': 'Rakesh'}]

    for i in players:
        obj = PlayerObj()
        obj.id = i[0]
        obj.title = i[1]
        obj.count = i[2]
        obj.name = i[3]
        obj.image_url = i[4]
        player_list.append(obj)
        # print(type(player_list))
    # print(player_list[0])
    return render_template('player.html', player_list=player_list)


class PlayerObj:
    def __int__(self):
        self.id = None
        self.title = None
        self.count = None
        self.name = None
        self.image_url = None


if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
