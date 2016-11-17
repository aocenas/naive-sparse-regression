const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let all_with_repository;
let sample;

if (!fs.existsSync('data/sample')) {
    if (!fs.existsSync('data/all_with_repository')) {
        const all = fs.readFileSync('data/all');
        const all_json = JSON.parse(all);
        delete all_json._updated;

        console.log(Object.keys(all_json).length);

        Object.keys(all_json).forEach(key => {
            const val = all_json[key];
            if (!(val.repository && val.repository.url && val.repository.url.indexOf('github') > -1)) {
                delete all_json[key];
            }
        });

        fs.writeFileSync('data/all_with_repository', JSON.stringify(all_json));

        all_with_repository = all_json;
    } else {
        all_with_repository = JSON.parse(fs.readFileSync('data/all_with_repository'));
    }

    console.log(Object.keys(all_with_repository).length);

    sample = _.sampleSize(all_with_repository, 1000);
    fs.writeFileSync('data/sample', JSON.stringify(sample));

} else {
    sample = JSON.parse(fs.readFileSync('data/sample'));
}


const repoRe = /github\.com[\/:]([\w-]*)\/([\w-]*)/;

require('./db')
    .then(db =>
        db.batchInsert(
            'libs',
            sample.map(lib => {

                const github = lib.repository.url.match(repoRe).slice(1, 3).join('/');
                return {
                    raw: lib,
                    github,
                };
            })
        )
    )
    .then(() => process.exit(0));




