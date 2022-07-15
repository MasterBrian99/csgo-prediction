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
        player_table = get_player_table()
    return render_template('player.html', player_list=player_list, player_table=player_table)


@app.route('/team', methods=["GET", "POST"])
def team_info():
    if request.method == "POST":
        country_1 = request.form['country_1']
        country_2 = request.form['country_2']
        map = request.form['map']
        data= prediction_team_win(country_1, country_2, map)
        return render_template("team.html", ButtonPressed='new result',data=data)
    return render_template("team.html", ButtonPressed='hello',data="")


class PlayerObj:
    def __int__(self):
        self.id = None
        self.title = None
        self.count = None
        self.name = None
        self.image_url = None


class PlayerTableObj:
    def __int__(self):
        self.id = None
        self.name = None
        self.country = None
        self.maps_played = None
        self.rounds_played = None
        self.kd_ratio = None
        self.rating = None
        self.total_kills = None


class TeamPrediction:
    def __int__(self):
        self.team = None
        self.accuracy = None


def get_player_table():
    print("asd")
    cursor = conn.cursor()
    cursor.execute("select * from player_table")
    players = cursor.fetchall()
    player_list = []
    for i in players:
        print(i)
        obj = PlayerTableObj()
        obj.id = i[0]
        obj.name = i[1]
        obj.country = i[2]
        obj.maps_played = i[3]
        obj.rounds_played = i[4]
        obj.kd_ratio = i[5]
        obj.rating = i[6]
        obj.total_kills = i[7]
        player_list.append(obj)
    return player_list


def prediction_team_win(team_1, team_2, map):
    print(team_1)
    print(team_2)
    print(map)
    result =learn(team_1, team_2, map)
    return  result


def learn(team_1, team_2, _map):
    print("Start")
    dataset = pd.read_csv('./static/results.csv')
    dataset['date'] = pd.to_datetime(dataset['date'])
    _2019 = datetime.date(2019, 1, 1)
    _2019 = pd.to_datetime(_2019)
    dataset = dataset.loc[dataset['date'] >= _2019]
    dataset_p1 = dataset.loc[dataset['team_1'] == team_1]
    dataset_p2 = dataset.loc[dataset['team_2'] == team_1]
    dataset_p3 = dataset.loc[(dataset['team_1'] == team_2) & (dataset['team_2'] != team_1)]
    dataset_p4 = dataset.loc[(dataset['team_2'] == team_2) & (dataset['team_1'] != team_1)]
    dataset = pd.concat([dataset_p1, dataset_p2, dataset_p3, dataset_p4])
    X = dataset.iloc[:, [1, 2, 3, 14, 15]].values
    y = dataset.iloc[:, 6].values
    X_test = np.array([[team_1, team_2, _map, 867, 583]])
    # Encoding categorical data
    print('Encoding data...')
    onehotencoder = OneHotEncoder()
    X_new_transformed = onehotencoder.fit_transform(X[:, 0:2]).toarray()
    X_new_transformed = X_new_transformed[:, 1:]
    X_transformed = X[:, [3, 4]]
    X_transformed = np.concatenate((X_transformed, X_new_transformed), axis=1)
    X_test_new_transformed = onehotencoder.transform(X_test[:, 0:2]).toarray()
    X_test_new_transformed = X_test_new_transformed[:, 1:]
    X_test_transformed = X_test[:, [3, 4]]
    X_test_transformed = np.concatenate((X_test_transformed, X_test_new_transformed), axis=1)
    print('Success!')
    print('Splitting the dataset...')
    # Splitting the dataset into the Training set and Test set
    X_train, X_test_old, y_train, y_test_old = train_test_split(X_transformed, y, test_size=1)
    print('Success!')
    print('Fitting XGBoost...')
    # Fitting XGBoost
    classifier = XGBClassifier(n_estimators=500, learning_rate=0.00001,
                               max_depth=7, subsample=0.8, colsample_bytree=0.8, gamma=5)
    classifier.fit(X_train, y_train)
    print('Success!')
    print('Predicting')
    # Predicting
    y_pred = classifier.predict(X_test_transformed)
    print('Success!')
    accuracy_final = accuracy(X, y)
    # Predicting the Test set results
    print(f'Accuracy of the algorithm: {accuracy_final}%')
    team_obj=TeamPrediction()
    if y_pred == 2:
        print(f'Algorithm predicts that {team_1} will win {team_2}.')
        team_obj.team=team_1
        team_obj.accuracy=accuracy_final
    elif y_pred == 1:
        print(f'Algorithm predicts that {team_2} will win {team_1}.')
        team_obj.team = team_2
        team_obj.accuracy = accuracy_final
    else:
        print('An unexpected error has occured.')
        team_obj.team = "Failed"
        team_obj.accuracy = "0"
    return team_obj


# Learning accuracy function, %
def accuracy(X, y):
    print('Evaluating accuracy...')
    # Encoding categorical data
    onehotencoder = OneHotEncoder()
    X_new = onehotencoder.fit_transform(X[:, 0:2]).toarray()
    X_new = X_new[:, 1:]
    X = X[:, [3, 4]]
    X = np.concatenate((X, X_new), axis=1)

    # Splitting the dataset into the Training set and Test set
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1, random_state=0)

    # Fitting XGBoost
    classifier = XGBClassifier(n_estimators=500, learning_rate=0.00001,
                               max_depth=7, subsample=0.8, colsample_bytree=0.8, gamma=5)
    classifier.fit(X_train, y_train)

    # Predicting the Test set results
    y_pred = classifier.predict(X_test)

    # Making confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    cm_sum = cm[0][0] + cm[0][1] + cm[1][0] + cm[1][1]
    avg_acc = (cm[0][0] + cm[1][1]) / cm_sum * 100
    # Returning average accuracy of the algorithm
    return avg_acc


if __name__ == '__main__':
    app.run(debug=True, use_reloader=True)
