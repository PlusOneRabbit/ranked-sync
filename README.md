# Ranked Sync

A small personal script used to download and install the top ranked Beat Saber maps from ScoreSaber and BeatSaver

## Installation

Clone the repo and install dependencies using `npm install`, or download the latest binary from the [Releases tab](https://github.com/PlusOneRabbit/ranked-sync/releases)

## Setup

The configuration options are stored in a file to allow for no user input, easing automation.<br>
Copy the `config.example.json` and rename it to `config.json`<br>
From here, you can configure the script using the options listed below.

## Config

### Option: `install`

The root of your Beat Saber installation directory. The `CustomLevels` folder will be automatically found from here.<br>
Make sure to use two backslashes when entering a path, as backslashes are an escape character!

Example:<br>
`"install": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber"`<br>
`"install": "C:\\Program Files\\Oculus\\Software\\Software\\hyperbolic-magnetism-beat-saber"`<br>
`"install": "F:\\SteamLibrary\\steamapps\\common\\Beat Saber"`<br>
`"install": "F:\\Oculus\\Software\\Software\\hyperbolic-magnetism-beat-saber"`

### Option: `folderOverride`

Allows you to override the folder to download maps to. Useful if you're using this with another tool outside of a Beat Saber installation.<br>
If blank or omitted, this will be ignored. The `CustomLevels` folder from your installation directory will be used.

Example:<br>
`"folderOverride": ""`<br>
`"folderOverride": "C:\\Foo\\Bar\\RankedLevels"`<br>
`"folderOverride": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber\\Beat Saber_Data\\CustomLevels\\Ranked"`<br>
`"folderOverride": "C:\\Program Files\\Oculus\\Software\\Software\\hyperbolic-magnetism-beat-saber\\Beat Saber_Data\\CustomLevels\\Ranked"`

### Option: `count`

The number of ranked maps to download.<br>
This used to be the number of difficulties, and as such would result in far fewer maps being downloaded.

Example:<br>
`"count": 300` <br>
`"count": 1000`

### Option: `extract`

Whether to extract maps to folders, or save them as zip files. If you are on PC, you likely want this set to true. Quest users may set it to false, so the maps can be more easily uploaded to BMBF.<br>
If omitted, this will be treated as true.

Example:<br>
`"extract": true`<br>
`"extract": false`

### Option: `qualified`

Whether to download all currently qualified maps. These will be downloaded in addition to the number specified by `count`<br>
If omitted, this will be treated as false.

Example:<br>
`"qualified": false`<br>
`"qualified": true`

### Option: `warnUnranked`

Whether to log a warning whenever an unranked map is found in the specified CustomLevels folder. Useful if you have a separate folder for exclusively ranked maps, and want to weed out old qualified versions.<br>
If omitted, this will be treated as false.

Example:<br>
`"warnUnranked": false`<br>
`"warnUnranked": true`

### Option: `deleteUnranked`

The same as the above option, however the program will **permanently delete** any unranked maps that are found. Not recommended unless you know what you're doing, and are using a separate folder.<br>
If omitted, this will be treated as false.

Example:<br>
`"deleteUnranked": false`<br>
`"deleteUnranked": true`

### Option: `createPlaylist`

Creates a `RankedLevels.bplist` playlist in your `Playlists` folder featuring the downloaded maps. Requires a secondary mod such as PlaylistLoaderLite to view in-game.<br>
If omitted, this will be treated as false.

Example:<br>
`"createPlaylist": false`<br>
`"createPlaylist": true`

### Option: `playlistOverride`

Allows you to override the location where the playlist file will be created. Should be a path to a file with extension `.bplist` or `.json`<br>
If blank or omitted, this will be ignored. `RankedLevels.bplist` inside your `Playlists` folder from your installation directory will be used.

Example:<br>
`"playlistOverride": ""`<br>
`"playlistOverride": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber\\Playlists\\RankedLevels.bplist"`<br>
`"playlistOverride": "C:\\Program Files\\Oculus\\Software\\Software\\hyperbolic-magnetism-beat-saber\\Playlists\\RankedLevels.bplist"`

### Option: `playlistMaxCount`

The maximum number of songs to include in the playlist. The songs with the highest star ratings go in first.<br>
If zero or omitted, this will be ignored.

Example:<br>
`"playlistMaxCount": 0`<br>
`"playlistMaxCount": 100`

### Option: `playlistMinStars`

The minimum star rating of songs to be included in the playlist.<br>
If zero or omitted, this will be ignored.

Example:<br>
`"playlistMinStars": 0`<br>
`"playlistMinStars": 10`

### Option: `playlistMaxStars`

The maximum star rating of songs to be included in the playlist.<br>
If zero or omitted, this will be ignored.

Example:<br>
`"playlistMaxStars": 0`<br>
`"playlistMaxStars": 10`

## Usage

If you downloaded the binary, extract the zip and run the exe.

If you downloaded the source code, start the project from the command line using `npm start`

A Windows batch script is also included in the source code for ease of use.

The output from the last run will be written to a file named `last_run.log`

## Automation

### Windows (Binary)

1. Extract `ranked-sync-win-x64.zip` if you haven't already
2. Open `Task Scheduler`
3. Right click on `Task Scheduler Library` and select `Create Basic Task...`
4. Name it `RankedSync` and click next
5. Choose `When I log on` and click next
6. Choose `Start a program` and click next
7. Browse to `ranked-sync.exe`
8. Under `Start in`, enter the path to the folder containing the exe and click next
9. (optional) Check `Open the Properties dialog for this task when I click Finish` and click finish
10. (optional) Under `Security options`, choose `Run whether user is logged on or not`. This will make the process run in the background without creating a window, but you will need to enter your password when saving the task.
11. (optional) Click OK and enter your password as prompted

### Windows (Node)

1. Clone the repo if you haven't already
2. Open `Task Scheduler`
3. Right click on `Task Scheduler Library` and select `Create Basic Task...`
4. Name it `RankedSync` and click next
5. Choose `When I log on` and click next
6. Choose `Start a program` and click next
7. Under `Program/script`, enter `C:\Windows\System32\cmd.exe`
8. Under `Add arguments`, enter `/c "npm start"`
9. Under `Start in`, enter the path to your clone of the repo and click next
10. (optional) Check `Open the Properties dialog for this task when I click Finish` and click finish
11. (optional) Under `Security options`, choose `Run whether user is logged on or not`. This will make the process run in the background without creating a window, but you will need to enter your password when saving the task.
12. (optional) Click OK and enter your password as prompted

## Contributing

If you have something you'd like to add, feel free to make a PR.<br>
You can contact me on Discord at Rabbit#0001 or on Twitter at [@plusonerabbit](https://twitter.com/plusonerabbit)

## License

This project uses the [MIT license](https://github.com/PlusOneRabbit/ranked-sync/blob/master/LICENSE)
