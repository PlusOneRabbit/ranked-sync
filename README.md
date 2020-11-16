# Ranked Sync

A small personal script used to download and install the top ranked Beat Saber maps from ScoreSaber and BeatSaver

## Installation

Clone the repo, or download the latest binary from the [Releases tab](https://github.com/PlusOneRabbit/ranked-sync/releases)

## Setup

The configuration options are stored in a file to allow for no user input, easing automation.<br>
Copy the `config.example.json` and rename it to `config.json`<br>
From here, you can configure the script using the options listed below.

## Config

### Option: `install`

The root of your Beat Saber installation directory. The CustomLevels folder will be automatically found from here.<br>
Make sure to use two backslashes when entering a path, as backslashes are a special character!

Example:<br>
`"install": "C:\\Program Files (x86)\\Steam\\steamapps\\common\\Beat Saber"`<br>
`"install": "C:\\Program Files\\Oculus\\Software\\Software\\hyperbolic-magnetism-beat-saber"`<br>
`"install": "F:\\SteamLibrary\\steamapps\\common\\Beat Saber"`<br>
`"install": "F:\\Oculus\\Software\\Software\\hyperbolic-magnetism-beat-saber"`

### Option: `folderOverride`

Allows you to override the folder to download maps to. Useful if you're using this with another tool outside of a Beat Saber installation.<br>
If blank or omitted, this will be ignored. The CustomLevels folder from your installation directory will be used.

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

### Option: `qualified`

Whether to download all currently qualified maps. These will be downloaded in addition to the number specified by `count`<br>
If omitted, this will be treated as false.

Example:<br>
`"qualified": false`<br>
`"qualified": true`

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
You can contact me on Discord at Rabbit#0001

## License

This project uses the [MIT license](https://github.com/PlusOneRabbit/ranked-sync/blob/master/LICENSE)
