// ==========================================
// CHƯỞNG GÀ - GAME JAVASCRIPT
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

let score = 0;

// GAME CHỈ 15 GIÂY
let timeLeft = 15;

let gameRunning = false;

let timerInterval = null;
let chickenInterval = null;

let currentSpins = 0;

let wheelRotation = 0;

// Số câu hỏi đã trả lời
let questionsAnswered = 0;

// Đang hiện câu hỏi hay không
let questionActive = false;

// Danh sách câu hỏi
let questionPool = [];

// Vị trí câu hỏi hiện tại
let questionIndex = 0;

// Đảm bảo game chỉ kết thúc 1 lần
let gameEnded = false;


// ================================
// NGÂN HÀNG CÂU HỎI
// ================================

const questions = [
    {
        question: "CLB Taekwondo OTC chính thức được thành lập vào ngày, tháng, năm nào?",
        answers: ["19/03/2012", "19/03/2015", "19/03/2018", "19/03/2020"],
        correct: 1
    },
    {
        question: "Tên viết tắt tiếng Anh của Trường Đại học Mở TP.HCM là gì?",
        answers: ["OU", "OUM", "HCMCOU", "UHM"],
        correct: 2
    },
    {
        question: 'Tên viết tắt "OTC" của câu lạc bộ có ý nghĩa chính thức là gì?',
        answers: [
            "Open Taekwondo Club",
            "Only Taekwondo Connection",
            "One Team Connection",
            "Olympic Taekwondo Club"
        ],
        correct: 2
    },
    {
        question: "Trường Đại học Mở TP.HCM thuộc loại hình trường nào?",
        answers: ["Công lập", "Dân lập", "Tư thục", "Quốc tế"],
        correct: 0
    },
    {
        question: "Giải đấu thể thao truyền thống lớn nhất dành cho sinh viên toàn trường tên là gì?",
        answers: [
            "Hội thao OU",
            "Olympic OU",
            "OU Champions League",
            "Giải bóng đá sinh viên Mở"
        ],
        correct: 0
    },
    {
        question: "Đâu là 4 giá trị cốt lõi trong bộ nhận diện thương hiệu của CLB OTC?",
        answers: [
            "Honor – Strength – Mindset – Unity",
            "Honor – Courtesy – Mindset – One Unity",
            "Respect – Discipline – Mindset – Connection",
            "Courage – Courtesy – Wisdom – One Unity"
        ],
        correct: 1
    },
    {
        question: "Lịch tập định kỳ của CLB OTC diễn ra vào những ngày nào?",
        answers: [
            "Thứ 3, 5, 7",
            "Thứ 2, 4, 6",
            "Thứ Bảy, Chủ Nhật",
            "Mỗi ngày trong tuần"
        ],
        correct: 1
    },
    {
        question: "Đối tượng nào có thể đăng ký tham gia CLB Taekwondo OTC?",
        answers: [
            "Dành cho người đã từng học võ Taekwondo",
            "Dành riêng cho tân sinh viên của trường OU",
            "Dành cho nam sinh viên có thể lực tốt",
            "Tất cả các bạn yêu thích võ thuật và các bạn chưa từng học võ"
        ],
        correct: 3
    },
    {
        question: "Ưu đãi dành cho thành viên mới tham gia OTC là gì?",
        answers: [
            "Tặng võ phục miễn phí",
            "Miễn phí tháng đầu tiên",
            "Giảm 50% tiền thi đai",
            "Giảm 50% tiền võ phục"
        ],
        correct: 1
    },
    {
        question: "Đâu KHÔNG phải là giá trị cốt lõi của CLB OTC?",
        answers: [
            "Honor",
            "Courtesy",
            "Mindset",
            "Money"
        ],
        correct: 3
    },
    {
        question: "Địa chỉ sân tập chính thức của CLB OTC ở đâu?",
        answers: [
            "97 Võ Văn Tần, Q.3",
            "371 Nguyễn Kiệm, Gò Vấp",
            "35 Hồ Hảo Hớn, Q.1",
            "02 Nguyễn Bỉnh Khiêm, Q.1"
        ],
        correct: 0
    },
    {
        question: "Khung giờ tập luyện chính thức của CLB OTC là khi nào?",
        answers: [
            "15h00 - 17h00",
            "17h00 - 19h00",
            "18h00 - 20h00",
            "19h30 - 21h30"
        ],
        correct: 2
    },
    {
        question: "Ngoài võ thuật, câu lạc bộ OTC chú trọng phát triển điều gì nhất cho võ sinh?",
        answers: [
            "Khả năng ca hát và nghệ thuật",
            "Sức khỏe, tính kỷ luật và kỹ năng mềm",
            "Kỹ năng lập trình máy tính",
            "Cách kinh doanh và khởi nghiệp"
        ],
        correct: 1
    }
];


// ================================
// TẠO POPUP CÂU HỎI
// ================================

function createQuestionModal() {

    // Nếu đã có popup thì không tạo thêm
    if (document.getElementById("questionModal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "questionModal";

    modal.innerHTML = `
        <div class="question-box">

            <div class="question-header">
                <span>❓ CÂU HỎI</span>
                <span id="questionNumber"></span>
            </div>

            <div id="questionText" class="question-text">
            </div>

            <div id="answerList" class="answer-list">
            </div>

            <div id="questionMessage" class="question-message">
            </div>

        </div>
    `;

    document.body.appendChild(modal);

    addQuestionStyles();
}


// ================================
// CSS CHO POPUP
// ================================

function addQuestionStyles() {

    if (document.getElementById("questionStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "questionStyles";

    style.textContent = `

        #questionModal {
            position: fixed;
            inset: 0;
            z-index: 9999;

            display: flex;
            align-items: center;
            justify-content: center;

            background: rgba(0, 0, 0, 0.65);

            padding: 20px;
        }

        .question-box {
            width: min(550px, 95vw);

            background: white;

            border-radius: 24px;

            padding: 25px;

            box-shadow:
                0 20px 60px rgba(0,0,0,0.4);

            animation: questionAppear 0.25s ease;
        }

        @keyframes questionAppear {

            from {
                transform: scale(0.7);
                opacity: 0;
            }

            to {
                transform: scale(1);
                opacity: 1;
            }

        }

        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            font-size: 22px;
            font-weight: bold;

            margin-bottom: 20px;
        }

        .question-text {
            font-size: 25px;
            font-weight: bold;

            text-align: center;

            margin: 25px 0;
        }

        .answer-list {
            display: grid;
            gap: 12px;
        }

        .answer-button {
            border: none;

            padding: 15px;

            border-radius: 14px;

            background: #f1f1f1;

            font-size: 18px;

            cursor: pointer;

            transition: 0.15s;
        }

        .answer-button:hover {
            transform: translateY(-2px);
            background: #e0e0e0;
        }

        .answer-button:disabled {
            cursor: default;
        }

        .answer-button.correct {
            background: #54c878;
            color: white;
        }

        .answer-button.wrong {
            background: #ed5c5c;
            color: white;
        }

        .question-message {
            text-align: center;

            font-size: 22px;

            font-weight: bold;

            min-height: 30px;

            margin-top: 18px;
        }

    `;

    document.head.appendChild(style);
}


// ================================
// LẤY CÂU HỎI TIẾP THEO
// ================================

function getNextQuestion() {

    // Nếu đã dùng hết ngân hàng câu hỏi
    // thì xáo trộn lại
    if (questionIndex >= questionPool.length) {

        questionPool = [...questions].sort(
            () => Math.random() - 0.5
        );

        questionIndex = 0;
    }

    const question = questionPool[questionIndex];

    questionIndex++;

    return question;
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

    // Tạm dừng game trong lúc trả lời
    gameRunning = false;

    createQuestionModal();

    const modal =
        document.getElementById("questionModal");

    const questionText =
        document.getElementById("questionText");

    const answerList =
        document.getElementById("answerList");

    const questionNumber =
        document.getElementById("questionNumber");

    const questionMessage =
        document.getElementById("questionMessage");

    // Lấy câu hỏi tiếp theo
    const question = getNextQuestion();

    if (!question) {
        closeQuestion();
        return;
    }

    // Không còn giới hạn 3 câu
    questionNumber.textContent =
        `Câu ${questionsAnswered + 1}`;

    questionText.textContent =
        question.question;

    questionMessage.textContent = "";

    answerList.innerHTML = "";

    // Tạo 4 đáp án
    question.answers.forEach(
        function (answer, index) {

            const button =
                document.createElement("button");

            button.className =
                "answer-button";

            button.textContent =
                `${String.fromCharCode(65 + index)}. ${answer}`;

            button.addEventListener(
                "click",
                function () {

                    answerQuestion(
                        index,
                        question.correct
                    );

                }
            );

            answerList.appendChild(button);

        }
    );

    modal.style.display = "flex";
}


// ================================
// TRẢ LỜI CÂU HỎI
// ================================

function answerQuestion(
    selectedAnswer,
    correctAnswer
) {

    const buttons =
        document.querySelectorAll(
            ".answer-button"
        );

    const questionMessage =
        document.getElementById(
            "questionMessage"
        );

    // Không cho bấm nhiều lần
    buttons.forEach(
        button => {
            button.disabled = true;
        }
    );

    // Đúng
    if (selectedAnswer === correctAnswer) {

        buttons[selectedAnswer]
            .classList.add("correct");

        questionMessage.textContent =
            "✅ Chính xác! +1 điểm";

        score++;

    }

    // Sai
    else {

        buttons[selectedAnswer]
            .classList.add("wrong");

        buttons[correctAnswer]
            .classList.add("correct");

        questionMessage.textContent =
            "❌ Sai rồi! Không được điểm.";

    }

    questionsAnswered++;

    updateUI();

    // Hiện kết quả 1 giây
    // rồi quay lại game
    setTimeout(
        function () {

            closeQuestion();

        },
        1000
    );
}


// ================================
// ĐÓNG CÂU HỎI
// ================================

function closeQuestion() {

    const modal =
        document.getElementById(
            "questionModal"
        );

    if (modal) {
        modal.remove();
    }

    questionActive = false;

    // Tiếp tục chơi nếu vẫn còn thời gian
    if (
        timeLeft > 0 &&
        !gameEnded
    ) {

        gameRunning = true;

    }

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
// START GAME
// ================================

startButton.addEventListener(
    "click",
    startGame
);


function startGame() {

    // Reset game
    score = 0;

    // CHỈ 15 GIÂY
    timeLeft = 15;

    questionsAnswered = 0;

    questionActive = false;

    currentSpins = 0;

    gameEnded = false;

    // Xáo trộn câu hỏi
    questionPool = [...questions].sort(
        () => Math.random() - 0.5
    );

    questionIndex = 0;

    gameRunning = true;

    updateUI();

    startMessage.style.display = "none";

    startButton.disabled = true;


    // ================================
    // COUNTDOWN
    // ================================

    timerInterval = setInterval(

        function () {

            // Đang trả lời câu hỏi
            // thì tạm dừng đếm thời gian
            if (
                !gameRunning ||
                questionActive
            ) {
                return;
            }

            timeLeft--;

            updateUI();

            // Hết 15 giây
            if (timeLeft <= 0) {

                timeLeft = 0;

                updateUI();

                endGame();

            }

        },

        1000

    );


    // ================================
    // GÀ XUẤT HIỆN
    // ================================

    spawnChicken();

    chickenInterval = setInterval(

        function () {

            if (
                gameRunning &&
                !questionActive &&
                !gameEnded
            ) {

                spawnChicken();

            }

        },

        500

    );

}


// ================================
// UPDATE UI
// ================================

function updateUI() {

    // Điểm
    scoreElement.textContent =
        score;

    // Thời gian
    timerElement.textContent =
        timeLeft;

    // ================================
    // TÍNH LƯỢT QUAY
    // ================================
    //
    // 0-4 điểm   = 0 lượt
    // 5-9 điểm   = 1 lượt
    // 10-14      = 2 lượt
    // 15-19      = 3 lượt
    // 20-24      = 4 lượt
    // ...

    const availableSpins =
        Math.floor(score / 5);

    spinCountElement.textContent =
        availableSpins;

}


// ================================
// SPAWN CHICKEN
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
        document.createElement("div");

    chicken.classList.add(
        "chicken"
    );


    // ================================
    // HÌNH GÀ
    // ================================

    chicken.textContent =
        Math.random() > 0.15
            ? "🐔"
            : "🐥";


    // ================================
    // VỊ TRÍ NGẪU NHIÊN
    // ================================

    const areaWidth =
        gameArea.clientWidth;

    const areaHeight =
        gameArea.clientHeight;


    const x =
        Math.max(
            10,
            Math.random() *
            (areaWidth - 80)
        );


    const y =
        80 +
        Math.random() *
        Math.max(
            50,
            areaHeight - 180
        );


    chicken.style.left =
        x + "px";

    chicken.style.top =
        y + "px";


    gameArea.appendChild(
        chicken
    );


    // ================================
    // CHUYỂN ĐỘNG
    // ================================

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
            Math.random() - 0.5
        ) * 150;


    chicken.animate(

        [

            {
                transform:
                    "translate(0,0)"
            },

            {
                transform:
                    `translate(${moveX}px,${moveY}px)`
            }

        ],

        {

            duration:
                1000 +
                Math.random() * 700,

            easing:
                "linear",

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
                chicken,
                x,
                y
            );

        }

    );


    // ================================
    // GÀ TỰ BIẾN MẤT
    // ================================

    setTimeout(

        function () {

            if (
                chicken.parentNode
            ) {

                chicken.remove();

            }

        },

        1500

    );

}


// ================================
// CHƯỞNG GÀ
// ================================

function hitChicken(
    chicken,
    x,
    y
) {

    // Không cho chưởng khi:
    // - game đang dừng
    // - đang trả lời câu hỏi
    // - gà đã bị chưởng

    if (

        !gameRunning ||

        questionActive ||

        gameEnded ||

        chicken.classList.contains("hit")

    ) {

        return;

    }


    // ================================
    // ĐÁNH DẤU GÀ ĐÃ BỊ CHƯỞNG
    // ================================

    chicken.classList.add(
        "hit"
    );


    // ================================
    // HIỆN BÀN TAY
    // ================================

    createHand(
        x,
        y
    );


    // ================================
    // XÓA GÀ
    // ================================

    setTimeout(

        function () {

            if (
                chicken.parentNode
            ) {

                chicken.remove();

            }

        },

        300

    );


    // ================================
    // HIỆN CÂU HỎI
    // ================================

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

        250

    );

}


// ================================
// BÀN TAY CHƯỞNG GÀ
// ================================

function createHand(
    x,
    y
) {

    const hand =
        document.createElement("div");

    hand.classList.add(
        "hand"
    );

    hand.textContent =
        "✋";

    hand.style.left =
        x + "px";

    hand.style.top =
        y + "px";

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

        500

    );

}


// ================================
// END GAME
// ================================

function endGame() {

    // Không cho endGame chạy nhiều lần
    if (gameEnded) {
        return;
    }


    gameEnded = true;

    gameRunning = false;

    questionActive = false;


    // Dừng timer
    clearInterval(
        timerInterval
    );

    // Dừng gà
    clearInterval(
        chickenInterval
    );


    // ================================
    // XÓA TOÀN BỘ GÀ
    // ================================

    document
        .querySelectorAll(".chicken")
        .forEach(

            chicken =>
                chicken.remove()

        );


    // ================================
    // XÓA POPUP CÂU HỎI
    // ================================

    const questionModal =
        document.getElementById(
            "questionModal"
        );

    if (questionModal) {

        questionModal.remove();

    }


    // ================================
    // TÍNH LƯỢT QUAY
    // ================================
    //
    // 5 điểm  = 1 lượt
    // 10 điểm = 2 lượt
    // 15 điểm = 3 lượt
    // 20 điểm = 4 lượt
    // ...

    currentSpins =
        Math.floor(score / 5);


    // ================================
    // HIỆN KẾT QUẢ
    // ================================

    finalScoreElement.textContent =
        score;

    finalSpinCountElement.textContent =
        currentSpins;


    // ================================
    // CHUYỂN MÀN HÌNH
    // ================================

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
// QUAY VÒNG QUAY
// ================================

spinButton.addEventListener(

    "click",

    spinWheel

);


function spinWheel() {

    // Không còn lượt
    if (
        currentSpins <= 0
    ) {

        return;

    }


    // ================================
    // TRỪ 1 LƯỢT
    // ================================

    currentSpins--;

    remainingSpinElement.textContent =
        currentSpins;


    spinButton.disabled =
        true;


    prizeResult.classList.add(
        "hidden"
    );


    // ================================
    // XÁC SUẤT PHẦN THƯỞNG
    // ================================

    const random =
        Math.random() * 100;

    let prizeIndex;


    if (random < 25) {

        prizeIndex = 0;

    }

    else if (random < 50) {

        prizeIndex = 1;

    }

    else if (random < 70) {

        prizeIndex = 2;

    }

    else if (random < 85) {

        prizeIndex = 3;

    }

    else if (random < 95) {

        prizeIndex = 4;

    }

    else if (random < 98) {

        prizeIndex = 5;

    }

    else if (random < 99) {

        prizeIndex = 6;

    }

    else {

        // JACKPOT = 1%
        prizeIndex = 7;

    }


    // ================================
    // TÍNH GÓC QUAY
    // ================================

    const segmentAngle =
        360 / prizes.length;


    const targetAngle =
        360 -
        (
            prizeIndex *
            segmentAngle +
            segmentAngle / 2
        );


    // Quay 5 vòng
    wheelRotation +=
        360 * 5 +
        targetAngle;


    wheel.style.transform =
        `rotate(${wheelRotation}deg)`;


    // ================================
    // HIỆN PHẦN THƯỞNG
    // ================================

    setTimeout(

        function () {

            prizeText.textContent =
                prizes[prizeIndex];

            prizeResult.classList.remove(
                "hidden"
            );

            updateSpinButton();

        },

        4100

    );

}


// ================================
// UPDATE SPIN BUTTON
// ================================

function updateSpinButton() {

    spinButton.disabled =
        currentSpins <= 0;

}


// ================================
// RESTART
// ================================

restartButton.addEventListener(

    "click",

    restartGame

);


function restartGame() {

    // Dừng timer
    clearInterval(
        timerInterval
    );

    // Dừng gà
    clearInterval(
        chickenInterval
    );


    // Xóa popup câu hỏi
    const modal =
        document.getElementById(
            "questionModal"
        );

    if (modal) {

        modal.remove();

    }


    // ================================
    // RESET GAME
    // ================================

    score = 0;

    timeLeft = 15;

    currentSpins = 0;

    questionsAnswered = 0;

    questionActive = false;

    questionPool = [];

    questionIndex = 0;

    gameEnded = false;

    gameRunning = false;


    updateUI();


    // ================================
    // XÓA GÀ
    // ================================

    document
        .querySelectorAll(".chicken")
        .forEach(

            chicken =>
                chicken.remove()

        );


    // ================================
    // RESET MÀN HÌNH
    // ================================

    wheelScreen.classList.add(
        "hidden"
    );

    resultScreen.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );


    startMessage.style.display =
        "block";

    startButton.disabled =
        false;

    startButton.textContent =
        "BẮT ĐẦU";


    // ================================
    // RESET VÒNG QUAY
    // ================================

    wheelRotation = 0;

    wheel.style.transform =
        "rotate(0deg)";

    prizeResult.classList.add(
        "hidden"
    );

    remainingSpinElement.textContent =
        "0";

}
