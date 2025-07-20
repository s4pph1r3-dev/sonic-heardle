import './assets/main.css'

import { createApp, ref } from 'vue'
import App from './App.vue'

import settings from '@/settings/settings.json'
import music from '@/settings/music.json'

// Create audio players

// Choose music

export function ParseStringWithVariable(string) {
    let nString = "";
    for (let i = 0; i < string.length; i++) {
        if(string[i] === '{'){
            let testStr = string.slice(i, string.length);

            let key = "";
            key = string.slice(i, i+testStr.indexOf("}")).replace("{", "").replace("}", "");

            switch(key) {
                case "heardle-name":
                    nString += settings["heardle-name"];
                    break;
                case "unlocked-time":
                    nString += settings["times"][currentGameState.value.guessed.length-1];
                    break;
                default:
                    nString += key;
                    break;
            }

            i += testStr.indexOf("}");
        }
        else {
            nString += string[i];
        }
    }

    return nString;
}

function shuffle(array, seed) {                // <-- ADDED ARGUMENT
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(random(seed) * m--);        // <-- MODIFIED LINE

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
    ++seed                                     // <-- ADDED LINE
  }

  return array;
}

export const _currentGameState = ref({
    guess: 0,
    guessed: [],
    isFinished: false,
});

let listIndex = 0;
let id = 0;

const shuffledMusic = music;

if(settings["infinite"]){
    listIndex = Math.round(Math.random() * (music.length-1));

} else {
    const oldestDate = new Date(null);
    const currentDate = new Date();

    id = Math.floor((currentDate.getTime() - oldestDate.getTime()) / 86400000);

    listIndex = id % music.length;

    const usString = localStorage.getItem("userStats");
    if(usString !== null && usString !== ""){
        let stats = JSON.parse(usString);
        let item = stats.find((item)=>{
            return item.id === id;
        })

        if(item !== undefined){
            _currentGameState.value.guess = item.guess;
            _currentGameState.value.guessed = item.guessed;
            _currentGameState.value.isFinished = item.isFinished;
        }
    }

    shuffle(shuffledMusic, Math.floor(id / music.length))
}

export const SelectedMusic = shuffledMusic[listIndex];

function save(){
    if(!settings["infinite"]){
        const usString = localStorage.getItem("userStats");
        let stats;

        console.log("Set used");
        if(usString === null || usString === ""){
            stats = [];
        } else {
            stats = JSON.parse(usString);
        }

        let item = stats.find((item)=>{
            return item.id === id;
        })

        if(item === undefined){
            stats.push({
                id: id,
                guess: _currentGameState.value.guess,
                guessed: _currentGameState.value.guessed,
                isFinished: _currentGameState.value.isFinished,
            });
        }
        else {
            stats[stats.indexOf(item)] = {
                id: id,
                guess: _currentGameState.value.guess,
                guessed: _currentGameState.value.guessed,
                isFinished: _currentGameState.value.isFinished,
            };
        }

        localStorage.setItem("userStats", JSON.stringify(stats));
    }
}

export const currentGameState = new Proxy(_currentGameState, {
    get(target, prop, receiver) {
        save();
        return Reflect.get(...arguments);
    },

    set(target, key, value) {
        Object.set(target, key, value);
        save();
    },

    defineProperty(target, key, descriptor) {
        Object.defineProperty(target, key, descriptor);
        save();
    }
})

const app = createApp(App);
app.mount('#app')

