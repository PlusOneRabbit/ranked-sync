const fs = require('fs');
const axios = require('axios');
const JSZip = require('jszip');
const sha1 = require('sha1');

const version = require('./package.json').version;

const config = JSON.parse(fs.readFileSync('./config.json'));

const headers = {
    'User-Agent': `RankedSync/${version}`
}

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

function sanitizeName(name) {
    const illegal = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
    for (const char of illegal) {
        name = name.split(char).join('');
    }
    return name;
}

module.exports = async () => {
    let songs = [];

    console.log(`Ranked Sync v${version}`);

    console.log('Querying ScoreSaber...');

    for (let i = 0; i < config.count / 20; i++) {
        const response = await axios.get(`https://scoresaber.com/api.php?function=get-leaderboards&cat=3&page=${i + 1}&limit=20&ranked=1`, { headers });

        songs = songs.concat(response.data.songs);

        await sleep(100);
    }

    console.log(`Collected ${songs.length} songs`);

    let mapperTally = [];
    const levelAuthorRegex = /(.+?)(?:\s*(?:[&,/\r\n]|(?:and))+\s*)/g; // This disgusting regex will isolate mapper names from the level author field, excluding separators
    let levelAuthors = songs.map(song => song.levelAuthorName);
    levelAuthors.forEach(levelAuthor => {
        const mappers = [...levelAuthor.matchAll(levelAuthorRegex)].map(matches => matches[1].toLowerCase());
        mappers.forEach(mapper => {
            let index = mapperTally.findIndex(element => element.name === mapper);
            if (index < 0) {
                mapperTally.push({ name: mapper, count: 1 });
            } else {
                ++mapperTally[index].count;
            }
        });
    });
    mapperTally.sort((a, b) => b.count - a.count);

    const lowestStarRating = songs[songs.length - 1].stars;
    let skipped = 0;
    let downloaded = 0;

    console.log('Checking for existing maps...');

    const files = fs.readdirSync(`${config.install}\\Beat Saber_Data\\CustomLevels`);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const folder = `${config.install}\\Beat Saber_Data\\CustomLevels\\${file}`;
        
        let infoRaw = null, info = null, beatmapsRaw = '';
        if (fs.existsSync(`${folder}\\Info.dat`)) {
            infoRaw = fs.readFileSync(`${folder}\\Info.dat`);
            info = JSON.parse(infoRaw);
        }
        if (fs.existsSync(`${folder}\\info.dat`)) {
            infoRaw = fs.readFileSync(`${folder}\\info.dat`);
            info = JSON.parse(infoRaw);
        }
        if (info) {
            if (info._difficultyBeatmapSets) {
                for (let difficultyBeatmapSet of info._difficultyBeatmapSets) {
                    if (difficultyBeatmapSet._difficultyBeatmaps) {
                        for (let difficultyBeatmap of difficultyBeatmapSet._difficultyBeatmaps) {
                            if (fs.existsSync(`${folder}\\${difficultyBeatmap._beatmapFilename}`)) {
                                beatmapsRaw += fs.readFileSync(`${folder}\\${difficultyBeatmap._beatmapFilename}`);
                            }
                        }
                    } else {
                        console.log(`${file} has no difficulty beatmaps on a set!`);
                    }
                }
            } else {
                console.log(`${file} has no difficulty beatmap sets!`);
            }
        } else {
            // Not a map folder
            files.splice(i, 1);
            continue;
        }

        const hash = sha1(infoRaw + beatmapsRaw);

        let didSkip = false;

        let index;
        do {
            index = songs.findIndex(song => song.id.toLowerCase() === hash);
            if (index >= 0) {
                didSkip = true;
                songs.splice(index, 1);
                ++skipped;
            }
        } while (index >= 0);
        
        if (didSkip) {
            console.log(`${file} already downloaded, skipping`);
        }
    }

    console.log(`Skipped: ${skipped}, remaining: ${songs.length}`);

    console.log('Querying BeatSaver...');

    let newSkipped = 0;

    for (let song of songs) {
        const response = await axios.get(`https://beatsaver.com/api/maps/by-hash/${song.id}`, { headers });

        axios.get(`https://beatsaver.com${response.data.downloadURL}`, { headers, responseType: 'arraybuffer' }).then(downloadResponse => {
            const name = `${response.data.key} (${sanitizeName(response.data.metadata.songName)} - ${sanitizeName(response.data.metadata.levelAuthorName)})`;
            const folder = `${config.install}\\Beat Saber_Data\\CustomLevels\\${name}`;

            if (fs.existsSync(folder)) {
                console.log(`Already downloaded: ${name}`);
                ++newSkipped;
                return;
            } else {
                fs.mkdirSync(folder, { recursive: true });
            }

            console.log(`Now downloading: ${name}`);

            JSZip.loadAsync(downloadResponse.data).then(zip => {
                for (let file in zip.files) {
                    zip.files[file].nodeStream().pipe(fs.createWriteStream(`${folder}\\${file}`));
                }

                console.log(`Downloaded: ${name}`);
                ++downloaded;
            });
        });
        await sleep(100);
    }

    while (newSkipped + downloaded < songs.length) {
        await sleep(100);
    }

    console.log('======== Finished syncing ========');
    console.log(`Skipped ${skipped + newSkipped} songs`);
    console.log(`Downloaded ${downloaded} songs`);
    console.log(`Lowest star rating: ${lowestStarRating}`);
    console.log('Tally of mappers with the most difficulties:');
    console.log(mapperTally.slice(0, 10).map((element, index) => `#${index + 1} ${element.name}: ${element.count}`).join('\n'));
};
