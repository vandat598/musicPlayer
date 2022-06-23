/*
        done 1. Render songs
        done 2. Scroll top
        3. Play / pause / seek
        4. CD rotate
        5. Next / prev
        6. Random
        7. Next / repeat when ended
        8. Active song
        9. Scroll active song into view
        10. play song when click
      */

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'f8-player';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
let played = [];
const repeatBtn = $('.btn-repeat');
const playList = $('.playlist');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Cơn Mưa Ngang Qua',
            singer: 'Sơn Tùng MTP',
            path: './assets/music/ConMuaNgangQua SonTungMTP 2782444.mp3',
            image: './assets/img/MTP.png',
        },
        {
            name: 'Xích thêm chút - XTC remix',
            singer: 'Rapital, Groovie, Tling, MCK',
            path: './assets/music/ Xích Thêm Chút  XTC Remix.mp3',
            image: './assets/img/thienThanTinhYeu.png',
        },
        {
            name: 'Thiên thần tình yêu',
            singer: 'Ricky Star, T.R.I',
            path: './assets/music/ Xích Thêm Chút  XTC Remix.mp3',
            image: './assets/img/XTC.png',
        },
        {
            name: 'Come Back For You',
            singer: 'Elephante',
            path: './assets/music/Elephante  Come Back For You feat Matluck.mp3',
            image: './assets/img/comBackForYou.png',
        },
        {
            name: 'Kill Em With Kindness',
            singer: 'Unknown',
            path: './assets/music/Kill Em With Kindness  Remix   Nhạc Tik Tok Gây Nghiện.mp3',
            image: './assets/img/KillEmWithKindness.png',
        },
        {
            name: 'As Long As You Love Me - Remix',
            singer: 'Justin Bieber',
            path: './assets/music/As Long As You Love Me  Justin Bieber.mp3',
            image: './assets/img/As_Long_As_You_Love_Me_(feat._Big_Sean)_-_Single.jpg',
        },
    ],
    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${
                    index === this.currentIndex ? 'active' : ''
                }" data-index="${index}">
                  <div class="thumb" style="background-image: url('${
                      song.image
                  }')">
                  </div>
                  <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                  </div>
                  <div class="option">
                    <i class="fa fa-ellipsis-h"></i>
                  </div>
                </div>
              `;
        });
        playList.innerHTML = htmls.join('');
    },
    defineProperties() {
        // Search google xem sytax defineProperty
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex];
            },
        });
    },
    handleEvent() {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate(
            [{ transform: 'rotate(360deg)' }],
            {
                duration: 10000,
                iterations: Infinity,
            }
        );
        cdThumbAnimate.pause();

        // handle scroll
        document.onscroll = function () {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;

            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // handle click play button

        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        };

        // Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
            _this.render();
            _this.scrollToActiveSong();
        };

        // Khi song pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        };

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
            }
        };

        // Xử lý khi tua bài hát
        progress.oninput = function (e) {
            const seekTime = (audio.duration / 100) * e.target.value;
            audio.currentTime = seekTime;
        };

        // Next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
        };
        // Prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
        };

        // Random button
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            // method toggle, khi đối số t2 là true thì sẽ add class, còn false thì remove class
            randomBtn.classList.toggle('active', _this.isRandom);
        };

        // Xử lý lặp lại song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        };

        // Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            }
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        };

        // Lắng nghe event click vào playlist
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            const optionSong = e.target.closest('.option');
            if (optionSong) {
                console.log('second');
                console.log(e.target);
            } else if (songNode) {
                console.log('first');
                _this.currentIndex = Number(songNode.dataset.index);
                _this.loadCurrentSong();
                _this.render();
                audio.play();
            }
        };
    },
    scrollToActiveSong() {
        setTimeout(() => {
            if (this.currentIndex === (0 || 1 || 2)) {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
            } else {
                $('.song.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }, 300);
    },
    loadCurrentSong() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
            if (played.length === this.songs.length) {
                played = [];
            }
        } while (
            newIndex === this.currentIndex ||
            played.some(value => value === newIndex)
        );
        played.push(newIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        console.log(played);
    },

    start() {
        // Gán cấu hình từ config localStorage vào project
        this.loadConfig();

        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // xử lý các sự kiện
        this.handleEvent();

        // Tải info bài hát đầu tiên vào UI khi run app
        this.loadCurrentSong();

        // Render playlist
        this.render();

        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
};

app.start();
