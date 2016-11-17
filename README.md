Predicting number of stars based on readmes of github projects. Not really working obviously.

1. install dependencies
 pip install -r requirements.txt
 npm install
2. get all packages from npm (only 1k that have github repo will be picked by random)
 wget registry.npmjs.org/-/all -O data/all
3. start postgres db for some intermediate state
 docker-compose up
4. You need to set DATABASE (postgres url) and GITHUB_TOKEN (of your github app, for rate limiting) in the environment 
5. parse the 1k samples and saves them to db
 node --max-old-space-size=2048 src/index.js
6. get readmes and github meta data (stars and time_alive) for samples in the db. Is done sequentially (so I do not stumble upon some rate limiting), so can take a few minutes.
 node src/githubData.js
7. train
 python src/train.py
