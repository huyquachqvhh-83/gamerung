/* =========================================================
   CHƯỞNG GÀ - SCRIPT.JS
   Supabase + Game + Leaderboard + Admin

   AUDIO:
   - music.mp3
   - hit.mp3

   GAME:
   - 60 giây
   - Gà tăng tốc theo thời gian
   - Gà bám theo beat của nhạc
   - Cuối game tăng tốc mạnh
========================================================= */
<button class="delete-user-button">🗑️ Xóa</button>
const { error } = await supabaseClient.rpc(
    "admin_delete_profile",
    {
        target_user_id: userId
    }
);
/* =========================================================
   1. SUPABASE CONFIG
========================================================= */

const SUPABASE_URL =
    "https://qlrtgivtgvlnvkibqtej.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_7isDs5a45y__a6zPgKJjMQ_boGU73Uu";

let supabaseClient = null;

if (
    window.supabase &&
    SUPABASE_URL !== "YOUR_SUPABASE_URL" &&
    SUPABASE_PUBLISHABLE_KEY !== "YOUR_SUPABASE_PUBLISHABLE_KEY"
) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );

}


/* =========================================================
   2. GAME CONFIG
========================================================= */

const GAME_DURATION = 60;


/*
   BPM của nhạc.

   152 BPM
   1 beat ≈ 394.7ms
*/
const MUSIC_BPM = 152;

const BEAT_TIME =
    60000 / MUSIC_BPM;


/*
   Tốc độ gà theo beat:

   Đầu:
   2 beat / gà

   15s:
   ~1.6 beat / gà

   30s:
   ~1.2 beat / gà

   45s:
   ~0.8 beat / gà

   Cuối:
   0.5 beat / gà
*/


/* Thời gian gà tồn tại */

const CHICKEN_LIFETIME_START =
    2200;

const CHICKEN_LIFETIME_END =
    650;


/* =========================================================
   3. DOM
========================================================= */

const authScreen =
    document.getElementById("authScreen");

const gameScreen =
    document.getElementById("gameScreen");

const resultScreen =
    document.getElementById("resultScreen");

const leaderboardScreen =
    document.getElementById("leaderboardScreen");

const adminScreen =
    document.getElementById("adminScreen");


/* AUTH */

const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const authMessage =
    document.getElementById("authMessage");


const loginUsername =
    document.getElementById("loginUsername");

const loginPassword =
    document.getElementById("loginPassword");


const registerUsername =
    document.getElementById("registerUsername");

const registerPassword =
    document.getElementById("registerPassword");

const registerPassword2 =
    document.getElementById("registerPassword2");


/* GAME */

const gameArea =
    document.getElementById("gameArea");

const startMessage =
    document.getElementById("startMessage");

const startButton =
    document.getElementById("startButton");

const scoreElement =
    document.getElementById("score");

const timerElement =
    document.getElementById("timer");

const finalScoreElement =
    document.getElementById("finalScore");

const playAgainButton =
    document.getElementById("playAgainButton");

const scoreSaveMessage =
    document.getElementById("scoreSaveMessage");


/* ACCOUNT */

const currentUsername =
    document.getElementById("currentUsername");

const logoutButton =
    document.getElementById("logoutButton");

const leaderboardButton =
    document.getElementById("leaderboardButton");

const resultLeaderboardButton =
    document.getElementById(
        "resultLeaderboardButton"
    );

const adminButton =
    document.getElementById("adminButton");


/* LEADERBOARD */

const leaderboardBody =
    document.getElementById("leaderboardBody");

const leaderboardBackButton =
    document.getElementById(
        "leaderboardBackButton"
    );


/* ADMIN */

const adminBody =
    document.getElementById("adminBody");

const adminMessage =
    document.getElementById("adminMessage");

const adminBackButton =
    document.getElementById("adminBackButton");


/* =========================================================
   4. GAME STATE
========================================================= */

let score = 0;

let timeLeft =
    GAME_DURATION;

let gameRunning = false;

let gameTimer = null;


/*
   chickenTimer hiện tại là setTimeout
   chứ không còn setInterval.
*/
let chickenTimer = null;


let currentUser = null;

let currentProfile = null;

let questionActive = false;

let gameEnded = false;


/* =========================================================
   5. AUDIO
   CHỈ DÙNG 2 FILE
========================================================= */

const bgMusic =
    new Audio("music.mp3");

const hitSound =
    new Audio("hit.mp3");


bgMusic.loop = true;

bgMusic.volume = 0.32;

hitSound.volume = 0.8;


/* =========================================================
   6. AUDIO HELPERS
========================================================= */

function playHitSound() {

    try {

        hitSound.currentTime = 0;

        const promise =
            hitSound.play();

        if (promise !== undefined) {

            promise.catch(() => {});

        }

    } catch (error) {

        console.warn(
            "Hit sound error:",
            error
        );

    }

}


function startBackgroundMusic() {

    try {

        bgMusic.currentTime = 0;

        const promise =
            bgMusic.play();

        if (promise !== undefined) {

            promise.catch(() => {

                console.log(
                    "Không thể tự phát nhạc."
                );

            });

        }

    } catch (error) {

        console.warn(
            "Background music error:",
            error
        );

    }

}


function stopBackgroundMusic() {

    try {

        bgMusic.pause();

        bgMusic.currentTime = 0;

    } catch (error) {

        console.warn(
            "Stop music error:",
            error
        );

    }

}


/* =========================================================
   7. QUESTIONS
========================================================= */

const questionBank = [

    {
        question:
            "Thủ đô của Việt Nam là gì?",

        answers: [
            "TP. Hồ Chí Minh",
            "Hà Nội",
            "Đà Nẵng",
            "Huế"
        ],

        correct: 1
    },

    {
        question:
            "1 + 1 bằng bao nhiêu?",

        answers: [
            "1",
            "2",
            "3",
            "4"
        ],

        correct: 1
    },

    {
        question:
            "Con vật nào thường được gọi là 'chúa sơn lâm'?",

        answers: [
            "Voi",
            "Hổ",
            "Gà",
            "Khỉ"
        ],

        correct: 1
    },

    {
        question:
            "Nước nào có hình chữ S?",

        answers: [
            "Việt Nam",
            "Nhật Bản",
            "Hàn Quốc",
            "Thái Lan"
        ],

        correct: 0
    },

    {
        question:
            "Một tuần có bao nhiêu ngày?",

        answers: [
            "5",
            "6",
            "7",
            "8"
        ],

        correct: 2
    },

    {
        question:
            "Hành tinh nào gần Mặt Trời nhất?",

        answers: [
            "Trái Đất",
            "Sao Kim",
            "Sao Thủy",
            "Sao Hỏa"
        ],

        correct: 2
    },

    {
        question:
            "CPU là viết tắt của gì?",

        answers: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Program Utility",
            "Control Processing User"
        ],

        correct: 0
    },

    {
        question:
            "HTML chủ yếu dùng để làm gì?",

        answers: [
            "Xử lý ảnh",
            "Tạo cấu trúc trang web",
            "Chơi game",
            "Quản lý cơ sở dữ liệu"
        ],

        correct: 1
    },

    {
        question:
            "JavaScript thường được dùng để làm gì trên website?",

        answers: [
            "Tạo tương tác",
            "Thay thế HTML",
            "Tạo nguồn điện",
            "Nén hình ảnh"
        ],

        correct: 0
    },

    {
        question:
            "Con gà có mấy chân?",

        answers: [
            "1",
            "2",
            "3",
            "4"
        ],

        correct: 1
    },

    {
        question:
            "Mặt Trời mọc ở hướng nào?",

        answers: [
            "Đông",
            "Tây",
            "Nam",
            "Bắc"
        ],

        correct: 0
    },

    {
        question:
            "RGB gồm những màu nào?",

        answers: [
            "Đỏ, xanh lá, xanh dương",
            "Đỏ, vàng, trắng",
            "Đen, trắng, xám",
            "Cam, tím, hồng"
        ],

        correct: 0
    },

    {
        question:
            "Loài vật nào đẻ trứng?",

        answers: [
            "Gà",
            "Chó",
            "Mèo",
            "Bò"
        ],

        correct: 0
    }

];


/* =========================================================
   8. SHOW SCREEN
========================================================= */

function showScreen(screen) {

    const screens = [
        authScreen,
        gameScreen,
        resultScreen,
        leaderboardScreen,
        adminScreen
    ];


    screens.forEach(item => {

        if (!item) return;

        item.classList.add("hidden");

        item.classList.remove("active");

    });


    if (screen) {

        screen.classList.remove("hidden");

        screen.classList.add("active");

    }

}


/* =========================================================
   9. USERNAME
========================================================= */

function normalizeUsername(username) {

    return String(username || "")
        .trim()
        .toLowerCase();

}


function validUsername(username) {

    return /^[a-z0-9_]{3,20}$/.test(
        username
    );

}


function usernameToInternalEmail(username) {

    const cleanUsername =
        normalizeUsername(username);

    return `${cleanUsername}@chuongga.local`;

}


/* =========================================================
   10. AUTH MESSAGE
========================================================= */

function showAuthMessage(
    message,
    type = ""
) {

    if (!authMessage) return;

    authMessage.textContent =
        message;

    authMessage.className =
        "auth-message";


    if (type) {

        authMessage.classList.add(
            type
        );

    }

}


function clearAuthMessage() {

    if (!authMessage) return;

    authMessage.textContent = "";

    authMessage.className =
        "auth-message";

}


/* =========================================================
   11. AUTH TABS
========================================================= */

function showLogin() {

    loginTab.classList.add(
        "active"
    );

    registerTab.classList.remove(
        "active"
    );


    loginForm.classList.remove(
        "hidden"
    );

    registerForm.classList.add(
        "hidden"
    );


    clearAuthMessage();

}


function showRegister() {

    registerTab.classList.add(
        "active"
    );

    loginTab.classList.remove(
        "active"
    );


    registerForm.classList.remove(
        "hidden"
    );

    loginForm.classList.add(
        "hidden"
    );


    clearAuthMessage();

}


loginTab.addEventListener(
    "click",
    showLogin
);


registerTab.addEventListener(
    "click",
    showRegister
);


/* =========================================================
   12. REGISTER
========================================================= */

registerForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!supabaseClient) {

            showAuthMessage(
                "Chưa cấu hình Supabase.",
                "error"
            );

            return;

        }


        const username =
            normalizeUsername(
                registerUsername.value
            );

        const password =
            registerPassword.value;

        const password2 =
            registerPassword2.value;


        if (!validUsername(username)) {

            showAuthMessage(
                "Tên tài khoản phải có 3–20 ký tự, chỉ gồm chữ, số và _.",
                "error"
            );

            return;

        }


        if (password.length < 6) {

            showAuthMessage(
                "Mật khẩu phải có ít nhất 6 ký tự.",
                "error"
            );

            return;

        }


        if (password !== password2) {

            showAuthMessage(
                "Hai mật khẩu không giống nhau.",
                "error"
            );

            return;

        }


        showAuthMessage(
            "Đang tạo tài khoản..."
        );


        try {

            const {
                data: existingProfile,
                error: profileError
            } =
                await supabaseClient
                    .from("profiles")
                    .select("id")
                    .eq(
                        "username",
                        username
                    )
                    .maybeSingle();


            if (profileError) {

                console.error(
                    profileError
                );

            }


            if (existingProfile) {

                showAuthMessage(
                    "Tên tài khoản này đã tồn tại.",
                    "error"
                );

                return;

            }


            const internalEmail =
                usernameToInternalEmail(
                    username
                );


            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({

                    email:
                        internalEmail,

                    password:
                        password,

                    options: {

                        data: {
                            username:
                                username
                        }

                    }

                });


            if (error) {

                console.error(error);

                showAuthMessage(
                    translateAuthError(
                        error.message
                    ),
                    "error"
                );

                return;

            }


            if (!data.session) {

                showAuthMessage(
                    "Tạo tài khoản thành công. Hãy kiểm tra cấu hình Email Confirmation trong Supabase.",
                    "success"
                );

                return;

            }


            showAuthMessage(
                "Tạo tài khoản thành công!",
                "success"
            );


            await loadCurrentUser();


        } catch (error) {

            console.error(error);

            showAuthMessage(
                "Không thể tạo tài khoản.",
                "error"
            );

        }

    }
);


/* =========================================================
   13. LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!supabaseClient) {

            showAuthMessage(
                "Chưa cấu hình Supabase.",
                "error"
            );

            return;

        }


        const username =
            normalizeUsername(
                loginUsername.value
            );

        const password =
            loginPassword.value;


        if (!validUsername(username)) {

            showAuthMessage(
                "Tên tài khoản không hợp lệ.",
                "error"
            );

            return;

        }


        if (!password) {

            showAuthMessage(
                "Vui lòng nhập mật khẩu.",
                "error"
            );

            return;

        }


        showAuthMessage(
            "Đang đăng nhập..."
        );


        try {

            const internalEmail =
                usernameToInternalEmail(
                    username
                );


            const {
                data,
                error
            } =
                await supabaseClient.auth.signInWithPassword({

                    email:
                        internalEmail,

                    password:
                        password

                });


            if (error) {

                console.error(error);

                showAuthMessage(
                    "Tên tài khoản hoặc mật khẩu không đúng.",
                    "error"
                );

                return;

            }


            currentUser =
                data.user;


            await loadCurrentUser();


        } catch (error) {

            console.error(error);

            showAuthMessage(
                "Đăng nhập thất bại.",
                "error"
            );

        }

    }
);


/* =========================================================
   14. AUTH ERROR
========================================================= */

function translateAuthError(message) {

    const text =
        String(message || "")
            .toLowerCase();


    if (
        text.includes(
            "already registered"
        )
    ) {

        return "Tài khoản này đã tồn tại.";

    }


    if (
        text.includes("password")
    ) {

        return "Mật khẩu không hợp lệ.";

    }


    if (
        text.includes("invalid")
    ) {

        return "Thông tin tài khoản không hợp lệ.";

    }


    return "Có lỗi xảy ra. Vui lòng thử lại.";

}


/* =========================================================
   15. LOAD CURRENT USER
========================================================= */

async function loadCurrentUser() {

    if (!supabaseClient) return;


    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (
        error ||
        !data.user
    ) {

        currentUser = null;

        showScreen(
            authScreen
        );

        return;

    }


    currentUser =
        data.user;


    await loadProfile();


    if (!currentProfile) {

        await createMissingProfile();

    }


    if (!currentProfile) {

        showAuthMessage(
            "Không tìm thấy thông tin tài khoản.",
            "error"
        );

        showScreen(
            authScreen
        );

        return;

    }


    if (
        currentProfile.is_active === false
    ) {

        await supabaseClient.auth.signOut();

        showAuthMessage(
            "Tài khoản của bạn đã bị khóa.",
            "error"
        );

        showScreen(
            authScreen
        );

        return;

    }


    updateAccountUI();


    showScreen(
        gameScreen
    );

}


/* =========================================================
   16. LOAD PROFILE
========================================================= */

async function loadProfile() {

    currentProfile = null;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "id, username, role, is_active, best_score, total_games"
            )
            .eq(
                "id",
                currentUser.id
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return;

    }


    currentProfile =
        data;

}


/* =========================================================
   17. CREATE MISSING PROFILE
========================================================= */

async function createMissingProfile() {

    const username =
        normalizeUsername(

            currentUser.user_metadata?.username
            ||
            currentUser.email?.split("@")[0]
            ||
            "player"

        );


    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .insert({

                id:
                    currentUser.id,

                username:
                    username,

                role:
                    "player",

                is_active:
                    true,

                best_score:
                    0,

                total_games:
                    0

            })
            .select()
            .single();


    if (error) {

        console.error(
            "Create profile error:",
            error
        );

        return;

    }


    currentProfile =
        data;

}


/* =========================================================
   18. ACCOUNT UI
========================================================= */

function updateAccountUI() {

    if (!currentProfile) return;


    currentUsername.textContent =
        currentProfile.username;


    if (
        currentProfile.role === "admin"
    ) {

        adminButton.classList.remove(
            "hidden"
        );

    } else {

        adminButton.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   19. START GAME
========================================================= */

startButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    if (gameRunning) return;


    score = 0;

    timeLeft =
        GAME_DURATION;

    gameRunning = true;

    gameEnded = false;

    questionActive = false;


    /* ÂM NHẠC */

    startBackgroundMusic();


    scoreElement.textContent =
        score;

    timerElement.textContent =
        timeLeft;


    startMessage.classList.add(
        "hidden"
    );


    removeAllChickens();


    clearInterval(
        gameTimer
    );

    clearTimeout(
        chickenTimer
    );


    /* GAME TIMER */

    gameTimer =
        setInterval(
            gameTick,
            1000
        );


    /*
       Spawn con đầu tiên ngay lập tức
    */

    spawnChicken();


    /*
       Sau đó bắt đầu chạy theo beat
    */

    scheduleNextChicken();

}


/* =========================================================
   20. GAME TIMER
========================================================= */

function gameTick() {

    if (!gameRunning) return;


    timeLeft--;

    timerElement.textContent =
        timeLeft;


    if (timeLeft <= 0) {

        endGame();

    }

}


/* =========================================================
   21. GAME PROGRESS
========================================================= */

function getGameProgress() {

    const elapsed =
        GAME_DURATION -
        timeLeft;


    return Math.min(
        1,
        Math.max(
            0,
            elapsed / GAME_DURATION
        )
    );

}


/* =========================================================
   22. CHICKEN SPEED
========================================================= */

function getChickenBeatMultiplier() {

    const progress =
        getGameProgress();


    /*
       0s
       2.0 beat / gà

       15s
       ~1.65 beat / gà

       30s
       ~1.25 beat / gà

       45s
       ~0.8 beat / gà

       60s
       0.5 beat / gà
    */


    if (progress < 0.15) {

        return 2.0;

    }


    if (progress < 0.35) {

        return 1.65;

    }


    if (progress < 0.55) {

        return 1.3;

    }


    if (progress < 0.75) {

        return 0.9;

    }


    return 0.5;

}


/* =========================================================
   23. GET CHICKEN SPAWN TIME
========================================================= */

function getChickenSpawnTime() {

    const multiplier =
        getChickenBeatMultiplier();


    let delay =
        BEAT_TIME *
        multiplier;


    /*
       Không cho vượt quá 1 giây
    */

    delay =
        Math.min(
            1000,
            delay
        );


    /*
       Cuối game không xuống quá thấp
       để trình duyệt không bị spam DOM.
    */

    delay =
        Math.max(
            180,
            delay
        );


    return Math.round(
        delay
    );

}


/* =========================================================
   24. SCHEDULE NEXT CHICKEN
========================================================= */

function scheduleNextChicken() {

    if (!gameRunning) return;


    clearTimeout(
        chickenTimer
    );


    const delay =
        getChickenSpawnTime();


    chickenTimer =
        setTimeout(
            () => {

                if (!gameRunning) {
                    return;
                }


                /*
                   Nếu đang trả lời câu hỏi
                   thì không spawn con mới.
                */

                if (!questionActive) {

                    spawnChicken();

                }


                /*
                   Lập lịch tiếp theo.
                */

                scheduleNextChicken();

            },
            delay
        );

}


/* =========================================================
   25. CHICKEN LIFETIME
========================================================= */

function getChickenLifetime() {

    const progress =
        getGameProgress();


    /*
       Tăng tốc theo đường cong.

       Đầu game:
       ~2200ms

       Giữa:
       ~1400ms

       Cuối:
       ~650ms
    */

    const curve =
        Math.pow(
            progress,
            1.45
        );


    const lifetime =
        CHICKEN_LIFETIME_START -
        (
            CHICKEN_LIFETIME_START -
            CHICKEN_LIFETIME_END
        ) *
        curve;


    return Math.round(
        lifetime
    );

}


/* =========================================================
   26. SPAWN CHICKEN
========================================================= */

function spawnChicken() {

    if (!gameRunning) return;

    if (questionActive) return;


    const chicken =
        document.createElement(
            "div"
        );


    chicken.className =
        "chicken";


    /*
       Gà thường nhiều hơn gà con
    */

    chicken.textContent =
        Math.random() > 0.25
            ? "🐔"
            : "🐥";


    const areaWidth =
        gameArea.clientWidth;

    const areaHeight =
        gameArea.clientHeight;


    const minX = 25;

    const maxX =
        Math.max(
            minX,
            areaWidth - 90
        );


    const minY = 100;

    const maxY =
        Math.max(
            minY,
            areaHeight - 130
        );


    const x =
        randomNumber(
            minX,
            maxX
        );


    const y =
        randomNumber(
            minY,
            maxY
        );


    chicken.style.left =
        `${x}px`;

    chicken.style.top =
        `${y}px`;


    /*
       CLICK GÀ
    */

    chicken.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            hitChicken(
                chicken
            );

        }
    );


    gameArea.appendChild(
        chicken
    );


    /*
       Gà tự biến mất.
       Cuối game biến mất nhanh hơn.
    */

    const lifetime =
        getChickenLifetime();


    setTimeout(
        () => {

            if (
                chicken &&
                chicken.parentNode
            ) {

                chicken.remove();

            }

        },
        lifetime
    );

}


/* =========================================================
   27. RANDOM
========================================================= */

function randomNumber(
    min,
    max
) {

    return Math.floor(
        Math.random() *
        (max - min + 1)
    ) + min;

}


/* =========================================================
   28. REMOVE CHICKENS
========================================================= */

function removeAllChickens() {

    const chickens =
        gameArea.querySelectorAll(
            ".chicken"
        );


    chickens.forEach(
        chicken =>
            chicken.remove()
    );

}


/* =========================================================
   29. HIT CHICKEN
========================================================= */

function hitChicken(
    chicken
) {

    if (!gameRunning) return;

    if (questionActive) return;


    questionActive = true;


    /*
       VỊ TRÍ HIT
    */

    let hitX = 50;

    let hitY = 50;


    if (chicken) {

        hitX =
            chicken.offsetLeft +
            chicken.offsetWidth / 2;

        hitY =
            chicken.offsetTop +
            chicken.offsetHeight / 2;

    }


    /*
       HIT SOUND
    */

    playHitSound();


    /*
       GÀ BỊ ĐÁNH
    */

    if (
        chicken &&
        chicken.parentNode
    ) {

        chicken.classList.add(
            "hit"
        );


        setTimeout(
            () => {

                if (
                    chicken &&
                    chicken.parentNode
                ) {

                    chicken.remove();

                }

            },
            250
        );

    }


    /*
       EXPLOSION
    */

    createHitExplosion(
        hitX,
        hitY
    );


    /*
       HAND
    */

    showHitEffect(
        hitX,
        hitY
    );


    /*
       CÂU HỎI
    */

    setTimeout(
        () => {

            if (!gameRunning) return;

            showQuestion();

        },
        180
    );

}


/* =========================================================
   30. HIT HAND EFFECT
========================================================= */

function showHitEffect(
    x = null,
    y = null
) {

    const hand =
        document.createElement(
            "div"
        );


    hand.className =
        "hit-hand";


    hand.textContent =
        "🖐️";


    if (
        x !== null &&
        y !== null
    ) {

        hand.style.left =
            `${x - 35}px`;

        hand.style.top =
            `${y - 45}px`;

    } else {

        hand.style.left =
            `${randomNumber(
                20,
                75
            )}%`;

        hand.style.top =
            `${randomNumber(
                25,
                70
            )}%`;

    }


    gameArea.appendChild(
        hand
    );


    setTimeout(
        () => {

            if (
                hand &&
                hand.parentNode
            ) {

                hand.remove();

            }

        },
        650
    );

}


/* =========================================================
   31. HIT EXPLOSION
========================================================= */

function createHitExplosion(
    x,
    y
) {

    const explosion =
        document.createElement(
            "div"
        );


    explosion.className =
        "hit-explosion";


    explosion.style.left =
        `${x}px`;

    explosion.style.top =
        `${y}px`;


    gameArea.appendChild(
        explosion
    );


    /*
       12 PARTICLES
    */

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        createHitParticle(
            x,
            y
        );

    }


    setTimeout(
        () => {

            if (
                explosion &&
                explosion.parentNode
            ) {

                explosion.remove();

            }

        },
        500
    );

}


/* =========================================================
   32. HIT PARTICLE
========================================================= */

function createHitParticle(
    x,
    y
) {

    const particle =
        document.createElement(
            "div"
        );


    particle.className =
        "hit-particle";


    particle.style.left =
        `${x}px`;

    particle.style.top =
        `${y}px`;


    const angle =
        Math.random() *
        Math.PI *
        2;


    const distance =
        randomNumber(
            45,
            100
        );


    const particleX =
        Math.cos(angle) *
        distance;


    const particleY =
        Math.sin(angle) *
        distance;


    particle.style.setProperty(
        "--particle-x",
        `${particleX}px`
    );


    particle.style.setProperty(
        "--particle-y",
        `${particleY}px`
    );


    gameArea.appendChild(
        particle
    );


    setTimeout(
        () => {

            if (
                particle &&
                particle.parentNode
            ) {

                particle.remove();

            }

        },
        650
    );

}


/* =========================================================
   33. QUESTION
========================================================= */

function showQuestion() {

    const question =
        questionBank[
            randomNumber(
                0,
                questionBank.length - 1
            )
        ];


    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "question-overlay";


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "question-modal";


    const title =
        document.createElement(
            "h2"
        );


    title.textContent =
        "🐔 CÂU HỎI";


    const questionText =
        document.createElement(
            "p"
        );


    questionText.className =
        "question-text";


    questionText.textContent =
        question.question;


    const answers =
        document.createElement(
            "div"
        );


    answers.className =
        "question-answers";


    question.answers.forEach(
        (answer, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "answer-button";


            button.type =
                "button";


            button.textContent =
                `${String.fromCharCode(
                    65 + index
                )}. ${answer}`;


            button.addEventListener(
                "click",
                () => {

                    answerQuestion(
                        index,
                        question.correct,
                        overlay
                    );

                }
            );


            answers.appendChild(
                button
            );

        }
    );


    modal.appendChild(
        title
    );

    modal.appendChild(
        questionText
    );

    modal.appendChild(
        answers
    );


    overlay.appendChild(
        modal
    );


    document.body.appendChild(
        overlay
    );

}


/* =========================================================
   34. ANSWER
========================================================= */

function answerQuestion(
    selected,
    correct,
    overlay
) {

    const buttons =
        overlay.querySelectorAll(
            ".answer-button"
        );


    buttons.forEach(
        button => {

            button.disabled =
                true;

        }
    );


    if (
        selected === correct
    ) {

        score++;


        scoreElement.textContent =
            score;


        buttons[selected]
            ?.classList.add(
                "correct"
            );


        showAnswerResult(
            overlay,
            true
        );


    } else {

        buttons[selected]
            ?.classList.add(
                "wrong"
            );


        buttons[correct]
            ?.classList.add(
                "correct"
            );


        showAnswerResult(
            overlay,
            false
        );

    }

}


/* =========================================================
   35. ANSWER RESULT
========================================================= */

function showAnswerResult(
    overlay,
    correct
) {

    const result =
        document.createElement(
            "div"
        );


    result.className =
        correct
            ? "answer-result correct-result"
            : "answer-result wrong-result";


    result.textContent =
        correct
            ? "🎉 Chính xác! +1 điểm"
            : "❌ Sai rồi!";


    overlay
        .querySelector(
            ".question-modal"
        )
        ?.appendChild(
            result
        );


    setTimeout(
        () => {

            if (
                overlay &&
                overlay.parentNode
            ) {

                overlay.remove();

            }


            questionActive =
                false;


            /*
               Sau khi trả lời xong,
               tiếp tục chuỗi spawn theo beat.
            */

            if (gameRunning) {

                scheduleNextChicken();

            }

        },
        850
    );

}


/* =========================================================
   36. END GAME
========================================================= */

async function endGame() {

    if (!gameRunning) return;


    gameRunning = false;

    gameEnded = true;

    questionActive = false;


    clearInterval(
        gameTimer
    );

    clearTimeout(
        chickenTimer
    );


    gameTimer = null;

    chickenTimer = null;


    /*
       DỪNG NHẠC
    */

    stopBackgroundMusic();


    /*
       XÓA GÀ
    */

    removeAllChickens();


    /*
       XÓA CÂU HỎI
    */

    document
        .querySelectorAll(
            ".question-overlay"
        )
        .forEach(
            item =>
                item.remove()
        );


    finalScoreElement.textContent =
        score;


    showScreen(
        resultScreen
    );


    await saveScore(
        score
    );

}


/* =========================================================
   37. SAVE SCORE
========================================================= */

async function saveScore(
    finalScore
) {

    if (!supabaseClient) {

        scoreSaveMessage.textContent =
            "Chưa cấu hình Supabase.";

        return;

    }


    if (!currentUser) {

        scoreSaveMessage.textContent =
            "Không tìm thấy tài khoản.";

        return;

    }


    scoreSaveMessage.textContent =
        "Đang lưu điểm...";


    try {

        const {
            error
        } =
            await supabaseClient
                .from("game_scores")
                .insert({

                    user_id:
                        currentUser.id,

                    score:
                        finalScore

                });


        if (error) {

            console.error(
                "Save score error:",
                error
            );


            scoreSaveMessage.textContent =
                "Không lưu được điểm.";

            return;

        }


        if (currentProfile) {

            currentProfile.total_games =
                Number(
                    currentProfile.total_games || 0
                ) + 1;


            if (
                finalScore >
                Number(
                    currentProfile.best_score || 0
                )
            ) {

                currentProfile.best_score =
                    finalScore;

            }

        }


        scoreSaveMessage.textContent =
            "✅ Điểm đã được lưu!";


    } catch (error) {

        console.error(error);

        scoreSaveMessage.textContent =
            "Có lỗi khi lưu điểm.";

    }

}


/* =========================================================
   38. PLAY AGAIN
========================================================= */

playAgainButton.addEventListener(
    "click",
    function () {

        showScreen(
            gameScreen
        );


        startMessage.classList.remove(
            "hidden"
        );


        timerElement.textContent =
            GAME_DURATION;


        scoreElement.textContent =
            "0";

    }
);


/* =========================================================
   39. LEADERBOARD
========================================================= */

leaderboardButton.addEventListener(
    "click",
    async function () {

        await openLeaderboard();

    }
);


resultLeaderboardButton.addEventListener(
    "click",
    async function () {

        await openLeaderboard();

    }
);


async function openLeaderboard() {

    showScreen(
        leaderboardScreen
    );


    await loadLeaderboard();

}


/* =========================================================
   40. LOAD LEADERBOARD
========================================================= */

async function loadLeaderboard() {

    leaderboardBody.innerHTML = `
        <tr>
            <td colspan="4">
                Đang tải...
            </td>
        </tr>
    `;


    if (!supabaseClient) {

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Chưa cấu hình Supabase.
                </td>
            </tr>
        `;

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("profiles")
            .select(
                "username, best_score, total_games"
            )
            .eq(
                "is_active",
                true
            )
            .order(
                "best_score",
                {
                    ascending:
                        false
                }
            )
            .order(
                "total_games",
                {
                    ascending:
                        false
                }
            )
            .limit(50);


    if (error) {

        console.error(
            "Leaderboard error:",
            error
        );


        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Không tải được bảng xếp hạng.
                </td>
            </tr>
        `;

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        leaderboardBody.innerHTML = `
            <tr>
                <td colspan="4">
                    Chưa có người chơi.
                </td>
            </tr>
        `;

        return;

    }


    leaderboardBody.innerHTML =
        "";


    data.forEach(
        (
            player,
            index
        ) => {

            const row =
                document.createElement(
                    "tr"
                );


            const rank =
                document.createElement(
                    "td"
                );

            rank.textContent =
                index + 1;


            const username =
                document.createElement(
                    "td"
                );

            username.textContent =
                player.username;


            const bestScore =
                document.createElement(
                    "td"
                );

            bestScore.textContent =
                player.best_score || 0;


            const games =
                document.createElement(
                    "td"
                );

            games.textContent =
                player.total_games || 0;


            row.appendChild(
                rank
            );

            row.appendChild(
                username
            );

            row.appendChild(
                bestScore
            );

            row.appendChild(
                games
            );


            if (
                currentProfile &&
                player.username ===
                    currentProfile.username
            ) {

                row.classList.add(
                    "current-player"
                );

            }


            leaderboardBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   41. LEADERBOARD BACK
========================================================= */

leaderboardBackButton.addEventListener(
    "click",
    function () {

        showScreen(
            gameScreen
        );

    }
);


/* =========================================================
   42. ADMIN
========================================================= */

adminButton.addEventListener(
    "click",
    async function () {

        if (
            !currentProfile ||
            currentProfile.role !== "admin"
        ) {

            return;

        }


        showScreen(
            adminScreen
        );


        await loadAdminUsers();

    }
);


/* =========================================================
   43. LOAD ADMIN USERS
========================================================= */

async function loadAdminUsers() {

    adminBody.innerHTML = `
        <tr>
            <td colspan="6">
                Đang tải...
            </td>
        </tr>
    `;


    if (!supabaseClient) return;


    const {
        data,
        error
    } =
        await supabaseClient.rpc(
            "admin_list_profiles"
        );


    if (error) {

        console.error(
            "Admin list error:",
            error
        );


        adminBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Không có quyền hoặc RPC chưa được tạo.
                </td>
            </tr>
        `;

        return;

    }


    if (
        !data ||
        data.length === 0
    ) {

        adminBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Chưa có tài khoản.
                </td>
            </tr>
        `;

        return;

    }


    adminBody.innerHTML =
        "";


    data.forEach(
        user => {

            const row =
                document.createElement(
                    "tr"
                );


            /* USERNAME */

            const usernameCell =
                document.createElement(
                    "td"
                );

            usernameCell.textContent =
                user.username;


            /* ROLE */

            const roleCell =
                document.createElement(
                    "td"
                );


            const roleSelect =
                document.createElement(
                    "select"
                );


            roleSelect.className =
                "admin-select";


            [
                "player",
                "admin"
            ].forEach(
                role => {

                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        role;


                    option.textContent =
                        role === "admin"
                            ? "Admin"
                            : "Player";


                    if (
                        user.role ===
                        role
                    ) {

                        option.selected =
                            true;

                    }


                    roleSelect.appendChild(
                        option
                    );

                }
            );


            /* STATUS */

            const statusCell =
                document.createElement(
                    "td"
                );


            const statusSelect =
                document.createElement(
                    "select"
                );


            statusSelect.className =
                "admin-select";


            const activeOption =
                document.createElement(
                    "option"
                );


            activeOption.value =
                "true";

            activeOption.textContent =
                "Đang hoạt động";


            const lockedOption =
                document.createElement(
                    "option"
                );


            lockedOption.value =
                "false";

            lockedOption.textContent =
                "Đã khóa";


            statusSelect.appendChild(
                activeOption
            );

            statusSelect.appendChild(
                lockedOption
            );


            statusSelect.value =
                String(
                    user.is_active
                );


            /* BEST SCORE */

            const scoreCell =
                document.createElement(
                    "td"
                );

            scoreCell.textContent =
                user.best_score || 0;


            /* GAMES */

            const gamesCell =
                document.createElement(
                    "td"
                );

            gamesCell.textContent =
                user.total_games || 0;


            /* ACTION */

            const actionCell =
                document.createElement(
                    "td"
                );


            const saveButton =
                document.createElement(
                    "button"
                );


            saveButton.type =
                "button";


            saveButton.className =
                "admin-save-button";


            saveButton.textContent =
                "Lưu";


            saveButton.addEventListener(
                "click",
                async function () {

                    await updateAdminUser(
                        user.id,
                        roleSelect.value,
                        statusSelect.value === "true"
                    );

                }
            );


            actionCell.appendChild(
                saveButton
            );


            row.appendChild(
                usernameCell
            );

            row.appendChild(
                roleCell
            );

            row.appendChild(
                statusCell
            );

            row.appendChild(
                scoreCell
            );

            row.appendChild(
                gamesCell
            );

            row.appendChild(
                actionCell
            );


            /*
               KHÔNG CHO TỰ KHÓA
            */

            if (
                user.id ===
                currentUser.id
            ) {

                statusSelect.disabled =
                    true;

                roleSelect.disabled =
                    true;

                saveButton.disabled =
                    true;

            }


            roleCell.appendChild(
                roleSelect
            );

            statusCell.appendChild(
                statusSelect
            );


            adminBody.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   44. UPDATE ADMIN USER
========================================================= */

async function updateAdminUser(
    userId,
    role,
    isActive
) {

    adminMessage.textContent =
        "Đang cập nhật...";


    const {
        error
    } =
        await supabaseClient.rpc(
            "admin_update_profile",
            {

                target_user_id:
                    userId,

                new_role:
                    role,

                new_is_active:
                    isActive

            }
        );


    if (error) {

        console.error(
            error
        );


        adminMessage.textContent =
            "❌ Không thể cập nhật.";

        return;

    }


    adminMessage.textContent =
        "✅ Đã cập nhật tài khoản.";


    await loadAdminUsers();

}


/* =========================================================
   45. ADMIN BACK
========================================================= */

adminBackButton.addEventListener(
    "click",
    function () {

        showScreen(
            gameScreen
        );

    }
);


/* =========================================================
   46. LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async function () {

        stopGame();


        if (supabaseClient) {

            await supabaseClient.auth.signOut();

        }


        currentUser = null;

        currentProfile = null;


        loginForm.reset();

        registerForm.reset();


        showLogin();


        showScreen(
            authScreen
        );

    }
);


/* =========================================================
   47. STOP GAME
========================================================= */

function stopGame() {

    gameRunning = false;

    questionActive = false;


    clearInterval(
        gameTimer
    );

    clearTimeout(
        chickenTimer
    );


    gameTimer = null;

    chickenTimer = null;


    /*
       DỪNG NHẠC
    */

    stopBackgroundMusic();


    /*
       XÓA GÀ
    */

    removeAllChickens();


    /*
       XÓA CÂU HỎI
    */

    document
        .querySelectorAll(
            ".question-overlay"
        )
        .forEach(
            item =>
                item.remove()
        );

}


/* =========================================================
   48. SUPABASE AUTH STATE
========================================================= */

async function initAuth() {

    if (!supabaseClient) {

        showScreen(
            authScreen
        );


        showAuthMessage(
            "Hãy điền SUPABASE_URL và SUPABASE_PUBLISHABLE_KEY trong script.js.",
            "error"
        );


        return;

    }


    const {
        data
    } =
        await supabaseClient.auth.getSession();


    if (
        data &&
        data.session &&
        data.session.user
    ) {

        currentUser =
            data.session.user;


        await loadCurrentUser();

    } else {

        showScreen(
            authScreen
        );

    }


    supabaseClient.auth.onAuthStateChange(
        async (
            event,
            session
        ) => {

            if (
                event ===
                "SIGNED_OUT"
            ) {

                currentUser = null;

                currentProfile = null;

                stopGame();

                showScreen(
                    authScreen
                );

                return;

            }


            if (
                session &&
                session.user
            ) {

                currentUser =
                    session.user;

            }

        }
    );

}


/* =========================================================
   49. START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initAuth();

    }
);
