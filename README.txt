CLONE HERO README

Windows:

Installation:

If you see this readme as a text file inside a folder along with "Clone Hero.exe" and "Clone Hero_Data" folder, you've already installed the game.
If you are installing a new version, please delete Clone Hero_Data folder, Clone Hero.exe, and UnityPlayer.DLL before extracting the new files from the download.

Usage:

Open "Clone Hero.exe" and away you go. Place your song files in the "Songs" folder inside the game's folder.

Song cache:

The song cache is stored at C:\Users\<username>\AppData\LocalLow\srylain Inc_\Clone Hero\songcache.bin. If something just doesn't work and the songs aren't scanning, try deleting this file and then try scanning again.

Game crashes:

Unity likes to crash quite a bit unfortunately, and there's nothing that can really be done about it. One known crash is caused by extremely high amounts of memory usage, which is caused by having leftover files from an old build. If this happens, delete the Clone Hero_Data folder and then reinstall.


Mac:

After you have downloaded the game drag Clone Hero.app into the Applications shortcut. Launch the game this will
automatically create the required files and folders for songs, custom backgrounds, and necks.

**For mac builds your configuration file and songs folder will be located at:**
`~/Library/Application Support/com.srylain.CloneHero`
The folder will be hidden by default so we recommend using `cmd + shift + g`  and pasting the above location and press go.
*NOTE* PLEASE DO NOT FORGET THE TILDE, otherwise it WILL NOT work.

In this folder there a 3 items that are of importance Custom, Songs, and settings.ini

Custom - This is where any custom backgrounds or necks can be placed.
Songs - This is the default song directory
settings.ini - This is the Clone Hero configuration file, you can use this to change your song path or add multiple song paths.

So the reason files are located here on mac is that macOS restricts permissions of the applications directory, and we
cannot include these files here like we currently do on other platforms.

PS3, and rockband Wii guitars are the simplest controllers to get working as they have usb dongles which don't require
a custom driver. Xbox 360 controllers do not work on macOS by default, in order to get them working you need to download
and install the following driver:

https://github.com/360Controller/360Controller/releases


Android:

The android build is still *HIGHLY* expiremental, there will be lots issues. Songs and the settings.ini file will be located here:
`/storage/emulated/0/Android/data/com.srylain.CloneHero/`
You can include songs anywhere by editing the settings.ini same as other platforms.

There is known to be lots of guitar controller issues on android, not all work correctly. However wired 360 guitars are known to work properly.

Some devices are not letting players install the build correctly. 
Tread carefully!

Songs:

New songs are not scanned in automatically. If you add any new songs, you must go to the Settings menu and press Scan Songs if you add or remove any songs.


Controls:

360 guitars should work just as you'd expect them to.
Keyboard controls: A = Green, S = Red, J = Yellow, K = Blue, L = Orange, Up/Down Arrow keys = Strum, H = Star Power, Enter = Pause


Control Remapping:

If you find that your controller isn't working, press SPACE (with a keyboard) on the main menu and it should open the control remapper. It should be relatively self-explanatory how to set the controls. If you can't click on the buttons, you can use the arrow keys and enter on a keyboard to control it as well.

It should automatically save and load your controller maps, although each player will have to set their own maps (not sure if I can fix that). AFAIK, most controllers should be supported.

A note for proper whammy functionality you should calibrate your whammy bar using the built-in controller axis calibration tool. The specific axis will be different per controller, but proper calibration so the axis moves through the range 0 to 1 is important. For some guitars reducing or removing the deadzone can help out as well. Xbox 360 guitars are known to need this calibration, as well as wii guitars using the Raphnet wired adapter.

MIDIFix:

MIDIFix is no longer needed as of V.21


Troubleshooting:

v.20 got rid of the Unity launcher, if that is needed for whatever reason hold Shift while opening the game's exe and the launcher should open before the game does.

Adding extra Song folder directory paths: As of v.15, instead of just using the line "path = " you must number the paths like this "path1=", "path2=", "path3=", and so on.

You must extract all of the files from the RAR that you downloaded for the game to work, you can not run the game from inside the RAR.

To play with a Guitar Hero Live guitar, you must have Windows 10 and an X360 GHL dongle (doesn't matter what platform the GHL guitar is from, but it must not be an iOS guitar). When first plugging in the dongle, you must force the drivers that are installed for it to be the standard 360 controller drivers. After that, in-game you must open your player profile and change your Controller setting to 6 Fret Guitar.

Custom Highways and Backgrounds can be named whatever you want but they must be placed in their respective folders in the Custom folder. You must rescan custom content in the custom menu in game after adding anything.

If a song doesn't show up in the song select screen, that means it's missing required files. There must be at least one of these files:
song.ogg / guitar.ogg / drums1.ogg / drums2.ogg / drums3.ogg / drums4.ogg / rhythm.ogg / vocals.ogg / keys.ogg
and there must be a notechart, either a notes.mid or notes.chart file. Starting with v.1, there will be a txt file created in the Songs folder that lists all the songs that weren't loaded.

If a song doesn't start on time (meaning if the notes aren't synced to the music), you may need to set an offset for the song. Most songs won't require an offset (make sure you calibrate your audio/video lag correctly in the settings menu), but if they do you can set their offset in the notes.chart or song.ini files. If there isn't a song.ini file, go ahead and create one (in the same folder as the song you're trying to play) and add "delay = x" (no quotes, replace x with the offset).

If a song shows up in the menu and then doesn't play correctly in-game (the highway doesn't scroll, no notes, no audio, etc), then you probably either named something wrong or the notechart isn't compatible. Let us know in the Discord if you find a song this happens to.

If no notes are showing up but the game is still working correctly (the highway is scrolling, music is playing), then you're probably playing a notechart that doesn't have the difficulty or instrument you have selected. Most GH3 customs are made only with Expert Guitar charts, while the official songs from Neversoft/Harmonix will have every instrument and every difficulty charted.

If your controller doesn't work, even after trying to remap its buttons, try using Joy2Key or xPadder so you can map it to the keyboard buttons. AFAIK you shouldn't ever have to do this, as most controllers should now be supported natively without any extra software interpreting the inputs.

If a song.ini file exists in a song's folder, the song data (song name, arist name, album name, etc) will be read from that even if there's no notes.mid file and there's only a notes.chart file.

If there's a notes.mid and no song.ini (as well as no name set in the song.ini), the song won't be loaded. Same goes for notes.chart, it needs a name set.

If the volume settings don't appear to be working, make sure you are setting the correct volume settings for the audio tracks that the song has. For example, if you only have a song.ogg track setting the Guitar volume won't do anything while setting the Song volume will.

If a video isn't playing and you named it correctly or chose it in the Background Video setting, it may be a video that was formatted improperly.
