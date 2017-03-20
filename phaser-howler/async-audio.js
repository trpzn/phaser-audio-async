var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create ,update: update});

function preload() {

    game.load.spritesheet('button', 'assets/flixel-button.png', 80, 20);
    game.load.bitmapFont('nokia', 'assets/nokia16black.png', 'assets/nokia16black.xml');
	game.load.json('audios', 'assets/audios.json', false);
}

var currentSong;
var songList;
var prevSong;
var nextSong;
var currIndex = -1;

var logYPosition = 0;
var logYSeparation = 2;
var fontSize = 16;

var currentTextLog;

var timer = 0;
var initTimer = 0;
var downloadTime = 0;
var decodingTime = 0;
var songLength = 0;

var audioFolder = "";
var repTime = 1*1000;

var volume = 0.5;

var readyToplay = false;
var ended = false;

var tempjs = undefined;
var button = undefined;

function create() {

	tempjs = game.cache.getJSON('audios');
	game.stage.backgroundColor = "#FFFFFF";

	songList = tempjs.files;
	audioFolder = tempjs.audiosource;
	
	button = game.add.button(game.world.centerX - 95, 400, 'button', startNextSong, this, 2, 1, 0);

}

function startNextSong(){
	currIndex++;
	initTimer = 0;
	downloadTime = 0;
	decodingTime = 0;
	songLength = 0;
	if(currIndex>songList.length) {
		game.add.bitmapText(10, logYPosition + 7, 'nokia', "no more songs in playlist", fontSize);
		ended = true;
		return;
	}
	logYPosition += fontSize + logYSeparation;
	var audios = _getAudioFilesArray(audioFolder,songList[currIndex],tempjs.audiotypes);
	initTimer = game.time.time;
	
	currentSong = new Howl({
		src: audios,
		html5: true
	});
	
	currentSong.once('load', songLoadComplete);
	currentTextLog = game.add.bitmapText(10, logYPosition + 7, 'nokia', "Downloading song " + currIndex, fontSize);

}

function songLoadComplete(){

	downloadTime = game.time.time - initTimer;
	currentTextLog.text = songList[currIndex] + " download time: "+downloadTime+ " Decoding file...";

	initTimer = game.time.time;
	currentSong.play();
	readyToplay = true;
}

function _getAudioFilesArray(audioFolder,audioName,audiotypes){
	var returnArray = [];
	for(var audiotype in audiotypes){
		var audio = audiotypes[audiotype];
		returnArray[audiotype] = audioFolder+audioName+audio;
	}

	return returnArray;
}


function update(){
	if(ended){
		return;
	}
	if(currentSong!= undefined && currentSong.playing() && readyToplay){
		console.log("hola");
		var playingTime = (repTime - currentSong.seek()*1000);
		currentTextLog.text = songList[currIndex] + " download time: "+downloadTime+ "ms Decoding time: " + decodingTime + "ms Playing " + playingTime;
	}
	if(currentSong!= undefined && readyToplay && currentSong.playing() && (currentSong.seek()*1000>repTime)){
		currentSong.stop();
		currentSong.unload();
		currentSong = undefined;
		readyToplay = false;
		startNextSong();
	}
}


