const fs = require('fs');
const axios = require('axios');
const JSZip = require('jszip');
const sha1 = require('sha1');

const { default: PQueue } = require('p-queue');
const log4js = require('log4js');

const version = require('./package.json').version;

log4js.configure({
    appenders: {
        out: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '%[[%p]%] %m'
            }
        },
        outFilter: {
            type: 'logLevelFilter',
            appender: 'out',
            level: 'info'
        },
        log: {
            type: 'file',
            filename: 'last_run.log',
            layout: {
                type: 'pattern',
                pattern: '[%d] [%p] %m'
            },
            flags: 'w'
        }
    },
    categories: {
        default: {
            appenders: [
                'outFilter',
                'log'
            ],
            level: 'trace'
        }
    }
});

const logger = log4js.getLogger();

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
    logger.info(`======== Ranked Sync v${version} ========`);

    if (!fs.existsSync('./config.json')) {
        logger.warn('Config file does not exist. Copying from example...');
        fs.copyFileSync('./config.example.json', './config.json');
    }
    
    let config;
    try {
        config = JSON.parse(fs.readFileSync('./config.json'));
    } catch (error) {
        logger.fatal(`Error loading config.json: ${error}`);
        log4js.shutdown();
        return;
    }

    logger.info('Querying ScoreSaber...');

    let songs = [];
    const maxLimit = 1000;

    for (let i = 0; i < config.count / maxLimit; i++) {
        const limit = Math.min(maxLimit, config.count - i * maxLimit);

        try {
            const response = await axios.get(`https://scoresaber.com/api.php?function=get-leaderboards&cat=3&page=${i + 1}&limit=${limit}&ranked=1&unique=1`, { headers });

            songs = songs.concat(response.data.songs);

            if (response.data.songs.length < limit) {
                break;
            }
        } catch (error) {
            if (error.response) {
                logger.error(`Error querying ScoreSaber: Error ${error.response.status}: ${error.response.statusText}`);
            } else if (error.request) {
                // TODO: error.request is an instance of http.ClientRequest here, but I don't know how to get the error message from it
                // The request is already finished and no error event is emitted if I register a handler at this point
                // so I'm gonna roll with the classic "Network Error" and include the errno and code (may not always be available? no idea)
                logger.error(`Error querying ScoreSaber: Network Error: ${error.errno ? error.errno + ' ' : ''}${error.code ? error.code : ''}`);
            } else {
                logger.error(`Error querying ScoreSaber: ${error.message}`);
            }
        }

        await sleep(100);
    }

    if (config.qualified) {
        let page = 0;

        while (true) {
            try {
                const response = await axios.get(`https://scoresaber.com/api.php?function=get-leaderboards&cat=5&page=${page + 1}&limit=${maxLimit}&qualified=1&unique=1`, { headers });

                songs = songs.concat(response.data.songs);

                ++page;

                if (response.data.songs.length < maxLimit) {
                    break;
                }
            } catch (error) {
                if (error.response) {
                    logger.error(`Error querying ScoreSaber: Error ${error.response.status}: ${error.response.statusText}`);
                } else if (error.request) {
                    // TODO: error.request is an instance of http.ClientRequest here, but I don't know how to get the error message from it
                    // The request is already finished and no error event is emitted if I register a handler at this point
                    // so I'm gonna roll with the classic "Network Error" and include the errno and code (may not always be available? no idea)
                    logger.error(`Error querying ScoreSaber: Network Error: ${error.errno ? error.errno + ' ' : ''}${error.code ? error.code : ''}`);
                } else {
                    logger.error(`Error querying ScoreSaber: ${error.message}`);
                }

                break;
            }

            await sleep(100);
        }
    }

    if (songs.length <= 0) {
        logger.warn('No songs were collected. Exiting...');
        log4js.shutdown();
        return;
    }

    logger.info(`Collected ${songs.length} songs`);

    let mapperTally = [];
    const levelAuthorRegex = /(.+?)(?:\s*(?:[&,/\r\n]|(?:and))+\s*|$)/g; // This disgusting regex will isolate mapper names from the level author field, excluding separators
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
    let errored = 0;

    logger.info('Checking for existing maps...');

    let customLevels = config.folderOverride ? config.folderOverride : `${config.install}\\Beat Saber_Data\\CustomLevels`;

    if (customLevels.endsWith('\\')) {
        customLevels = customLevels.slice(0, -1);
    }

    if (!fs.existsSync(customLevels)) {
        fs.mkdirSync(customLevels, { recursive: true });
        logger.warn(`CustomLevels folder did not exist, creating one at ${customlevels}. Was this intentional?`);
    }

    const files = fs.readdirSync(customLevels);

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const folder = `${customLevels}\\${file}`;
        
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
                        logger.warn(`${file} has no difficulty beatmaps on a set!`);
                    }
                }
            } else {
                logger.warn(`${file} has no difficulty beatmap sets!`);
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
            logger.info(`${file} already downloaded, skipping`);
        }
    }

    logger.info(`Skipped: ${skipped}, remaining: ${songs.length}`);

    if (songs.length > 0) {
        logger.info('Querying BeatSaver...');

        const queue = new PQueue({ concurrency: 3 });

        for (let song of songs) {
            queue.add(async () => {
                let baseName = `${song.id} (${sanitizeName(song.name)} - ${sanitizeName(song.levelAuthorName)})`;

                try {
                    logger.info(`Getting info for: ${baseName}`);

                    const response = await axios.get(`https://beatsaver.com/api/maps/by-hash/${song.id}`, { headers });

                    baseName = `${response.data.key} (${sanitizeName(response.data.metadata.songName)} - ${sanitizeName(response.data.metadata.levelAuthorName)})`;

                    let name;
                    let folder;
                    let tries = -1;

                    do {
                        ++tries;
                
                        name = baseName + (tries > 0 ? ` (${tries})` : '');
                        folder = `${customLevels}\\${name}`;
                    } while (fs.existsSync(folder));

                    logger.info(`Downloading: ${name}`);

                    const downloadResponse = await axios.get(`https://beatsaver.com${response.data.downloadURL}`, { headers, responseType: 'arraybuffer' });

                    fs.mkdirSync(folder, { recursive: true });

                    logger.info(`Extracting: ${name}`);

                    const zip = await JSZip.loadAsync(downloadResponse.data);

                    for (let file in zip.files) {
                        zip.files[file].nodeStream().pipe(fs.createWriteStream(`${folder}\\${file}`));
                    }

                    logger.info(`Finished: ${name}`);

                    ++downloaded;
                } catch (error) {
                    if (error.response) {
                        logger.error(`Error downloading ${baseName}: Error ${error.response.status}: ${error.response.statusText}`);
                    } else if (error.request) {
                        // TODO: error.request is an instance of http.ClientRequest here, but I don't know how to get the error message from it
                        // The request is already finished and no error event is emitted if I register a handler at this point
                        // so I'm gonna roll with the classic "Network Error" and include the errno and code (may not always be available? no idea)
                        logger.error(`Error downloading ${baseName}: Network Error: ${error.errno ? error.errno + ' ' : ''}${error.code ? error.code : ''}`);
                    } else {
                        logger.error(`Error downloading ${baseName}: ${error.message}`);
                    }

                    ++errored;
                }

                await sleep(100);
            });
        }

        await queue.onIdle();
    }

    logger.info('======== Finished syncing ========');
    logger.info(`Skipped ${skipped} song` + (skipped !== 1 ? 's' : ''));
    logger.info(`Downloaded ${downloaded} song` + (downloaded !== 1 ? 's' : ''));
    logger.info(`Failed to download ${errored} song` + (errored !== 1 ? 's' : ''));
    logger.info(`Star rating of top diff on lowest map: ${lowestStarRating}`);
    logger.info('Tally of mappers who contributed to the most maps:');
    mapperTally.slice(0, 20).forEach((element, index) => {
        logger.info(`#${index + 1} ${element.name}: ${element.count}`);
    });

    log4js.shutdown();
};
