let currentsong = new Audio()
let currfolder;
let songs;
const playMusic = (track) => {
    currentsong.src = `songs/${currfolder}/` + track;
    currentsong.play();
    play.src = 'https://cdn-icons-png.flaticon.com/512/786/786279.png';
    let songinf = document.querySelector('.songinfo');
    songinf.innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00.00/00.00';
    localStorage.setItem('currentsong', track);
}

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:3000/spotify%20clone/songs/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a');
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes('songs')) {
            let folder = e.href.split('/').slice(5, 6)[0]
            // get the metadata of the folder
            let cardcontainer = document.querySelector('.cardcontainers')
            let a = await fetch(`http://127.0.0.1:3000/spotify%20clone/songs/${folder}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML += `<div data-folder="${folder}" class="card">
                            <img src='http://127.0.0.1:3000/spotify%20clone/songs/${folder}/cover.jpeg'>
                            <button class="spotify-button play" data-folder="${folder}"></button>
                            <div class="carddetails">
                                <h2>${response.title}</h2>
                                <p>${response.description}</p>
                            </div>
                        </div>`
        }
    }

    // Load the playlist and play the first song when the Spotify button is clicked
    Array.from(document.querySelectorAll('.spotify-button')).forEach(button => {
        button.addEventListener('click', async (event) => {
            event.stopPropagation();
            let folder = event.currentTarget.dataset.folder;
            songs = await getsongs(folder);
            playMusic(songs[0]);
        });
    });

    // Load the playlist when the card is clicked, but don't play the first song
    Array.from(document.querySelectorAll('.card')).forEach(card => {
        card.addEventListener('click', async (event) => {
            let folder = event.currentTarget.dataset.folder;
            await getsongs(folder);
        });
    });
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let a_s = div.getElementsByTagName('a');
    songs = [];
    for (let index = 0; index < a_s.length; index++) {
        const element = a_s[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    
    let songul = document.querySelector('.songlist').getElementsByTagName('ul')[0];
    songul.innerHTML = '';
    for (let song of songs) {
        let listItem = document.createElement('li');
        listItem.className = 'playingtemp';
        listItem.innerHTML = `
            <div class="innerplayingtemp">
                <img src="https://cdn-icons-png.flaticon.com/512/9229/9229091.png" class="invert">
                <div class="info">
                    <div class="songname">${song.replaceAll('%20', ' ').replaceAll('.mp3', '')}</div>
                </div>
            </div>
            <img src="https://cdn-icons-png.flaticon.com/512/467/467143.png" alt="Play" class="invert list_play">
        `;
        
        // Add event listener to play song on click
        listItem.addEventListener('click', () => {
            playMusic(song);
        });
        
        songul.appendChild(listItem);
    }
    return songs;
}


async function gettime(songtime, songduration) {
    if (isNaN(songtime) || isNaN(songduration)) {
        return '00:00/00:00'
    }
    let singtime1 = `${songtime / 60}`.substring(0, 1);
    let singtime2 = `${songtime / 60}`.substring(2, 4);
    let duration1 = `${songduration / 60}`.substring(0, 1);
    let duration2 = `${songduration / 60}`.substring(2, 4);
    let timing = `${singtime1}:${singtime2}/${duration1}:${duration2}`
    return timing;
}


async function main() {

    // get the list of all the songs
    await getsongs('Liked%20Songs%20Mix');
    currentsong.src = `/spotify%20clone/${currfolder}/` + songs[0];
    document.querySelector('.songinfo').innerHTML = decodeURI(songs[0]);
    // display all the albums of the page
    displayalbums();
    // for (let index = 0; index < songs.length; index++) {
    //     const element = songs[index];
    //     songelement[index].addEventListener('click', () => {
    //         playMusic(element.trim());
    //     }
    //     )


    play.addEventListener('click', () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = 'https://cdn-icons-png.flaticon.com/512/786/786279.png'
        }
        else {
            currentsong.pause();
            play.src = 'https://cdn-icons-png.flaticon.com/512/467/467143.png'
        }
    })
    // listen for time update event
    currentsong.addEventListener('timeupdate', async () => {
        let duration = currentsong.duration
        let time = currentsong.currentTime
        document.querySelector('.songtime').innerHTML = await gettime(time, duration);
        localStorage.setItem('time', time)
        document.querySelector('.circle').style.left = `${(time / duration) * 100}%`;
        document.querySelector('.played').style.width = `${(time / duration) * 100}%`;
    })
    // add an event listener to seekbar
    document.querySelector('.seekbar').addEventListener('click', (e) => {
        document.querySelector('.circle').style.left = `${((e.offsetX / e.target.getBoundingClientRect().width) * 100)}%`;
        let percent = ((e.offsetX / e.target.getBoundingClientRect().width) * 100);
        document.querySelector('.played').style.width = `${percent}%`
        currentsong.currentTime = ((currentsong.duration * percent) / 100).toFixed(2);
    })
    // add an event listener to hamburger
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0%';
        document.querySelector('.hamburger').style.opacity = '0%';
        document.querySelector('.cross').style.opacity = '100%';

    })
    // add an event listener for close button
    document.querySelector('.cross').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-100%';
        document.querySelector('.cross').style.opacity = '0%';
        document.querySelector('.hamburger').style.opacity = '100%';
    })
    // add an event listener to previous and next
    document.querySelector('#previous').addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[0])
        }

    })
    document.querySelector('#next').addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0])
        }

    })
    // autoplay next track
    currentsong.addEventListener('timeupdate', () => {
        if (currentsong.currentTime == currentsong.duration) {
            let index1 = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
            if (index1 + 1 < songs.length) {
                playMusic(songs[index1 + 1])
            }
            else {
                playMusic(songs[0])
            }
        }
    })
    // add eevnt listener on volume button
    document.querySelector('.volumebar').addEventListener('click', (element) => {
        document.querySelector('.volumecircle').style.left = `${((element.offsetX / element.target.getBoundingClientRect().width) * 100)}%`;
        if (parseFloat(document.querySelector('.volumecircle').style.left) > 70 && parseFloat(document.querySelector('.volumecircle').style.left) <= 100) {
            currentsong.volume = `${((element.offsetX / element.target.getBoundingClientRect().width))}`
            document.querySelector('.volumeimage').innerHTML = `<img src="volumebutton3.png" width="30px" class="invert">`;
            localStorage.setItem('volume', currentsong.volume)
            localStorage.setItem('volumepercent', document.querySelector('.volumecircle').style.left)
            localStorage.setItem('volumeimage', document.querySelector('.volumeimage').innerHTML)
        }
        else if (parseFloat(document.querySelector('.volumecircle').style.left) > 33 && parseFloat(document.querySelector('.volumecircle').style.left) <= 70) {

            currentsong.volume = `${((element.offsetX / element.target.getBoundingClientRect().width))}`
            document.querySelector('.volumeimage').innerHTML = `<img src="volumebutton2.png" width="30px" class="invert">`;
            localStorage.setItem('volume', currentsong.volume)
            localStorage.setItem('volumepercent', document.querySelector('.volumecircle').style.left)
            localStorage.setItem('volumeimage', document.querySelector('.volumeimage').innerHTML)
        }
        else if (document.querySelector('.volumecircle').style.left > `${0 * element.target.getBoundingClientRect().width}%` && parseFloat(document.querySelector('.volumecircle').style.left) <= 30) {
            currentsong.volume = `${((element.offsetX / element.target.getBoundingClientRect().width))}`
            document.querySelector('.volumeimage').innerHTML = `<img src="volumebutton1.png" width="30px" class="invert">`;
            localStorage.setItem('volume', currentsong.volume)
            localStorage.setItem('volumepercent', document.querySelector('.volumecircle').style.left)
            localStorage.setItem('volumeimage', document.querySelector('.volumeimage').innerHTML)
        }
        else if (document.querySelector('.volumecircle').style.left == 0) {
            document.querySelector('.volumeimage').innerHTML = `<img src="volumebutton0.png" width="30px" class="invert">`;
            localStorage.setItem('volumepercent', document.querySelector('.volumecircle').style.left)
            localStorage.setItem('volumeimage', document.querySelector('.volumeimage').innerHTML)
            currentsong.volume = `${((element.offsetX / element.target.getBoundingClientRect().width))}`
            localStorage.setItem('volume', currentsong.volume)
        }



    })
    // add event listener for volume mute
    document.querySelector('.volumeimage').addEventListener('click', () => {
        let volumestatus;
        let volumeloud;
        if (document.querySelector('.volumeimage').innerHTML != `<img src="volumebutton0.png" width="30px" class="invert"></img>`) {
            volumestatus = document.querySelector('.volumeimage').innerHTML;
            document.querySelector('.volumeimage').innerHTML = `<img src="volumebutton0.png" width="30px" class="invert"></img>`
            volumeloud = currentsong.volume;
            currentsong.volume = '0';
            document.querySelector('.volumecircle').style.left = '0%';
            localStorage.setItem('volumepercent', document.querySelector('.volumecircle').style.left)
            localStorage.setItem('volumeimage', document.querySelector('.volumeimage').innerHTML)
            localStorage.setItem('volume', currentsong.volume)

        }

    })
    let savedsong = localStorage.getItem('currentsong');
    if (savedsong) {
        playMusic(savedsong)
        play.src = 'https://cdn-icons-png.flaticon.com/512/467/467143.png'
        currentsong.currentTime = localStorage.getItem('time');
        currentsong.volume = localStorage.getItem('volume');
        document.querySelector('.volumecircle').style.left = localStorage.getItem('volumepercent')
        document.querySelector('.volumeimage').innerHTML = localStorage.getItem('volumeimage')
        if (currentsong.currentTime != 0) {
            currentsong.pause();
        }
    }
}
main()