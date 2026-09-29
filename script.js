// ==========================================
// CHƯỞNG GÀ - GAME JAVASCRIPT
// BẢN: NHẠC NỀN + NHẠC HIT + GAMEPLAY KỊCH TÍNH
// ==========================================


// ================================
// LẤY ELEMENT
// ================================

const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const wheelScreen = document.getElementById("wheelScreen");

const gameArea = document.getElementById("gameArea");

const startMessage = document.getElementById("startMessage");
const startButton = document.getElementById("startButton");

const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const spinCountElement = document.getElementById("spinCount");

const finalScoreElement = document.getElementById("finalScore");
const finalSpinCountElement = document.getElementById("finalSpinCount");

const goWheelButton = document.getElementById("goWheelButton");

const remainingSpinElement = document.getElementById("remainingSpin");

const spinButton = document.getElementById("spinButton");
const restartButton = document.getElementById("restartButton");

const wheel = document.getElementById("wheel");

const prizeResult = document.getElementById("prizeResult");
const prizeText = document.getElementById("prizeText");


// ================================
// GAME VARIABLES
// ================================

const GAME_DURATION = 15;

// BPM của nền nhạc.
// 152 BPM -> 1 beat khoảng 395ms.
const MUSIC_BPM = 152;
const BEAT_INTERVAL = 60 / MUSIC_BPM;

// Beat đầu của bài nhạc.
const FIRST_BEAT = 1.068;

let score = 0;

let timeLeft = GAME_DURATION;

let gameRunning = false;
let gameEnded = false;
let questionActive = false;

let timerInterval = null;
let chickenSpawnTimeout = null;
let questionAnswerTimeout = null;

let currentSpins = 0;

let wheelRotation = 0;

// Số câu hỏi đã trả lời.
let questionsAnswered = 0;

// Ngân hàng câu hỏi.
let questionPool = [];

// Vị trí câu hỏi.
let questionIndex = 0;

// Đồng bộ nhạc.
let musicSyncFrame = null;
let lastBeatIndex = -1;
let lastMusicTime = 0;

// Trạng thái audio.
let audioStarted = false;

// Khóa vòng quay khi đang quay.
let wheelSpinning = false;


// ================================
// ÂM THANH
// ================================

// Code hỗ trợ cả:
// music.mp3
// music(1).mp3
//
// hit.mp3 phải nằm cùng thư mục với index.html.

const bgMusic = new Audio();
const hitSound = new Audio("hit.mp3");
const questionSound = new Audio("question.mp3");

bgMusic.preload = "auto";
bgMusic.loop = true;
bgMusic.volume = 0.30;

hitSound.preload = "auto";
hitSound.volume = 0.78;

questionSound.preload = "auto";
questionSound.volume = 0.85;

// Thử music.mp3 trước.
// Nếu không có thì thử music(1).mp3.
let musicSourceIndex = 0;

const musicSources = [
    "music.mp3",
    "music(1).mp3"
];

bgMusic.src = musicSources[musicSourceIndex];


bgMusic.addEventListener(
    "error",
    function () {

        if (
            musicSourceIndex <
            musicSources.length - 1
        ) {

            musicSourceIndex++;

            bgMusic.src =
                musicSources[musicSourceIndex];

            bgMusic.load();
        }

    }
);


// ================================
// PLAY AUDIO AN TOÀN
// ================================

function safePlay(audio) {

    const promise =
        audio.play();

    if (
        promise &&
        typeof promise.catch === "function"
    ) {

        promise.catch(
            function () {

                // Trình duyệt có thể chặn audio.
                // Vì vậy không để lỗi làm hỏng game.

            }
        );

    }

}


// ================================
// BẮT ĐẦU NHẠC
// ================================

function startBackgroundMusic() {

    bgMusic.currentTime = 0;

    bgMusic.volume = 0.30;

    safePlay(bgMusic);

    if (
        musicSyncFrame === null
    ) {

        musicSyncFrame =
            requestAnimationFrame(
                syncMusicBeatEffects
            );

    }

    audioStarted = true;

}


// ================================
// DỪNG NHẠC
// ================================

function stopBackgroundMusic() {

    bgMusic.pause();

    try {

        bgMusic.currentTime = 0;

    }

    catch (error) {

        // Không làm game lỗi.

    }

    stopMusicSync();

    audioStarted = false;

}


// ================================
// NHẠC HIT
// ================================

function playHitSound() {
    

    try {

        hitSound.currentTime = 0;

    }

    catch (error) {

        // Bỏ qua lỗi seek.

    }

    safePlay(hitSound);

}


// ================================
// HẠ NHẠC KHI HIỆN CÂU HỎI
// ================================

function duckMusic() {

    if (
        !bgMusic.paused
    ) {

        bgMusic.volume = 0.11;

    }

}


// ================================
// KHÔI PHỤC VOLUME
// ================================

function restoreMusicVolume() {

    if (
        bgMusic.paused
    ) {

        return;

    }


    // Nếu đang hiện câu hỏi.
    if (
        questionActive
    ) {

        bgMusic.volume = 0.11;

    }

    // 3 giây cuối.
    else if (
        timeLeft <= 3
    ) {

        bgMusic.volume = 0.42;

    }

    // 6 giây cuối.
    else if (
        timeLeft <= 6
    ) {

        bgMusic.volume = 0.36;

    }

    // Bình thường.
    else {

        bgMusic.volume = 0.30;

    }

}


// ================================
// ĐỒNG BỘ HIỆU ỨNG THEO BEAT
// ================================

function syncMusicBeatEffects() {

    if (
        !bgMusic.paused &&
        !bgMusic.ended &&
        gameRunning &&
        !questionActive
    ) {

        const currentTime =
            bgMusic.currentTime;


        // Nếu nhạc vừa loop về đầu.
        if (
            currentTime <
            lastMusicTime - 0.5
        ) {

            lastBeatIndex = -1;

        }


        lastMusicTime =
            currentTime;


        if (
            currentTime >=
            FIRST_BEAT
        ) {

            const beatIndex =
                Math.floor(
                    (
                        currentTime -
                        FIRST_BEAT
                    ) /
                    BEAT_INTERVAL
                );


            if (
                beatIndex !==
                lastBeatIndex
            ) {

                lastBeatIndex =
                    beatIndex;

                triggerMusicBeat();

            }

        }

    }


    musicSyncFrame =
        requestAnimationFrame(
            syncMusicBeatEffects
        );

}


// ================================
// HIỆU ỨNG MỖI BEAT
// ================================

function triggerMusicBeat() {

    if (
        !gameRunning ||
        questionActive ||
        gameEnded
    ) {

        return;

    }


    gameArea.classList.remove(
        "music-beat",
        "music-beat-danger"
    );


    // Ép browser chạy lại animation.
    void gameArea.offsetWidth;


    if (
        timeLeft <= 6
    ) {

        gameArea.classList.add(
            "music-beat-danger"
        );

    }

    else {

        gameArea.classList.add(
            "music-beat"
        );

    }


    // 3 giây cuối rung màn hình.
    if (
        timeLeft <= 3
    ) {

        gameScreen.classList.remove(
            "critical-beat"
        );

        void gameScreen.offsetWidth;

        gameScreen.classList.add(
            "critical-beat"
        );

    }

}


// ================================
// DỪNG ĐỒNG BỘ NHẠC
// ================================

function stopMusicSync() {

    if (
        musicSyncFrame !== null
    ) {

        cancelAnimationFrame(
            musicSyncFrame
        );

        musicSyncFrame = null;

    }


    lastBeatIndex = -1;

    lastMusicTime = 0;

}


// ================================
// THÊM CSS HIỆU ỨNG
// ================================

function addDramaticStyles() {

    if (
        document.getElementById(
            "dramaticGameStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement("style");


    style.id =
        "dramaticGameStyles";


    style.textContent = `


        /* =====================================
           NHỊP NHẠC BÌNH THƯỜNG
        ===================================== */

        .music-beat {

            animation:
                musicBeatPulse
                0.18s
                ease-out;

        }


        @keyframes musicBeatPulse {

            0% {

                filter:
                    brightness(1);

            }

            45% {

                filter:
                    brightness(1.10);

            }

            100% {

                filter:
                    brightness(1);

            }

        }



        /* =====================================
           NHỊP NHẠC MẠNH
        ===================================== */

        .music-beat-danger {

            animation:
                dangerBeatPulse
                0.20s
                ease-out;

        }


        @keyframes dangerBeatPulse {

            0% {

                transform:
                    scale(1);

                filter:
                    brightness(1);

            }

            45% {

                transform:
                    scale(1.008);

                filter:
                    brightness(1.16);

            }

            100% {

                transform:
                    scale(1);

                filter:
                    brightness(1);

            }

        }



        /* =====================================
           RUNG MÀN HÌNH
        ===================================== */

        .critical-beat {

            animation:
                criticalScreenShake
                0.16s
                ease-out;

        }


        @keyframes criticalScreenShake {

            0% {

                transform:
                    translateX(0);

            }

            25% {

                transform:
                    translateX(-3px);

            }

            50% {

                transform:
                    translateX(3px);

            }

            75% {

                transform:
                    translateX(-2px);

            }

            100% {

                transform:
                    translateX(0);

            }

        }



        /* =====================================
           TIMER CẢNH BÁO
        ===================================== */

        .timer-warning {

            animation:
                timerWarning
                0.8s
                ease-in-out
                infinite;

        }


        @keyframes timerWarning {

            0%,
            100% {

                transform:
                    scale(1);

            }

            50% {

                transform:
                    scale(1.10);

            }

        }



        .timer-critical {

            animation:
                timerCritical
                0.38s
                ease-in-out
                infinite;

        }


        @keyframes timerCritical {

            0%,
            100% {

                transform:
                    scale(1);

                filter:
                    brightness(1);

            }

            50% {

                transform:
                    scale(1.22);

                filter:
                    brightness(1.25);

            }

        }



        /* =====================================
           KHUNG NGUY HIỂM
        ===================================== */

        body.game-danger #gameArea {

            box-shadow:
                inset
                0 0 0 3px
                rgba(
                    255,
                    100,
                    0,
                    0.22
                );

        }



        body.game-critical #gameArea {

            box-shadow:
                inset
                0 0 0 4px
                rgba(
                    255,
                    0,
                    0,
                    0.40
                ),
                inset
                0 0 50px
                rgba(
                    255,
                    0,
                    0,
                    0.18
                );

        }



        /* =====================================
           FLASH KHI HIT
        ===================================== */

        .hit-flash {

            position:
                absolute;

            inset:
                0;

            z-index:
                90;

            pointer-events:
                none;

            background:
                radial-gradient(
                    circle at
                    var(--hit-x, 50%)
                    var(--hit-y, 50%),

                    rgba(
                        255,
                        255,
                        255,
                        0.95
                    )
                    0%,

                    rgba(
                        255,
                        95,
                        25,
                        0.46
                    )
                    12%,

                    rgba(
                        255,
                        0,
                        0,
                        0
                    )
                    45%
                );

            animation:
                hitFlash
                0.30s
                ease-out
                forwards;

        }


        @keyframes hitFlash {

            0% {

                opacity:
                    0.95;

            }

            100% {

                opacity:
                    0;

            }

        }



        /* =====================================
           VÒNG SÓNG HIT
        ===================================== */

        .hit-ripple {

            position:
                absolute;

            z-index:
                95;

            width:
                24px;

            height:
                24px;

            border:
                4px
                solid
                rgba(
                    255,
                    255,
                    255,
                    0.95
                );

            border-radius:
                50%;

            pointer-events:
                none;

            transform:
                translate(
                    -50%,
                    -50%
                );

            animation:
                hitRipple
                0.48s
                ease-out
                forwards;

        }


        @keyframes hitRipple {

            0% {

                opacity:
                    1;

                width:
                    24px;

                height:
                    24px;

                border-width:
                    4px;

            }

            100% {

                opacity:
                    0;

                width:
                    160px;

                height:
                    160px;

                border-width:
                    1px;

            }

        }



        /* =====================================
           BÀN TAY CHƯỞNG
        ===================================== */

        .hand.dramatic-hand {

            position:
                absolute;

            z-index:
                100;

            pointer-events:
                none;

            font-size:
                78px;

            filter:
                drop-shadow(
                    0
                    6px
                    10px
                    rgba(
                        0,
                        0,
                        0,
                        0.25
                    )
                );

            animation:
                dramaticHand
                0.48s
                ease-out
                forwards;

        }


        @keyframes dramaticHand {

            0% {

                opacity:
                    0;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(0.20)
                    rotate(-30deg);

            }

            25% {

                opacity:
                    1;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(1.25)
                    rotate(12deg);

            }

            52% {

                opacity:
                    1;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(1)
                    rotate(0deg);

            }

            100% {

                opacity:
                    0;

                transform:
                    translate(
                        -50%,
                        -72%
                    )
                    scale(0.72)
                    rotate(8deg);

            }

        }



        /* =====================================
           +1 ĐIỂM
        ===================================== */

        .score-popup.dramatic-score {

            position:
                absolute;

            z-index:
                120;

            pointer-events:
                none;

            color:
                #ff5722;

            font-size:
                38px;

            font-weight:
                900;

            text-shadow:
                0
                3px
                0
                rgba(
                    0,
                    0,
                    0,
                    0.22
                ),
                0
                0
                16px
                rgba(
                    255,
                    220,
                    80,
                    0.92
                );

            transform:
                translate(
                    -50%,
                    -50%
                );

            animation:
                scoreBoom
                0.68s
                ease-out
                forwards;

        }


        @keyframes scoreBoom {

            0% {

                opacity:
                    0;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(0.25)
                    rotate(-10deg);

            }

            25% {

                opacity:
                    1;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(1.35)
                    rotate(5deg);

            }

            100% {

                opacity:
                    0;

                transform:
                    translate(
                        -50%,
                        -95%
                    )
                    scale(1)
                    rotate(0deg);

            }

        }



        /* =====================================
           CHỮ HIT
        ===================================== */

        .hit-label {

            position:
                absolute;

            z-index:
                121;

            pointer-events:
                none;

            font-size:
                24px;

            font-weight:
                1000;

            color:
                white;

            text-shadow:
                0
                2px
                0
                rgba(
                    0,
                    0,
                    0,
                    0.35
                ),
                0
                0
                12px
                rgba(
                    255,
                    80,
                    0,
                    0.8
                );

            transform:
                translate(
                    -50%,
                    -50%
                );

            animation:
                hitLabel
                0.55s
                ease-out
                forwards;

        }


        @keyframes hitLabel {

            0% {

                opacity:
                    0;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(0.4);

            }

            22% {

                opacity:
                    1;

                transform:
                    translate(
                        -50%,
                        -50%
                    )
                    scale(1.15);

            }

            100% {

                opacity:
                    0;

                transform:
                    translate(
                        -50%,
                        -90%
                    )
                    scale(0.85);

            }

        }



        /* =====================================
           QUESTION MODAL
        ===================================== */

        #questionModal {

            position:
                fixed;

            inset:
                0;

            z-index:
                9999;

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            background:
                rgba(
                    0,
                    0,
                    0,
                    0.68
                );

            padding:
                20px;

            backdrop-filter:
                blur(3px);

        }



        .question-box {

            width:
                min(
                    560px,
                    95vw
                );

            background:
                white;

            border-radius:
                24px;

            padding:
                25px;

            box-shadow:
                0
                20px
                60px
                rgba(
                    0,
                    0,
                    0,
                    0.42
                );

            animation:
                questionAppear
                0.25s
                ease;

        }


        @keyframes questionAppear {

            from {

                transform:
                    scale(0.72);

                opacity:
                    0;

            }

            to {

                transform:
                    scale(1);

                opacity:
                    1;

            }

        }



        .question-header {

            display:
                flex;

            justify-content:
                space-between;

            align-items:
                center;

            font-size:
                22px;

            font-weight:
                900;

            margin-bottom:
                20px;

        }



        .question-text {

            font-size:
                23px;

            font-weight:
                900;

            text-align:
                center;

            line-height:
                1.35;

            margin:
                20px 0 25px;

        }



        .answer-list {

            display:
                grid;

            gap:
                12px;

        }



        .answer-button {

            border:
                none;

            padding:
                15px;

            border-radius:
                14px;

            background:
                #f1f1f1;

            font-size:
                17px;

            font-weight:
                800;

            cursor:
                pointer;

            text-align:
                left;

            transition:
                transform
                0.15s,
                background
                0.15s;

        }



        .answer-button:hover:not(:disabled) {

            transform:
                translateY(-2px);

            background:
                #e4e4e4;

        }



        .answer-button:disabled {

            cursor:
                default;

        }



        .answer-button.correct {

            background:
                #54c878;

            color:
                white;

        }



        .answer-button.wrong {

            background:
                #ed5c5c;

            color:
                white;

        }



        .question-message {

            text-align:
                center;

            font-size:
                21px;

            font-weight:
                900;

            min-height:
                30px;

            margin-top:
                18px;

        }



        .question-progress {

            margin-top:
                18px;

            height:
                7px;

            border-radius:
                99px;

            background:
                #eeeeee;

            overflow:
                hidden;

        }



        .question-progress span {

            display:
                block;

            width:
                100%;

            height:
                100%;

            transform-origin:
                left center;

            background:
                linear-gradient(
                    90deg,
                    #ff6d00,
                    #ff9800
                );

        }



        /* =====================================
           CHỮ CẢNH BÁO CUỐI GAME
        ===================================== */

        .last-seconds-text {

            position:
                absolute;

            left:
                50%;

            top:
                17%;

            z-index:
                70;

            transform:
                translateX(-50%);

            pointer-events:
                none;

            color:
                rgba(
                    255,
                    255,
                    255,
                    0.96
                );

            font-size:
                clamp(
                    20px,
                    3vw,
                    34px
                );

            font-weight:
                1000;

            text-shadow:
                0
                3px
                0
                rgba(
                    0,
                    0,
                    0,
                    0.24
                ),
                0
                0
                20px
                rgba(
                    255,
                    70,
                    0,
                    0.85
                );

            animation:
                dangerText
                0.55s
                ease-in-out
                infinite
                alternate;

        }



        @keyframes dangerText {

            from {

                opacity:
                    0.72;

                transform:
                    translateX(-50%)
                    scale(0.96);

            }

            to {

                opacity:
                    1;

                transform:
                    translateX(-50%)
                    scale(1.04);

            }

        }

    `;


    document.head.appendChild(style);

}


addDramaticStyles();


// ================================
// NGÂN HÀNG CÂU HỎI
// ================================

const questions = [

    {
        question:
            "CLB Taekwondo OTC chính thức được thành lập vào ngày, tháng, năm nào?",

        answers:
            [
                "19/03/2012",
                "19/03/2015",
                "19/03/2018",
                "19/03/2020"
            ],

        correct:
            1
    },


    {
        question:
            "Tên viết tắt tiếng Anh của Trường Đại học Mở TP.HCM là gì?",

        answers:
            [
                "OU",
                "OUM",
                "HCMCOU",
                "UHM"
            ],

        correct:
            2
    },


    {
        question:
            'Tên viết tắt "OTC" của câu lạc bộ có ý nghĩa chính thức là gì?',

        answers:
            [
                "Open Taekwondo Club",
                "Only Taekwondo Connection",
                "One Team Connection",
                "Olympic Taekwondo Club"
            ],

        correct:
            2
    },


    {
        question:
            "Trường Đại học Mở TP.HCM thuộc loại hình trường nào?",

        answers:
            [
                "Công lập",
                "Dân lập",
                "Tư thục",
                "Quốc tế"
            ],

        correct:
            0
    },


    {
        question:
            "Giải đấu thể thao truyền thống lớn nhất dành cho sinh viên toàn trường tên là gì?",

        answers:
            [
                "Hội thao OU",
                "Olympic OU",
                "OU Champions League",
                "Giải bóng đá sinh viên Mở"
            ],

        correct:
            0
    },


    {
        question:
            "Đâu là 4 giá trị cốt lõi trong bộ nhận diện thương hiệu của CLB OTC?",

        answers:
            [
                "Honor – Strength – Mindset – Unity",
                "Honor – Courtesy – Mindset – One Unity",
                "Respect – Discipline – Mindset – Connection",
                "Courage – Courtesy – Wisdom – One Unity"
            ],

        correct:
            1
    },


    {
        question:
            "Lịch tập định kỳ của CLB OTC diễn ra vào những ngày nào?",

        answers:
            [
                "Thứ 3, 5, 7",
                "Thứ 2, 4, 6",
                "Thứ Bảy, Chủ Nhật",
                "Mỗi ngày trong tuần"
            ],

        correct:
            1
    },


    {
        question:
            "Đối tượng nào có thể đăng ký tham gia CLB Taekwondo OTC?",

        answers:
            [
                "Dành cho người đã từng học võ Taekwondo",
                "Dành riêng cho tân sinh viên của trường OU",
                "Dành cho nam sinh viên có thể lực tốt",
                "Tất cả các bạn yêu thích võ thuật và các bạn chưa từng học võ"
            ],

        correct:
            3
    },


    {
        question:
            "Ưu đãi dành cho thành viên mới tham gia OTC là gì?",

        answers:
            [
                "Tặng võ phục miễn phí",
                "Miễn phí tháng đầu tiên",
                "Giảm 50% tiền thi đai",
                "Giảm 50% tiền võ phục"
            ],

        correct:
            1
    },


    {
        question:
            "Đâu KHÔNG phải là giá trị cốt lõi của CLB OTC?",

        answers:
            [
                "Honor",
                "Courtesy",
                "Mindset",
                "Money"
            ],

        correct:
            3
    },


    {
        question:
            "Địa chỉ sân tập chính thức của CLB OTC ở đâu?",

        answers:
            [
                "97 Võ Văn Tần, Q.3",
                "371 Nguyễn Kiệm, Gò Vấp",
                "35 Hồ Hảo Hớn, Q.1",
                "02 Nguyễn Bỉnh Khiêm, Q.1"
            ],

        correct:
            0
    },


    {
        question:
            "Khung giờ tập luyện chính thức của CLB OTC là khi nào?",

        answers:
            [
                "15h00 - 17h00",
                "17h00 - 19h00",
                "18h00 - 20h00",
                "19h30 - 21h30"
            ],

        correct:
            2
    },


    {
        question:
            "Ngoài võ thuật, câu lạc bộ OTC chú trọng phát triển điều gì nhất cho võ sinh?",

        answers:
            [
                "Khả năng ca hát và nghệ thuật",
                "Sức khỏe, tính kỷ luật và kỹ năng mềm",
                "Kỹ năng lập trình máy tính",
                "Cách kinh doanh và khởi nghiệp"
            ],

        correct:
            1
    }

];


// ================================
// XÁO TRỘN MẢNG
// ================================

function shuffleArray(array) {

    const result =
        [...array];


    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;

}


// ================================
// RESET QUESTION POOL
// ================================

function resetQuestionPool() {

    questionPool =
        shuffleArray(
            questions
        );

    questionIndex = 0;

}


// ================================
// LẤY CÂU HỎI TIẾP THEO
// ================================

function getNextQuestion() {

    if (
        questionPool.length === 0 ||
        questionIndex >= questionPool.length
    ) {

        resetQuestionPool();

    }


    const question =
        questionPool[
            questionIndex
        ];


    questionIndex++;

    return question;

}


// ================================
// TẠO POPUP CÂU HỎI
// ================================

function createQuestionModal() {

    if (
        document.getElementById(
            "questionModal"
        )
    ) {

        return;

    }


    const modal =
        document.createElement("div");


    modal.id =
        "questionModal";


    modal.innerHTML = `

        <div class="question-box">

            <div class="question-header">

                <span>
                    ❓ CÂU HỎI
                </span>

                <span id="questionNumber">
                </span>

            </div>


            <div
                id="questionText"
                class="question-text">
            </div>


            <div
                id="answerList"
                class="answer-list">
            </div>


            <div
                id="questionMessage"
                class="question-message">
            </div>


            <div
                class="question-progress">

                <span
                    id="questionProgressBar">
                </span>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );

}


// ================================
// HIỆN CÂU HỎI
// ================================

function showQuestion() {

    if (
        gameEnded ||
        questionActive ||
        timeLeft <= 0
    ) {

        return;

    }


    questionActive = true;

    gameRunning = false;


    clearTimeout(
        chickenSpawnTimeout
    );


    // Hạ âm lượng nhạc.
    duckMusic();


    createQuestionModal();


    const modal =
        document.getElementById(
            "questionModal"
        );


    const questionText =
        document.getElementById(
            "questionText"
        );


    const answerList =
        document.getElementById(
            "answerList"
        );


    const questionNumber =
        document.getElementById(
            "questionNumber"
        );


    const questionMessage =
        document.getElementById(
            "questionMessage"
        );


    const progressBar =
        document.getElementById(
            "questionProgressBar"
        );


    const question =
        getNextQuestion();


    questionNumber.textContent =
        `Câu ${questionsAnswered + 1}`;


    questionText.textContent =
        question.question;


    questionMessage.textContent =
        "";


    answerList.innerHTML =
        "";


    // Thanh thời gian câu hỏi.
    if (
        progressBar
    ) {

        progressBar.style.transform =
            "scaleX(1)";

        progressBar.style.transition =
            "none";


        requestAnimationFrame(
            function () {

                progressBar.style.transition =
                    "transform 0.95s linear";

                progressBar.style.transform =
                    "scaleX(0)";

            }
        );

    }


    // Tạo 4 đáp án.
    question.answers.forEach(
        function (
            answer,
            index
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "answer-button";


            button.textContent =
                `${String.fromCharCode(
                    65 + index
                )}. ${answer}`;


            button.addEventListener(
                "click",
                function () {

                    answerQuestion(
                        index,
                        question.correct
                    );

                }
            );


            answerList.appendChild(
                button
            );

        }
    );


    modal.style.display =
        "flex";

}


// ================================
// TRẢ LỜI CÂU HỎI
// ================================

function answerQuestion(
    selectedAnswer,
    correctAnswer
) {

    if (
        !questionActive
    ) {

        return;

    }


    const buttons =
        document.querySelectorAll(
            ".answer-button"
        );


    const questionMessage =
        document.getElementById(
            "questionMessage"
        );


    // Chặn bấm nhiều lần.
    buttons.forEach(
        function (button) {

            button.disabled =
                true;

        }
    );


    // =================================
    // ĐÚNG
    // =================================

    if (
        selectedAnswer ===
        correctAnswer
    ) {

        buttons[
            selectedAnswer
        ].classList.add(
            "correct"
        );


        questionMessage.textContent =
            "✅ CHÍNH XÁC! +1 ĐIỂM";


        score++;

    }


    // =================================
    // SAI
    // =================================

    else {

        buttons[
            selectedAnswer
        ].classList.add(
            "wrong"
        );


        buttons[
            correctAnswer
        ].classList.add(
            "correct"
        );


        questionMessage.textContent =
            "❌ SAI RỒI! KHÔNG ĐƯỢC ĐIỂM";

    }


    questionsAnswered++;


    updateUI();


    clearTimeout(
        questionAnswerTimeout
    );


    questionAnswerTimeout =
        setTimeout(
            function () {

                closeQuestion();

            },
            900
        );

}


// ================================
// ĐÓNG CÂU HỎI
// ================================

function closeQuestion() {

    clearTimeout(
        questionAnswerTimeout
    );


    const modal =
        document.getElementById(
            "questionModal"
        );


    if (
        modal
    ) {

        modal.remove();

    }


    questionActive = false;


    if (
        gameEnded ||
        timeLeft <= 0
    ) {

        return;

    }


    gameRunning = true;


    restoreMusicVolume();


    // Cho gà xuất hiện lại nhanh.
    scheduleChickenSpawn(80);

}


// ================================
// TRẠNG THÁI KỊCH TÍNH
// ================================

function updateDramaticState() {

    document.body.classList.remove(
        "game-danger",
        "game-critical"
    );


    timerElement.classList.remove(
        "timer-warning",
        "timer-critical"
    );


    removeLastSecondsText();


    // 6 -> 4 giây.
    if (
        timeLeft <= 6 &&
        timeLeft > 3
    ) {

        document.body.classList.add(
            "game-danger"
        );


        timerElement.classList.add(
            "timer-warning"
        );

    }


    // 3 -> 1 giây.
    else if (
        timeLeft <= 3 &&
        timeLeft > 0
    ) {

        document.body.classList.add(
            "game-critical"
        );


        timerElement.classList.add(
            "timer-critical"
        );


        showLastSecondsText();

    }


    restoreMusicVolume();

}


// ================================
// CHỮ CẢNH BÁO
// ================================

function showLastSecondsText() {

    if (
        document.getElementById(
            "lastSecondsText"
        )
    ) {

        return;

    }


    const text =
        document.createElement(
            "div"
        );


    text.id =
        "lastSecondsText";


    text.className =
        "last-seconds-text";


    text.textContent =
        timeLeft <= 1
            ? "🔥 ĐỢT CUỐI!"
            : "⚠️ NHANH LÊN!";


    gameArea.appendChild(
        text
    );

}


// ================================
// XÓA CHỮ CẢNH BÁO
// ================================

function removeLastSecondsText() {

    const text =
        document.getElementById(
            "lastSecondsText"
        );


    if (
        text
    ) {

        text.remove();

    }

}


// ================================
// UPDATE UI
// ================================

function updateUI() {

    scoreElement.textContent =
        score;


    timerElement.textContent =
        timeLeft;


    // 5 điểm = 1 lượt quay.
    const availableSpins =
        Math.floor(
            score / 5
        );


    spinCountElement.textContent =
        availableSpins;


    updateDramaticState();

}


// ================================
// TỐC ĐỘ SPAWN
// ================================

// 152 BPM:
// 1 beat ≈ 395ms
//
// Game tăng tốc theo thời gian.

function getSpawnInterval() {

    // 15 -> 13 giây
    if (
        timeLeft >= 13
    ) {

        return 790;

    }


    // 12 -> 10 giây
    if (
        timeLeft >= 10
    ) {

        return 590;

    }


    // 9 -> 7 giây
    if (
        timeLeft >= 7
    ) {

        return 395;

    }


    // 6 -> 4 giây
    if (
        timeLeft >= 4
    ) {

        return 295;

    }


    // 3 -> 0 giây
    return 198;

}


// ================================
// SỐ GÀ TỐI ĐA
// ================================

function getMaxChickens() {

    if (
        timeLeft >= 13
    ) {

        return 3;

    }


    if (
        timeLeft >= 10
    ) {

        return 4;

    }


    if (
        timeLeft >= 7
    ) {

        return 5;

    }


    if (
        timeLeft >= 4
    ) {

        return 7;

    }


    return 9;

}


// ================================
// THỜI GIAN SỐNG CỦA GÀ
// ================================

function getChickenLife() {

    if (
        timeLeft >= 10
    ) {

        return 1650;

    }


    if (
        timeLeft >= 7
    ) {

        return 1450;

    }


    if (
        timeLeft >= 4
    ) {

        return 1200;

    }


    return 900;

}


// ================================
// LÊN LỊCH SPAWN
// ================================

function scheduleChickenSpawn(
    delay = null
) {

    clearTimeout(
        chickenSpawnTimeout
    );


    chickenSpawnTimeout =
        setTimeout(
            function () {

                if (
                    gameEnded
                ) {

                    return;

                }


                if (
                    gameRunning &&
                    !questionActive
                ) {

                    const chickenCount =
                        gameArea.querySelectorAll(
                            ".chicken"
                        ).length;


                    if (
                        chickenCount <
                        getMaxChickens()
                    ) {

                        spawnChicken();

                    }

                }


                if (
                    !gameEnded
                ) {

                    scheduleChickenSpawn();

                }

            },

            delay !== null
                ? delay
                : (
                    questionActive
                        ? 120
                        : getSpawnInterval()
                )

        );

}


// ================================
// TẠO GÀ
// ================================

function spawnChicken() {

    if (
        !gameRunning ||
        questionActive ||
        gameEnded
    ) {

        return;

    }


    const chicken =
        document.createElement(
            "div"
        );


    chicken.className =
        "chicken";


    // 85% gà 🐔
    // 15% gà con 🐥
    chicken.textContent =
        Math.random() > 0.15
            ? "🐔"
            : "🐥";


    const areaWidth =
        gameArea.clientWidth;


    const areaHeight =
        gameArea.clientHeight;


    const safeWidth =
        Math.max(
            60,
            areaWidth - 90
        );


    const safeHeight =
        Math.max(
            120,
            areaHeight - 190
        );


    const x =
        Math.max(
            10,
            Math.random() *
            safeWidth
        );


    const y =
        80 +
        Math.random() *
        safeHeight;


    chicken.style.left =
        `${x}px`;


    chicken.style.top =
        `${y}px`;


    gameArea.appendChild(
        chicken
    );


    // ================================
    // CHUYỂN ĐỘNG
    // ================================

    let movementDuration;


    if (
        timeLeft >= 10
    ) {

        movementDuration =
            1350 +
            Math.random() * 450;

    }

    else if (
        timeLeft >= 7
    ) {

        movementDuration =
            1050 +
            Math.random() * 350;

    }

    else if (
        timeLeft >= 4
    ) {

        movementDuration =
            800 +
            Math.random() * 280;

    }

    else {

        movementDuration =
            560 +
            Math.random() * 220;

    }


    const direction =
        Math.random() > 0.5
            ? 1
            : -1;


    const moveX =
        direction *
        (
            100 +
            Math.random() * 200
        );


    const moveY =
        (
            Math.random() -
            0.5
        ) *
        150;


    chicken.animate(
        [
            {
                transform:
                    "translate(0,0) scale(1)"
            },

            {
                transform:
                    `translate(
                        ${moveX}px,
                        ${moveY}px
                    )
                    scale(1.05)`
            }
        ],

        {
            duration:
                movementDuration,

            easing:
                "ease-in-out",

            fill:
                "forwards"
        }
    );


    // ================================
    // CLICK GÀ
    // ================================

    chicken.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            hitChicken(
                chicken
            );

        }
    );


    // ================================
    // TỰ BIẾN MẤT
    // ================================

    const life =
        getChickenLife();


    setTimeout(
        function () {

            if (
                chicken.parentNode &&
                !chicken.classList.contains(
                    "hit"
                )
            ) {

                chicken.remove();

            }

        },
        life
    );

}


// ================================
// LẤY VỊ TRÍ THẬT CỦA GÀ
// ================================

function getChickenPosition(
    chicken
) {

    const gameRect =
        gameArea.getBoundingClientRect();


    const chickenRect =
        chicken.getBoundingClientRect();


    return {

        x:
            chickenRect.left -
            gameRect.left +
            chickenRect.width / 2,

        y:
            chickenRect.top -
            gameRect.top +
            chickenRect.height / 2

    };

}


// ================================
// CHƯỞNG GÀ
// ================================

function hitChicken(
    chicken
) {

    if (

        !gameRunning ||

        questionActive ||

        gameEnded ||

        chicken.classList.contains(
            "hit"
        )

    ) {

        return;

    }


    // Lấy vị trí hiện tại.
    const position =
        getChickenPosition(
            chicken
        );


    // =================================
    // HỦY ANIMATION BAY
    // =================================
    //
    // Rất quan trọng:
    // Animation bay cũng điều khiển transform.
    // Nếu không hủy thì animation hit
    // có thể bị xung đột.

    chicken
        .getAnimations()
        .forEach(
            function (animation) {

                animation.cancel();

            }
        );


    chicken.classList.add(
        "hit"
    );


    chicken.style.zIndex =
        "80";


    // Tạm dừng game.
    gameRunning =
        false;


    clearTimeout(
        chickenSpawnTimeout
    );


    // =================================
    // ÂM THANH HIT
    // =================================

    playHitSound();


    // =================================
    // HIỆU ỨNG
    // =================================

    createHitFlash(
        position.x,
        position.y
    );


    createHitRipple(
        position.x,
        position.y
    );


    createHand(
        position.x,
        position.y
    );


    createHitLabel(
        position.x,
        position.y
    );


    createScorePopup(
        position.x,
        position.y
    );


    // =================================
    // XÓA GÀ
    // =================================

    setTimeout(
        function () {

            if (
                chicken.parentNode
            ) {

                chicken.remove();

            }

        },
        430
    );


    // =================================
    // MỞ CÂU HỎI
    // =================================

    setTimeout(
        function () {

            if (
                !gameEnded &&
                timeLeft > 0 &&
                !questionActive
            ) {

                showQuestion();

            }

        },
        280
    );

}


// ================================
// FLASH
// ================================

function createHitFlash(
    x,
    y
) {

    const flash =
        document.createElement(
            "div"
        );


    flash.className =
        "hit-flash";


    flash.style.setProperty(
        "--hit-x",
        `${x}px`
    );


    flash.style.setProperty(
        "--hit-y",
        `${y}px`
    );


    gameArea.appendChild(
        flash
    );


    setTimeout(
        function () {

            if (
                flash.parentNode
            ) {

                flash.remove();

            }

        },
        350
    );

}


// ================================
// RIPPLE
// ================================

function createHitRipple(
    x,
    y
) {

    const ripple =
        document.createElement(
            "div"
        );


    ripple.className =
        "hit-ripple";


    ripple.style.left =
        `${x}px`;


    ripple.style.top =
        `${y}px`;


    gameArea.appendChild(
        ripple
    );


    setTimeout(
        function () {

            if (
                ripple.parentNode
            ) {

                ripple.remove();

            }

        },
        550
    );

}


// ================================
// BÀN TAY
// ================================

function createHand(
    x,
    y
) {

    const hand =
        document.createElement(
            "div"
        );


    hand.className =
        "hand dramatic-hand";


    hand.textContent =
        "✋";


    hand.style.left =
        `${x}px`;


    hand.style.top =
        `${y}px`;


    gameArea.appendChild(
        hand
    );


    setTimeout(
        function () {

            if (
                hand.parentNode
            ) {

                hand.remove();

            }

        },
        520
    );

}


// ================================
// CHỮ HIT
// ================================

function createHitLabel(
    x,
    y
) {

    const label =
        document.createElement(
            "div"
        );


    label.className =
        "hit-label";


    label.textContent =
        "⚡ HIT!";


    label.style.left =
        `${x}px`;


    label.style.top =
        `${y - 42}px`;


    gameArea.appendChild(
        label
    );


    setTimeout(
        function () {

            if (
                label.parentNode
            ) {

                label.remove();

            }

        },
        620
    );

}


// ================================
// +1 ĐIỂM
// ================================

function createScorePopup(
    x,
    y
) {

    const popup =
        document.createElement(
            "div"
        );


    popup.className =
        "score-popup dramatic-score";


    popup.textContent =
        "🎯 +1";


    popup.style.left =
        `${x}px`;


    popup.style.top =
        `${y - 4}px`;


    gameArea.appendChild(
        popup
    );


    setTimeout(
        function () {

            if (
                popup.parentNode
            ) {

                popup.remove();

            }

        },
        750
    );

}


// ================================
// START GAME
// ================================

startButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    // Dọn timer cũ.
    clearInterval(
        timerInterval
    );


    clearTimeout(
        chickenSpawnTimeout
    );


    clearTimeout(
        questionAnswerTimeout
    );


    // =================================
    // XÓA HIỆU ỨNG CŨ
    // =================================

    document
        .querySelectorAll(
            ".chicken, .hand, .hit-flash, .hit-ripple, .score-popup, .hit-label, #lastSecondsText"
        )
        .forEach(
            function (element) {

                element.remove();

            }
        );


    // Xóa modal cũ.
    const oldModal =
        document.getElementById(
            "questionModal"
        );


    if (
        oldModal
    ) {

        oldModal.remove();

    }


    // =================================
    // RESET
    // =================================

    score =
        0;


    timeLeft =
        GAME_DURATION;


    currentSpins =
        0;


    questionsAnswered =
        0;


    questionActive =
        false;


    gameEnded =
        false;


    gameRunning =
        true;


    wheelSpinning =
        false;


    // Xáo câu hỏi.
    resetQuestionPool();


    // =================================
    // RESET HIỆU ỨNG
    // =================================

    document.body.classList.remove(
        "game-danger",
        "game-critical"
    );


    timerElement.classList.remove(
        "timer-warning",
        "timer-critical"
    );


    gameScreen.classList.remove(
        "critical-beat"
    );


    gameArea.classList.remove(
        "music-beat",
        "music-beat-danger"
    );


    // =================================
    // UI
    // =================================

    updateUI();


    startMessage.style.display =
        "none";


    startButton.disabled =
        true;


    // =================================
    // BẮT ĐẦU NHẠC
    // =================================

    startBackgroundMusic();


    // =================================
    // GÀ ĐẦU TIÊN
    // =================================

    spawnChicken();


    scheduleChickenSpawn(
        250
    );


    // =================================
    // COUNTDOWN
    // =================================

    timerInterval =
        setInterval(
            function () {

                // Đang trả lời câu hỏi
                // thì thời gian tạm dừng.

                if (
                    !gameRunning ||
                    questionActive ||
                    gameEnded
                ) {

                    return;

                }


                timeLeft--;


                updateUI();


                // Hết giờ.
                if (
                    timeLeft <= 0
                ) {

                    timeLeft =
                        0;


                    updateUI();


                    endGame();

                }

            },
            1000
        );

}


// ================================
// PRIZES
// ================================

const prizes = [

    "🎁 QUÀ TẶNG",

    "⭐ +10 ĐIỂM",

    "🎁 QUÀ TẶNG",

    "🍀 MAY MẮN",

    "🎁 QUÀ TẶNG",

    "💰 +20 ĐIỂM",

    "🎁 QUÀ TẶNG",

    "🏆 JACKPOT"

];


// ================================
// END GAME
// ================================

function endGame() {

    if (
        gameEnded
    ) {

        return;

    }


    gameEnded =
        true;


    gameRunning =
        false;


    questionActive =
        false;


    // =================================
    // DỪNG TIMER
    // =================================

    clearInterval(
        timerInterval
    );


    clearTimeout(
        chickenSpawnTimeout
    );


    clearTimeout(
        questionAnswerTimeout
    );


    // =================================
    // DỪNG NHẠC
    // =================================

    stopBackgroundMusic();


    // =================================
    // RESET HIỆU ỨNG
    // =================================

    document.body.classList.remove(
        "game-danger",
        "game-critical"
    );


    timerElement.classList.remove(
        "timer-warning",
        "timer-critical"
    );


    gameScreen.classList.remove(
        "critical-beat"
    );


    // =================================
    // XÓA TẤT CẢ GÀ
    // =================================

    document
        .querySelectorAll(
            ".chicken, .hand, .hit-flash, .hit-ripple, .score-popup, .hit-label, #lastSecondsText"
        )
        .forEach(
            function (element) {

                element.remove();

            }
        );


    // =================================
    // XÓA POPUP CÂU HỎI
    // =================================

    const questionModal =
        document.getElementById(
            "questionModal"
        );


    if (
        questionModal
    ) {

        questionModal.remove();

    }


    // =================================
    // TÍNH LƯỢT QUAY
    // =================================

    currentSpins =
        Math.floor(
            score / 5
        );


    // =================================
    // HIỆN KẾT QUẢ
    // =================================

    finalScoreElement.textContent =
        score;


    finalSpinCountElement.textContent =
        currentSpins;


    // =================================
    // CHUYỂN MÀN HÌNH
    // =================================

    gameScreen.classList.add(
        "hidden"
    );


    resultScreen.classList.remove(
        "hidden"
    );

}


// ================================
// ĐI TỚI VÒNG QUAY
// ================================

goWheelButton.addEventListener(
    "click",
    function () {

        resultScreen.classList.add(
            "hidden"
        );


        wheelScreen.classList.remove(
            "hidden"
        );


        remainingSpinElement.textContent =
            currentSpins;


        updateSpinButton();

    }
);


// ================================
// SPIN WHEEL
// ================================

spinButton.addEventListener(
    "click",
    spinWheel
);


// ================================
// XÁC ĐỊNH PHẦN THƯỞNG
// ================================

function getPrizeIndex() {

    const random =
        Math.random() *
        100;


    if (
        random < 25
    ) {

        return 0;

    }


    if (
        random < 50
    ) {

        return 1;

    }


    if (
        random < 70
    ) {

        return 2;

    }


    if (
        random < 85
    ) {

        return 3;

    }


    if (
        random < 95
    ) {

        return 4;

    }


    if (
        random < 98
    ) {

        return 5;

    }


    if (
        random < 99
    ) {

        return 6;

    }


    // Jackpot 1%.
    return 7;

}


// ================================
// QUAY VÒNG QUAY
// ================================

function spinWheel() {

    if (
        currentSpins <= 0 ||
        wheelSpinning
    ) {

        return;

    }


    wheelSpinning =
        true;


    // Trừ lượt.
    currentSpins--;


    remainingSpinElement.textContent =
        currentSpins;


    spinButton.disabled =
        true;


    prizeResult.classList.add(
        "hidden"
    );


    // =================================
    // RANDOM THƯỞNG
    // =================================

    const prizeIndex =
        getPrizeIndex();


    const segmentAngle =
        360 /
        prizes.length;


    const targetAngle =
        360 -
        (
            prizeIndex *
            segmentAngle +
            segmentAngle / 2
        );


    // =================================
    // QUAY 6 VÒNG
    // =================================

    wheelRotation +=
        360 * 6 +
        targetAngle;


    wheel.style.transform =
        `rotate(${wheelRotation}deg)`;


    // =================================
    // HIỆN KẾT QUẢ
    // =================================

    setTimeout(
        function () {

            prizeText.textContent =
                prizes[
                    prizeIndex
                ];


            prizeResult.classList.remove(
                "hidden"
            );


            wheelSpinning =
                false;


            updateSpinButton();

        },
        4300
    );

}


// ================================
// UPDATE SPIN BUTTON
// ================================

function updateSpinButton() {

    spinButton.disabled =
        currentSpins <= 0 ||
        wheelSpinning;

}


// ================================
// RESTART
// ================================

restartButton.addEventListener(
    "click",
    restartGame
);


function restartGame() {

    // =================================
    // DỪNG TIMER / TIMEOUT
    // =================================

    clearInterval(
        timerInterval
    );


    clearTimeout(
        chickenSpawnTimeout
    );


    clearTimeout(
        questionAnswerTimeout
    );


    // =================================
    // DỪNG NHẠC
    // =================================

    stopBackgroundMusic();


    // =================================
    // XÓA MODAL
    // =================================

    const modal =
        document.getElementById(
            "questionModal"
        );


    if (
        modal
    ) {

        modal.remove();

    }


    // =================================
    // XÓA HIỆU ỨNG / GÀ
    // =================================

    document
        .querySelectorAll(
            ".chicken, .hand, .hit-flash, .hit-ripple, .score-popup, .hit-label, #lastSecondsText"
        )
        .forEach(
            function (element) {

                element.remove();

            }
        );


    // =================================
    // RESET GAME
    // =================================

    score =
        0;


    timeLeft =
        GAME_DURATION;


    currentSpins =
        0;


    questionsAnswered =
        0;


    questionActive =
        false;


    questionPool =
        [];


    questionIndex =
        0;


    gameRunning =
        false;


    gameEnded =
        false;


    wheelSpinning =
        false;


    // =================================
    // RESET HIỆU ỨNG
    // =================================

    document.body.classList.remove(
        "game-danger",
        "game-critical"
    );


    timerElement.classList.remove(
        "timer-warning",
        "timer-critical"
    );


    gameScreen.classList.remove(
        "critical-beat"
    );


    gameArea.classList.remove(
        "music-beat",
        "music-beat-danger"
    );


    // =================================
    // UI
    // =================================

    updateUI();


    // =================================
    // RESET MÀN HÌNH
    // =================================

    wheelScreen.classList.add(
        "hidden"
    );


    resultScreen.classList.add(
        "hidden"
    );


    gameScreen.classList.remove(
        "hidden"
    );


    // =================================
    // RESET START SCREEN
    // =================================

    startMessage.style.display =
        "block";


    startButton.disabled =
        false;


    startButton.textContent =
        "BẮT ĐẦU";


    // =================================
    // RESET VÒNG QUAY
    // =================================

    wheelRotation =
        0;


    wheel.style.transform =
        "rotate(0deg)";


    prizeResult.classList.add(
        "hidden"
    );


    remainingSpinElement.textContent =
        "0";


    prizeText.textContent =
        "";


    updateSpinButton();

}


// ================================
// KHỞI TẠO BAN ĐẦU
// ================================

updateUI();

updateSpinButton();
