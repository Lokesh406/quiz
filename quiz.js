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
    

    // Fullscreen Modal Elements
    const fullscreenModal = new bootstrap.Modal(document.getElementById('fullscreenModal'), { backdrop: 'static', keyboard: false });
    const enableFullscreenBtn = document.getElementById('enableFullscreenBtn');
    const skipFullscreenBtn = document.getElementById('skipFullscreenBtn');

    let currentQuestionIndex = 0;
    let userAnswers = []; // To store user's selected answers
    let timerInterval;
    const examDuration = 60 * 5; // 5 minutes in seconds (adjust as needed)
    let timeLeft = examDuration;

    // Simulate questions data (replace with actual questions)
    const questions = [
        {
            type: 'single-select',
            question: 'What is the capital of France?',
            options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
            correctAnswer: 'Paris'
        },
        {
            type: 'multi-select',
            question: 'Which of these are programming languages?',
            options: ['HTML', 'CSS', 'JavaScript', 'Python', 'French'],
            correctAnswer: ['JavaScript', 'Python']
        },
        {
            type: 'fill-in-the-blank',
            question: 'The largest ocean on Earth is the _________ Ocean.',
            correctAnswer: 'Pacific'
        },
        {
            type: 'single-select',
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4'
        },
        {
            type: 'single-select',
            question: 'Which planet is known as the Red Planet?',
            options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
            correctAnswer: 'Mars'
        },
        {
            type: 'multi-select',
            question: 'Select the primary colors:',
            options: ['Red', 'Green', 'Blue', 'Yellow', 'Orange'],
            correctAnswer: ['Red', 'Blue', 'Yellow']
        },
        {
            type: 'fill-in-the-blank',
            question: 'The chemical symbol for water is _____.',
            correctAnswer: 'H2O'
        },
        {
            type: 'single-select',
            question: 'Who painted the Mona Lisa?',
            options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'],
            correctAnswer: 'Leonardo da Vinci'
        },
        {
            type: 'single-select',
            question: 'What is the largest mammal?',
            options: ['Elephant', 'Blue Whale', 'Giraffe', 'Polar Bear'],
            correctAnswer: 'Blue Whale'
        },
        {
            type: 'fill-in-the-blank',
            question: 'The process by which plants make their own food is called __________.',
            correctAnswer: 'Photosynthesis'
        }
    ];

    // Check if user is logged in
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
        alert('Please log in to access the quiz.');
        window.location.href = 'index.html'; // Redirect to login
        return;
    }
    userDisplayName.textContent = `Welcome, ${loggedInUser.fullName || loggedInUser.email}`;

    // Initialize userAnswers array with nulls for each question
    userAnswers = new Array(questions.length).fill(null);

    // --- Fullscreen Logic ---
    function requestFullscreen() {
        const element = document.documentElement; // Entire HTML document
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE/Edge */
            element.msRequestFullscreen();
        }
    }

    function exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
            document.msExitFullscreen();
        }
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

    // Show fullscreen modal on page load
    fullscreenModal.show();


    // --- Timer Logic ---
    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                alert('Time is up! Submitting your answers.');
                submitQuiz();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
    }

    // --- Quiz Display Logic ---
    function loadQuestion() {
        const question = questions[currentQuestionIndex];
        currentQuestionNumberElement.textContent = currentQuestionIndex + 1;
        totalQuestionsElement.textContent = questions.length;
        questionTextElement.textContent = question.question;
        optionsContainer.innerHTML = ''; // Clear previous options

        // Disable/enable Prev/Next/Submit buttons
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.disabled = currentQuestionIndex === questions.length - 1;
        if (currentQuestionIndex === questions.length - 1) {
            submitBtn.classList.remove('d-none');
        } else {
            submitBtn.classList.add('d-none');
        }

        // Render options based on question type
        if (question.type === 'single-select') {
            question.options.forEach((option, index) => {
                const optionId = `q${currentQuestionIndex}-option${index}`;
                const isChecked = userAnswers[currentQuestionIndex] === option;
                optionsContainer.innerHTML += `
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="question${currentQuestionIndex}" id="${optionId}" value="${option}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label option-label" for="${optionId}">${String.fromCharCode(65 + index)}. ${option}</label>
                    </div>
                `;
            });
        } else if (question.type === 'multi-select') {
            question.options.forEach((option, index) => {
                const optionId = `q${currentQuestionIndex}-option${index}`;
                // userAnswers for multi-select will be an array
                const isChecked = userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex].includes(option);
                optionsContainer.innerHTML += `
                    <div class="form-check mb-2">
                        <input class="form-check-input" type="checkbox" name="question${currentQuestionIndex}" id="${optionId}" value="${option}" ${isChecked ? 'checked' : ''}>
                        <label class="form-check-label option-label" for="${optionId}">${String.fromCharCode(65 + index)}. ${option}</label>
                    </div>
                `;
            });
        } else if (question.type === 'fill-in-the-blank') {
             optionsContainer.innerHTML = `
                <div class="mb-3">
                    <label for="fillInTheBlankInput" class="form-label visually-hidden">Your Answer</label>
                    <input type="text" class="form-control form-control-lg" id="fillInTheBlankInput" placeholder="Type your answer here..." value="${userAnswers[currentQuestionIndex] || ''}">
                </div>
            `;
        }
    }

    function saveAnswer() {
        const question = questions[currentQuestionIndex];
        if (question.type === 'single-select') {
            const selectedOption = document.querySelector(`input[name="question${currentQuestionIndex}"]:checked`);
            userAnswers[currentQuestionIndex] = selectedOption ? selectedOption.value : null;
        } else if (question.type === 'multi-select') {
            const selectedOptions = Array.from(document.querySelectorAll(`input[name="question${currentQuestionIndex}"]:checked`)).map(input => input.value);
            userAnswers[currentQuestionIndex] = selectedOptions.length > 0 ? selectedOptions : null;
        } else if (question.type === 'fill-in-the-blank') {
            const fillInInput = document.getElementById('fillInTheBlankInput');
            userAnswers[currentQuestionIndex] = fillInInput ? fillInInput.value.trim() : null;
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
        let score = 0;
        let correctAnswersCount = 0;
        let incorrectAnswersCount = 0;
        let unattemptedCount = 0;
        const detailedResults = [];

        questions.forEach((question, index) => {
            const userAnswer = userAnswers[index];
            let isCorrect = false;

            if (userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
                unattemptedCount++;
            } else {
                if (question.type === 'single-select' || question.type === 'fill-in-the-blank') {
                    if (typeof question.correctAnswer === 'string') { // Ensure correct answer is always treated as string for comparison
                        isCorrect = (userAnswer.toLowerCase() === question.correctAnswer.toLowerCase());
                    } else {
                         // Fallback for unexpected correct answer format
                        isCorrect = false;
                    }
                } else if (question.type === 'multi-select') {
                    // Sort arrays for consistent comparison
                    const sortedUserAnswer = Array.isArray(userAnswer) ? [...userAnswer].sort() : [];
                    const sortedCorrectAnswer = [...question.correctAnswer].sort();
                    isCorrect = JSON.stringify(sortedUserAnswer) === JSON.stringify(sortedCorrectAnswer);
                }

                if (isCorrect) {
                    score++;
                    correctAnswersCount++;
                } else {
                    incorrectAnswersCount++;
                }
            }

            detailedResults.push({
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                type: question.type
            });
        });

        return { score, correctAnswersCount, incorrectAnswersCount, unattemptedCount, totalQuestions: questions.length, detailedResults };
    }


    function submitQuiz() {
        stopTimer();
        const confirmSubmit = confirm('Are you sure you want to submit your quiz?');
        if (confirmSubmit) {
            saveAnswer(); // Save the answer for the last question
            const results = calculateScore();
            localStorage.setItem('quizResults', JSON.stringify(results));
            window.location.href = 'results.html'; // Redirect to results page
        } else {
            startTimer(); // Resume timer if not submitted
        }
    }

    // Event Listeners
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    submitBtn.addEventListener('click', submitQuiz);
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('loggedInUser'); // Clear logged in user
        window.location.href = 'index.html'; // Redirect to home/login page
    });
   const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('loggedInUser');
        console.log('Logout clicked: redirecting...');
        alert("You have been logged out.");
        window.location.href = 'login.html'; // or 'index.html' if that's your login page
    });
} else {
    console.warn("Logout button not found. Check if the element with id='logoutBtn' exists in your HTML.");
}


    // Start quiz only after fullscreen modal is handled
    function startQuiz() {
        loadQuestion();
        startTimer();
    }
    
});