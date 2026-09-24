// Narrative Media Project - "Parachute"

// LYRIC LINES
let firstVerse = "Yes, I saw her, her spiraled hair/nAnd I could see it, our life in a movie/nAnd now I'm spinning, my web up in the air/nMy spider senses, rain's gonna fall/nWash away the life I'm weaving";
let chorus = "I thought you were gonna catch me/nI never stopped falling for you/nNow I know better, never let me/nLeave home without a parachute";
let secondVerse = "You told me you waited for me, you said that you won/nAsked me on a plane from Rio, do I ever think of us?/nAnd you were at my wedding, I was broken, you were drunk/nYou could've told me not to do it, I would've run, I would've run/nTell me what was the moment you decided to give up/nYou could've told me what you wanted, I would've done, I would've done/nAnything/nI would've done/nAnything!"
let bridge = "Watch me fall/nWatch me fall/nWatch me fall through the sky/nWatch me fly"
let outro = "Watch me fly";

// WORD CLOUD AND CHARACTER VARIABLES
let characterFrames = [];
let damagedCharacterFrames = [];
let standingCharacter;
let parachuteImage;
let wordCloudImages = [];
let introImages = {};
let stars = [];
let firstVerseLines = [];
let outroLines = [];
let introSelectionStep = 0;
let songSelectedAt = 0;
let gameStarted = false;
let transitionCloudsStarted = false;

// PLAYER AND GAME VARIABLES
let player;
let clouds = [];
let rainDrops = [];
let wordClouds = [];
let sequence = [];
let sequenceDuration = 0;
let sequenceStartTime = 0;
let finalBridgeWordStartTime = 0;
let landingStartTime = 0;
let landingStarted = false;
let outroStarted = false;
let outroStartTime = 0;
let groundY = 0;
let groundHeight = 80;
let secondVerseStartTime = 0;
let secondVerseDuration = 0;

// WORD CLOUD AND CHARACTER SETTINGS
const wordDuration = 6000;
const wordLaunchInterval = 1500;
const wordSideMargin = 100;
const introWaitAfterSong = 4000;
const introGrayTextDelay = 2000;
const introOverlayDelay = 3000;
const introHoldDuration = 5000;
const introTransitionDuration = 4000;
const stormTransitionDuration = 1000;
const landingDuration = 1500;

async function setup() {
  createCanvas(windowWidth, windowHeight);

  // CHARACTER FRAMES LOADING
  characterFrames = await Promise.all([
    loadImage('assets/girl_falling1 1.png'),
    loadImage('assets/girl_falling2 1.png')
  ]);
  damagedCharacterFrames = await Promise.all([
    loadImage('assets/girl_falling1 2.png'),
    loadImage('assets/girl_falling2 2.png')
  ]);
  standingCharacter = await loadImage('assets/girl_standing.png');

  // PARACHUTE AND WORD CLOUD IMAGES LOADING
  parachuteImage = await loadImage('assets/parachute_open.png');
  wordCloudImages = await Promise.all([
    loadImage('assets/cloud1.png'),
    loadImage('assets/cloud2.png'),
    loadImage('assets/cloud3.png'),
    loadImage('assets/cloud4.png'),
    loadImage('assets/cloud5.png'),
    loadImage('assets/cloud6.png')
  ]);
  introImages = {
    audio: await loadImage('assets/audio_icon.png'),
    disk: await loadImage('assets/disk_icon.png'),
    song: await loadImage('assets/song_icon.png'),
    misc: await loadImage('assets/misc_icon.png'),
    trash: await loadImage('assets/trash_icon.png'),
    player1: await loadImage('assets/music_player1.png'),
    player2: await loadImage('assets/music_player2.png')
  };

  // PLAYER SETUP
  player = {
    x: width / 2,
    y: 80,
    width: 135,
    height: 150,
    speed: 5,
    facingRight: false,
    damaged: false,
    standing: false,

    // DISPLAY AND MOVE FUNCTIONS FOR THE PLAYER
    display: function() {
      if (this.standing) {
        let standingWidth = this.width / 2;
        let standingX = this.x + (this.width - standingWidth) / 2;
        image(standingCharacter, standingX, this.y, standingWidth, this.height);
        return;
      }

      let frames = this.damaged ? damagedCharacterFrames : characterFrames;
      let frame = frames[floor(millis() / 200) % frames.length];

      if (!frame) {
        return;
      }

      push();
      if (this.facingRight) {
        translate(this.x + this.width, this.y);
        scale(-1, 1);
        image(frame, 0, 0, this.width, this.height);
      } else {
        image(frame, this.x, this.y, this.width, this.height);
      }
      pop();
    },

    move: function() {
      // move the player left and right based on arrow key input
      if (keyIsDown(LEFT_ARROW)) {
        this.x -= this.speed;
        this.facingRight = false;
      }
      if (keyIsDown(RIGHT_ARROW)) {
        this.x += this.speed;
        this.facingRight = true;
      }

      // constrain player within the canvas boundaries
      this.x = constrain(this.x, 0, width - this.width);
    }
  };

  // LYRIC LINES SETUP
  firstVerseLines = firstVerse.split('/n');
  outroLines = outro.split('/n');
  for (let i = 0; i < 45; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 4)
    });
  }

  // BACKGROUND CLOUD SETUP
  for (let i = 0; i < 14; i++) {
    let backgroundImage = random(wordCloudImages);
    let backgroundWidth = random(240, 420);

    // CLOUD SETUP
    clouds.push({
      image: backgroundImage,
      x: random(width),
      y: random(height),
      width: backgroundWidth,
      height: backgroundWidth * backgroundImage.height / backgroundImage.width,
      speed: random(0.5, 1.5),

      // CLOUD DISPLAY AND MOVE FUNCTIONS
      display: function() {
        tint(255, 150);
        image(this.image, this.x, this.y, this.width, this.height);
        noTint();
      },

      move: function(allowRespawn = true) {
        this.y -= this.speed;

        if (allowRespawn && this.y + this.height < 0) {
          this.y = height;
          this.x = random(width);
        }
      }
    });
  }

  // RAIN DROPS SETUP
  for (let i = 0; i < 110; i++) {
    rainDrops.push({
      x: random(width),
      y: random(height),
      length: random(12, 28),
      speed: random(8, 14)
    });
  }

  // WORD CLOUD SETUP
  sequence = [chorus, secondVerse, chorus, bridge]
    .map(function(verse) {
      return verse.split('/n').join(' ').split(' ');
    });

  let sideMargin = min(wordSideMargin, width / 4);

  let wordStart = 0;
  for (let verse of sequence) {
    for (let word of verse) {
      let selectedImageIndex = word.length > 5 ? floor(random(2)) : floor(random(wordCloudImages.length));
      let selectedImage = wordCloudImages[selectedImageIndex];
      let cloudWidth = selectedImageIndex < 2 ? 500 : 300;
      let cloudHeight = selectedImageIndex < 2 ? 125 : 150;
      let maxX = max(sideMargin, width - sideMargin - cloudWidth);

      wordClouds.push({
        word: word,
        startTime: wordStart,
        imageIndex: selectedImageIndex,
        image: selectedImage,
        x: random(sideMargin, maxX),
        y: height + random(20, 80),
        width: cloudWidth,
        height: cloudHeight
      });
      wordStart += wordLaunchInterval;
    }
  }

  // word cloud timing setup
  secondVerseStartTime = sequence[0].length * wordLaunchInterval;
  secondVerseDuration = sequence[1].length * wordLaunchInterval;
  finalBridgeWordStartTime = wordStart - wordLaunchInterval;
  sequenceDuration = finalBridgeWordStartTime + wordDuration;
  introStartTime = millis();

}  

// DRAW FUNCTION FOR GAME AND INTRO SEQUENCES
function draw() {
  // CHECK IF THE GAME HAS STARTED - DRAW INTRO IF NOT
  if (!gameStarted) {
    drawIntro();
    return;
  }

  drawGame();
}

// MOUSE PRESSED FUNCTION FOR HANDLING USER INPUT
function mousePressed() {
  if (gameStarted && player.standing) {
    gameStarted = false;
    introSelectionStep = 0;
    songSelectedAt = 0;
    transitionCloudsStarted = false;
    landingStarted = false;
    outroStarted = false;
    groundY = height;
    player.x = width / 2;
    player.y = 80;
    player.facingRight = false;
    player.damaged = false;
    player.standing = false;
    return;
  }

  // HANDLE INTRO SELECTION STEPS IF THE GAME HAS NOT STARTED YET
  if (gameStarted || introSelectionStep >= 2) {
    return;
  }

  introSelectionStep++;
  if (introSelectionStep === 2) {
    songSelectedAt = millis();
  }
}

// DRAW INTRO SEQUENCE FUNCTION
function drawIntro() {

  // CALCULATE INTRO DURATION AND ELAPSED TIME SINCE SONG SELECTION
  let introDuration = introWaitAfterSong + introGrayTextDelay + (firstVerseLines.length - 1) * introOverlayDelay + introHoldDuration;
  let elapsedTime = introSelectionStep === 2 ? millis() - songSelectedAt : 0;

  if (introSelectionStep === 2 && elapsedTime >= introDuration + introTransitionDuration) {
    gameStarted = true;
    sequenceStartTime = millis();
    drawGame();
    return;
  }

  // CALCULATE TRANSITION PROGRESS FOR THE INTRO SEQUENCE
  let transitionProgress = introSelectionStep === 2 ? constrain((elapsedTime - introDuration) / introTransitionDuration, 0, 1) : 0;
  let nightColor = color('#050b2e');
  let dayColor = color('deepskyblue');
  background(lerpColor(nightColor, dayColor, transitionProgress));

  // DRAW CLOUDS AND PLAYER IF THE TRANSITION HAS REACHED THE SECOND HALF
  if (transitionProgress >= 0.5) {
    if (!transitionCloudsStarted) {
      for (let cloud of clouds) {
        cloud.y = height + random(0, height * 0.8);
        cloud.x = random(width);
      }
      transitionCloudsStarted = true;
    }

    for (let cloud of clouds) {
      cloud.move();
      cloud.display();
    }

    let entranceProgress = (transitionProgress - 0.5) * 2;
    player.y = lerp(-player.height, 80, entranceProgress);
    player.display();
  }

  // DRAW STARS IN THE BACKGROUND
  noStroke();
  fill('white');
  for (let star of stars) {
    circle(star.x, star.y, star.size);
  }

  // DRAW DESKTOP INTERFACE AND INTRO SELECTION
  let selectedIndex = introSelectionStep === 2 ? 2 : introSelectionStep === 1 ? 0 : -1;
  drawDesktopInterface(selectedIndex);

  // DRAW INTRO SELECTION TEXT IF A SONG HAS BEEN SELECTED
  if (introSelectionStep === 2 && elapsedTime >= introWaitAfterSong) {
    let verseTime = elapsedTime - introWaitAfterSong;
    let lineHeight = min(54, height / 10);
    let verseTop = height / 2 - (firstVerseLines.length * lineHeight) / 2;
    let highlightedLines = verseTime < introGrayTextDelay
      ? 0
      : min(
        floor((verseTime - introGrayTextDelay) / introOverlayDelay) + 1,
        firstVerseLines.length
      );
    drawLyricLines(firstVerseLines, verseTop, lineHeight, highlightedLines);
  }
}

// DRAW THE LYRIC LINES FOR THE INTRO SEQUENCE
function drawLyricLines(lines, top, lineHeight, highlightedLines) {
  textFont('Sixtyfour');
  textAlign(CENTER, TOP);
  textSize(min(20, width / 55));
  fill('#343434');
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], width / 2, top + i * lineHeight);
  }

  fill('yellow');
  for (let i = 0; i < highlightedLines; i++) {
    text(lines[i], width / 2, top + i * lineHeight);
  }
}

// DRAW THE DESKTOP INTERFACE WITH ICONS AND SELECTED ITEM HIGHLIGHT
function drawDesktopInterface(selectedIndex) {
  
  // define the icons and their properties for the desktop interface
  let icons = [
    introImages.audio,
    introImages.disk,
    introImages.song,
    introImages.misc,
    introImages.trash
  ];
  let iconGap = 22;
  let iconX = 36;
  let iconTop = 50;
  let iconWidths = [72, 72, 76, 72, 72];
  let iconHeights = [84, 84, 88, 94, 94];
  let iconYPositions = [];
  let nextIconY = iconTop;

  // draw the icons on the desktop interface
  for (let i = 0; i < icons.length; i++) {
    iconYPositions[i] = nextIconY;
    image(icons[i], iconX, nextIconY, iconWidths[i], iconHeights[i]);
    nextIconY += iconHeights[i] + iconGap;
  }

  // highlight the selected icon and draw the music player if a song is selected
  if (selectedIndex >= 0) {
    let selectedY = iconYPositions[selectedIndex];
    noFill();
    stroke('#d4ad00');
    strokeWeight(1);
    rect(iconX - 6, selectedY - 6, iconWidths[selectedIndex] + 12, iconHeights[selectedIndex] + 12);
    noStroke();

    let musicPlayer = selectedIndex === 2 ? introImages.player2 : introImages.player1;
    image(musicPlayer, 36, height - 160, 300, 100);

    // draw the music player timer if song is selected
    if (selectedIndex === 2) {
      let elapsedSeconds = floor((millis() - songSelectedAt) / 1000);
      let minutes = floor(elapsedSeconds / 60);
      let seconds = elapsedSeconds % 60;
      let timerText = nf(minutes, 2) + ':' + nf(seconds, 2);

      textFont('Arial');
      textStyle(BOLD);
      fill('#f5b942');
      noStroke();
      textAlign(RIGHT, BOTTOM);
      textSize(16);
      text(timerText, 314, height - 74);
      textStyle(NORMAL);
    }
  }
}

// DRAW THE GAME SCENE WITH CLOUDS, WORDS, RAIN, AND PLAYER
function drawGame() {
  let elapsedTime = millis() - sequenceStartTime;
  let sequenceElapsed = min(elapsedTime, sequenceDuration);
  let stormStrength = getStormStrength(elapsedTime);
  background(lerpColor(
    color('deepskyblue'),
    color('#555b66'),
    stormStrength
  ));

  // draw the background clouds
  for (let cloud of clouds) {
    cloud.move(elapsedTime < finalBridgeWordStartTime);
    cloud.display();
  }

  // draw the word clouds and check for collisions with the player
  let playerDamaged = false;
  for (let cloud of wordClouds) {
    let wordTime = sequenceElapsed - cloud.startTime;

    // check if the word cloud is within its active duration
    if (wordTime >= 0 && wordTime < wordDuration) {
      let progress = wordTime / wordDuration;
      let y = height + cloud.height - progress * (height + cloud.height * 2);

      if (rectanglesOverlap(player.x, player.y, player.width, player.height, cloud.x, y, cloud.width, cloud.height)) {
        playerDamaged = true;
      }

      image(cloud.image, cloud.x, y, cloud.width, cloud.height);
      textFont('Sixtyfour');
      fill('black');
      textAlign(CENTER, CENTER);
      textSize(24);
      let wordY = y + cloud.height / 2;
      if (cloud.imageIndex === 1) {
        wordY += 20;
      }
      text(cloud.word, cloud.x + cloud.width / 2, wordY);
    }
  }

  // draw the rain
  drawRain(stormStrength);

  // move and display player
  if (elapsedTime < sequenceDuration) {
    player.move();
    player.damaged = playerDamaged;
    player.standing = false;
  } else {

    // start the landing sequence if it hasn't started yet
    if (!landingStarted) {
      landingStarted = true;
      landingStartTime = millis();
    }

    // calculate the landing progress and update the player and ground positions
    let landingProgress = constrain((millis() - landingStartTime) / landingDuration, 0, 1);
    groundY = lerp(height, height - groundHeight, landingProgress);
    player.y = lerp(80, groundY - player.height, landingProgress);
    player.damaged = false;
    player.standing = landingProgress >= 1;
    if (player.standing && !outroStarted) {
      outroStarted = true;
      outroStartTime = millis();
    }

    let parachuteWidth = 240;
    let parachuteHeight = parachuteWidth * parachuteImage.height / parachuteImage.width;
    image(
      parachuteImage,
      player.x + player.width / 2 - parachuteWidth / 2,
      player.y - parachuteHeight + 30,
      parachuteWidth,
      parachuteHeight
    );
  }

  // draw the player
  player.display();
  // draw the outro if the player is standing
  if (player.standing) {
    drawOutro();
  }

  // draw the desktop interface - adjusting based on whether the player is standing
  drawDesktopInterface(player.standing ? -1 : 2);
}

// draw the outro sequence
function drawOutro() {
  let outroTime = millis() - outroStartTime;
  let lineHeight = min(54, height / 10);
  let outroTop = height / 2 - (outroLines.length * lineHeight) / 2 - 100;

  let highlightedLines = outroTime < introGrayTextDelay
    ? 0
    : min(
      floor((outroTime - introGrayTextDelay) / introOverlayDelay) + 1,
      outroLines.length
    );
  drawLyricLines(outroLines, outroTop, lineHeight, highlightedLines);
}

// calculate the strength of the storm based on the elapsed time
function getStormStrength(elapsedTime) {

  // calculate the time elapsed since the second verse started
  let secondVerseTime = elapsedTime - secondVerseStartTime;

  // return 0 if the second verse hasn't started or has ended
  if (secondVerseTime < 0 || secondVerseTime >= secondVerseDuration) {
    return 0;
  }

  let fadeIn = constrain(secondVerseTime / stormTransitionDuration, 0, 1);
  let fadeOut = constrain(
    (secondVerseDuration - secondVerseTime) / stormTransitionDuration,
    0,
    1
  );
  return min(fadeIn, fadeOut);
}


// DRAW RAIN BASED ON STORM STRENGTH
function drawRain(stormStrength) {
  if (stormStrength <= 0) {
    return;
  }

  // set the stroke color and weight for the raindrops based on the storm strength
  stroke(210, 230, 255, 190 * stormStrength);
  strokeWeight(1.5);
  for (let drop of rainDrops) {
    drop.y += drop.speed;
    if (drop.y > height) {
      drop.y = -drop.length;
      drop.x = random(width);
    }
    line(drop.x, drop.y, drop.x - 5, drop.y + drop.length);
  }
  noStroke();
}

// check if two rectangles overlap
function rectanglesOverlap(firstX, firstY, firstWidth, firstHeight, secondX, secondY, secondWidth, secondHeight) {
  return firstX < secondX + secondWidth && firstX + firstWidth > secondX && firstY < secondY + secondHeight && firstY + firstHeight > secondY;
}
