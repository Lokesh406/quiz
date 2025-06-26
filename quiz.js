document.addEventListener('DOMContentLoaded', () => {
    const questionTextElement = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const currentQuestionNumberElement = document.getElementById('currentQuestionNumber');
    const totalQuestionsElement = document.getElementById('totalQuestions');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const timerElement = document.getElementById('timer');
    const userDisplayName = document.getElementById('userDisplayName');
    const logoutBtn = document.getElementById('logoutBtn');

    const fullscreenModal = new bootstrap.Modal(document.getElementById('fullscreenModal'), {
        backdrop: 'static',
        keyboard: false
    });
    const enableFullscreenBtn = document.getElementById('enableFullscreenBtn');
    const skipFullscreenBtn = document.getElementById('skipFullscreenBtn');

    let currentQuestionIndex = 0;
    let userAnswers = [];
    const examDuration = 5 * 60;
    let timeLeft = examDuration;
    let timerInterval;

    const questions = [
        { type: 'single-select', question: 'What is the capital of France?', options: ['Berlin', 'Madrid', 'Paris', 'Rome'], correctAnswer: 'Paris' },
        { type: 'multi-select', question: 'Which of these are programming languages?', options: ['HTML', 'CSS', 'JavaScript', 'Python', 'French'], correctAnswer: ['JavaScript', 'Python'] },
        { type: 'fill-in-the-blank', question: 'The largest ocean on Earth is the _________ Ocean.', correctAnswer: 'Pacific' },
        { type: 'single-select', question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctAnswer: '4' },
        { type: 'single-select', question: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Venus'], correctAnswer: 'Mars' },
        { type: 'multi-select', question: 'Select the primary colors:', options: ['Red', 'Green', 'Blue', 'Yellow', 'Orange'], correctAnswer: ['Red', 'Blue', 'Yellow'] },
        { type: 'fill-in-the-blank', question: 'The chemical symbol for water is _____.', correctAnswer: 'H2O' },
        { type: 'single-select', question: 'Who painted the Mona Lisa?', options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'], correctAnswer: 'Leonardo da Vinci' },
        { type: 'single-select', question: 'What is the largest mammal?', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'], correctAnswer: 'Blue Whale' },
        { type: 'fill-in-the-blank', question: 'The process by which plants make their own food is called __________.', correctAnswer: 'Photosynthesis' }
    ];

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert("Please log in to access the quiz.");
        window.location.href = "login.html";
        return;
    }

    userDisplayName.textContent = `Welcome, ${loggedInUser.fullName || loggedInUser.email}`;
    userAnswers = new Array(questions.length).fill(null);
    updateTimerDisplay();

    function updateTimerDisplay() {
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        timerElement.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }

    function requestFullscreen() {
        const el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
    }

    enableFullscreenBtn.addEventListener('click', () => {
        requestFullscreen();
        fullscreenModal.hide();
        startQuiz();
    });

    skipFullscreenBtn.addEventListener('click', () => {
        fullscreenModal.hide();
        startQuiz();
    });

    fullscreenModal.show();

    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert("Time is up! Submitting your answers.");
                submitQuiz();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    function loadQuestion() {
        const q = questions[currentQuestionIndex];
        currentQuestionNumberElement.textContent = currentQuestionIndex + 1;
        totalQuestionsElement.textContent = questions.length;
        questionTextElement.textContent = q.question;
        optionsContainer.innerHTML = '';

        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === questions.length - 1;
        submitBtn.classList.toggle('d-none', currentQuestionIndex !== questions.length - 1);

        if (q.type === 'single-select') {
            q.options.forEach((opt, i) => {
                const id = `q${currentQuestionIndex}-opt${i}`;
                const checked = userAnswers[currentQuestionIndex] === opt;
                optionsContainer.innerHTML += `
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="q${currentQuestionIndex}" id="${id}" value="${opt}" ${checked ? 'checked' : ''}>
                        <label class="form-check-label option-label" for="${id}">${String.fromCharCode(65 + i)}. ${opt}</label>
                    </div>
                `;
            });
        } else if (q.type === 'multi-select') {
            q.options.forEach((opt, i) => {
                const id = `q${currentQuestionIndex}-opt${i}`;
                const checked = userAnswers[currentQuestionIndex]?.includes(opt);
                optionsContainer.innerHTML += `
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" name="q${currentQuestionIndex}" id="${id}" value="${opt}" ${checked ? 'checked' : ''}>
                        <label class="form-check-label option-label" for="${id}">${String.fromCharCode(65 + i)}. ${opt}</label>
                    </div>
                `;
            });
        } else if (q.type === 'fill-in-the-blank') {
            optionsContainer.innerHTML = `
                <input type="text" class="form-control" id="fillInTheBlankInput" placeholder="Type your answer..." value="${userAnswers[currentQuestionIndex] || ''}">
            `;
        }
    }

    function saveAnswer() {
        const q = questions[currentQuestionIndex];
        if (q.type === 'single-select') {
            const selected = document.querySelector(`input[name="q${currentQuestionIndex}"]:checked`);
            userAnswers[currentQuestionIndex] = selected ? selected.value : null;
        } else if (q.type === 'multi-select') {
            const selected = Array.from(document.querySelectorAll(`input[name="q${currentQuestionIndex}"]:checked`)).map(e => e.value);
            userAnswers[currentQuestionIndex] = selected.length ? selected : null;
        } else if (q.type === 'fill-in-the-blank') {
            const input = document.getElementById('fillInTheBlankInput');
            userAnswers[currentQuestionIndex] = input ? input.value.trim() : null;
        }
    }

    function nextQuestion() {
        saveAnswer();
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        }
    }

    function prevQuestion() {
        saveAnswer();
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    }

    function calculateScore() {
        let score = 0, correct = 0, incorrect = 0, unattempted = 0;
        const details = [];

        questions.forEach((q, i) => {
            const ua = userAnswers[i];
            let isCorrect = false;

            if (!ua || (Array.isArray(ua) && ua.length === 0)) {
                unattempted++;
            } else if (q.type === 'single-select' || q.type === 'fill-in-the-blank') {
                isCorrect = ua.toLowerCase() === q.correctAnswer.toLowerCase();
            } else if (q.type === 'multi-select') {
                isCorrect = JSON.stringify([...ua].sort()) === JSON.stringify([...q.correctAnswer].sort());
            }

            if (isCorrect) {
                score++;
                correct++;
            } else if (ua) {
                incorrect++;
            }

            details.push({ question: q.question, userAnswer: ua, correctAnswer: q.correctAnswer, isCorrect });
        });

        return { score, correct, incorrect, unattempted, totalQuestions: questions.length, detailedResults: details };
    }

    function submitQuiz() {
        stopTimer();
        if (confirm("Are you sure you want to submit your quiz?")) {
            saveAnswer();
            const results = calculateScore();
            localStorage.setItem("quizResults", JSON.stringify(results));
            window.location.href = "results.html";
        } else {
            startTimer();
        }
    }

    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    submitBtn.addEventListener('click', submitQuiz);

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            alert("You have been logged out.");
            window.location.href = 'login.html';
        });
    }

    function startQuiz() {
        loadQuestion();
        startTimer();
    }
});

