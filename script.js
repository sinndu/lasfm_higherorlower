"use strict";

//global stuff
let topObjects;
const object = [];
let art = [];
let type;
let score = 0;
let user = "DONT LOOK AT THIS";
let method = "DONT LOOK AT THIS";
let period = "DONT LOOK AT THIS";
let limit = "DONT LOOK AT THIS";
let randomList = [];

async function fetchData(method, user, period, limit) {
  const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=user.${method}&user=${user}&period=${period}&limit=${limit}&api_key=9e11af0df71cf7ff9f486d2fb10a504a&format=json`);

  const data = await response.json();
  console.log(data)

  if (data.error === undefined) {
    return data;
  }
  return null;
}

async function fetchArt(name, artist) {
  const response = await fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&track=${name}&artist=${artist}&api_key=9e11af0df71cf7ff9f486d2fb10a504a&format=json`);

  const data = JSON.parse(JSON.stringify(await response.json()).replaceAll("#", ""));

  if(data.error === undefined && data.track?.album?.image != undefined && data.track?.album?.image.text != "")
  {
    return data.track.album.image[data.track.album.image.length-1].text;
  }
  return "https://s3.amazonaws.com/assets.mlh.io/events/splashes/000/000/392/thumb/930adc5ed398-hackmtyMLH_300x300.png?1467906271";
}

async function initalize() {

  let userData;
  if(!(user == document.getElementById("username").value && method ==document.getElementById("method").value && period ==  document.getElementById("period").value && limit == document.getElementById("limit").value))
  {
    user = document.getElementById("username").value;
    method = document.getElementById("method").value;
    period = document.getElementById("period").value;
    limit = document.getElementById("limit").value;
    userData = await fetchData(method, user, period, limit);

    if (userData === null) {
        console.log("error fetching data");
        return;
      }
    
  type = method;
  topObjects = getTop(userData);
  }
  startGame();
}

async function startGame() {
  randomList = [];
  object[0] = topObjects[generateRandom(topObjects.length, 0)];
  object[1] = topObjects[generateRandom(topObjects.length, 0)];
  object[2] = topObjects[generateRandom(topObjects.length, 0)];

  art[0] = await fetchArt(object[0].name, object[0].artist.name)
  art[1] = await fetchArt(object[1].name, object[1].artist.name)
  art[2] = await fetchArt(object[2].name, object[2].artist.name)
  setHTML();
  cssToggle();
}

function getTop(userData) {
  if (type == "gettoptracks") {
    return userData.toptracks.track;
  }
  else if (type == "gettopartists") {
    return userData.topartists.artist;
  }
  else if (type == "gettopalbums") {
    return userData.topalbums.album;
  }
}

function setHTML() {
  const title_1 = document.getElementById("title_1");
  const title_2 = document.getElementById("title_2");
  const scrobbles_1 = document.getElementById("scrobbles_1")
  const score_count = document.getElementById("score");
  const img_1 = document.getElementById("img_1");
  const img_2 = document.getElementById("img_2");
  const desc_1 = document.getElementById("desc_1");
  const desc_2 = document.getElementById("desc_2");
  const desc_3 = document.getElementById("desc_3");

  title_1.innerHTML = object[0].name;
  title_2.innerHTML = object[1].name;
  scrobbles_1.innerHTML = object[0].playcount + " scrobbles";
  score_count.innerHTML = `Score: ${score}`;
  desc_1.innerHTML = `by ${object[0].artist.name} has`
  desc_2.innerHTML = `by ${object[1].artist.name} has`
  desc_3.innerHTML = `scrobbles than ${object[0].name}`

  img_1.src = art[0];
  img_2.src = art[1];
}

async function gameLoop(click) {

  let win = parseInt(object[click].playcount) <= object[Number(!click)].playcount
  
  document.getElementById("higher").classList.add("animatedhidden");
  document.getElementById("lower").classList.add("animatedhidden");
  document.getElementById("higher").disabled = true;
  document.getElementById("lower").disabled = true;
  document.getElementById("scrobbles_2").classList.remove("hidden");
  document.getElementById("scrobbles_2").classList.remove("animatedhidden");
  await numberGoUp(win);
  document.getElementById("higher").classList.remove("animatedhidden");
  document.getElementById("lower").classList.remove("animatedhidden");
  document.getElementById("higher").disabled = false;
  document.getElementById("lower").disabled = false;
  document.getElementById("scrobbles_2").classList.add("hidden");
  document.getElementById("scrobbles_2").classList.add("animatedhidden");
  
  if (win) {
    score++;
    next();
  }
  else {
    endGame();
  }
  setHTML();
}

async function numberGoUp(win)
  {
  document.getElementById("scrobbles_2").innerHTML = `${object[1].playcount} scrobbles`;
  const delay = ms => new Promise(res => setTimeout(res, ms));

    if(win)
    {
      document.getElementById("vs").classList.add("green")
      document.getElementById("vs").innerHTML = "&#10004";
    }
    else
    {
      document.getElementById("vs").classList.add("red")
      document.getElementById("vs").innerHTML = "&#10006";
    }
    await delay(1250)
    document.getElementById("vs").classList.remove("red")
    document.getElementById("vs").classList.remove("green")
    document.getElementById("vs").innerHTML = "VS";
  }

function endGame() {
  document.getElementById("title").innerHTML = `GAME OVER! <br> Score: ${score}`
  score = 0;
  cssToggle();
}

async function next() {
  
  object[0] = object[1];
  object[1] = object[2];
  object[2] = topObjects[generateRandom(topObjects.length, 0)];

  art[0] = art[1];
  art[1] = art[2];
  art[2] = await fetchArt(object[2].name, object[2].artist.name);
}

function cssToggle() {
  document.getElementById("start").classList.toggle("hidden");
  document.getElementById("left").classList.toggle("hidden");
  document.getElementById("right").classList.toggle("hidden");
  document.getElementById("score").classList.toggle("hidden");
  document.getElementById("img_1").classList.toggle("hidden");
  document.getElementById("img_2").classList.toggle("hidden");
  document.getElementById("overlay").classList.toggle("hidden");
  document.getElementById("vs").classList.toggle("hidden");
}

function generateRandom(max,min)
{
  if(randomList.length > parseInt(limit)-5)
  {
    randomList = [];
  }
  
  let finished = false;
  let random = null;
  while(!finished)
  {
    random = Math.floor(Math.random() * (max - min)) + min;
    if(randomList.includes(random) === false)
    {
      finished = true;
    }
  }
  randomList.push(random);
  return random;
}