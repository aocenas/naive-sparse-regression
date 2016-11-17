from __future__ import unicode_literals
import os
import pickle
import io
import numpy as np
from records import Database
from nltk.stem import SnowballStemmer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import SVR
from sklearn.decomposition import TruncatedSVD, PCA
from sklearn.metrics import r2_score
from sklearn.linear_model import LinearRegression, Ridge

stemmer = SnowballStemmer('english')


def parse_readme(github):
    with io.open(path(github), 'r', encoding='utf8') as readme:
        data = readme.read().replace('\n', ' ')
    return ' '.join([stemmer.stem(word) for word in data.split()])


def has_file(row):
    file_name = '__'.join(row['github'].split('/'))
    return os.path.exists('data/readmes/' + file_name)


def path(github):
    file_name = '__'.join(github.split('/'))
    return 'data/readmes/' + file_name


def has_file(row):
    return os.path.exists(path(row.github))

if not os.path.isfile('data/data.pkl'):

    db = Database(os.environ['DATABASE'])
    rows = db.query('select github, stars, time_alive from libs')

    filtered = filter(has_file, rows)

    data = {
        'y': [],
        'x1': [],
        'x2': [],
    }

    for lib in filtered:
        data['y'].append(lib.stars)
        data['x1'].append(parse_readme(lib.github))
        data['x2'].append(int(lib.time_alive / 1000))

    pickle.dump(data, open("data/data.pkl", "w"))
else:
    data = pickle.load(open("data/data.pkl", "r"))

text_train, text_test, time_train, time_test, labels_train, labels_test =\
    train_test_split(data['x1'], data['x2'], data['y'], test_size=0.1, random_state=42)

vectorizer = TfidfVectorizer(sublinear_tf=True, max_df=0.5, stop_words='english')
text_train = vectorizer.fit_transform(text_train)
text_test = vectorizer.transform(text_test)

# print time_train
# features_train = [np.concatenate(*f) for f in zip(text_train, time_train)]
# features_test = [np.concatenate(*f) for f in zip(text_test, time_test)]

pca = TruncatedSVD(n_components=50, algorithm='arpack')
# pca = PCA(n_components=50)
features_train = pca.fit_transform(text_train)
features_test = pca.transform(text_test)

features_train = [np.concatenate([f[0], [f[1]]]) for f in zip(features_train, time_train)]
features_test = [np.concatenate([f[0], [f[1]]]) for f in zip(features_test, time_test)]

print features_train[0]

# print zip(features_train, time_train)[0]
# print np.array([time_train[0]])
# print np.array(features_train[0])
# print np.concatenate((np.array([time_train[0]]), np.array(features_train[0])))

# print features_test_transformed.shape
# clf = SVR()
clf = LinearRegression()
# clf = Ridge()
clf.fit(features_train, labels_train)

print r2_score(labels_test, clf.predict(features_test))


