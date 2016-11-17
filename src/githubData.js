const fs = require('fs');
const join = require('path').join;
const github = require('./github');
const Promise = require('bluebird');

require('./db')
    .then(db => {
        return db.select('github', 'id')
            .from('libs')
            .whereNull('stars')
            .then(libs => {
                return Promise.mapSeries(libs, (lib) => {
                    const repoName = lib.github;
                    console.log(`repo ${repoName}`);
                    const repo = github.getRepo(repoName.split('/')[0], repoName.split('/')[1]);

                    return repo
                        .getDetails()
                        .then(({data}) => {
                            return db('libs')
                                .where('id', lib.id)
                                .update({
                                    stars: data.stargazers_count,
                                    time_alive: Date.now() - (new Date(data.created_at)).getTime(),
                                });
                        })
                        .then(() => {
                            const readmeFile = `data/readmes/${repoName.split('/').join('__')}`;
                            if (!fs.existsSync(readmeFile)) {
                                return repo
                                    .getReadme(null, true)
                                    .then(({data}) => {
                                        console.log(`saving ${readmeFile}`);
                                        fs.writeFileSync(readmeFile, data);
                                    });
                            }
                        })
                        .catch(err => {
                            console.error(err.message);
                            if (err.response) {
                                console.error(err.response.status);
                                console.error(err.response.data.message);
                            }
                        });

                });
            })

    })
    .then(() => process.exit(0))
    .catch(err => {
        console.log(err);
        throw err;
    });
