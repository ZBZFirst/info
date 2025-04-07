document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const mathQuiz = document.getElementById('math-quiz');
    const recallQuiz = document.getElementById('recall-quiz');
    const questionEl = document.getElementById('question');
    const answerEl = document.getElementById('answer');
    const submitBtn = document.getElementById('submit');
    const feedbackEl = document.getElementById('feedback');
    const scoreEl = document.getElementById('score');
    const formatEl = document.getElementById('current-format');
    const recallQuestionEl = document.getElementById('recall-question');
    const recallOptionsEl = document.getElementById('recall-options');
    const recallFeedbackEl = document.getElementById('recall-feedback');
    const nextRecallBtn = document.getElementById('next-recall');

    // Quiz state
    let score = 0;
    let currentFormat = 0; // 0: solve for Z, 1: solve for X, 2: solve for Y
    const formats = [
        { name: "Solve for Z", generate: generateZQuestion },
        { name: "Solve for X", generate: generateXQuestion },
        { name: "Solve for Y", generate: generateYQuestion }
    ];
    let currentQuestion = null;
    let recallQuestions = [];
    let currentRecallIndex = 0;
    let recallScore = 0;

    // Initialize the quiz
    initMathQuiz();

    // Event listeners
    submitBtn.addEventListener('click', checkMathAnswer);
    answerEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkMathAnswer();
    });
    nextRecallBtn.addEventListener('click', showNextRecallQuestion);

    // Functions
    function initMathQuiz() {
        score = 0;
        updateScore();
        generateNewQuestion();
    }

    function generateNewQuestion() {
        currentQuestion = formats[currentFormat].generate();
        questionEl.textContent = currentQuestion.text;
        answerEl.value = '';
        answerEl.focus();
        feedbackEl.textContent = '';
        feedbackEl.className = 'feedback';
    }

    function generateZQuestion() {
        // X is between 0.005 and 1 in steps of 0.005 (3 decimal places)
        const x = Math.round((Math.random() * 0.995 + 0.005) * 200) / 200;
        // Y is integer between 1 and 60
        const y = Math.floor(Math.random() * 60) + 1;
        const z = x * y;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If X = ${x} and Y = ${y}, what is Z? (X × Y = Z)`,
            answer: z,
            type: 'z'
        };
    }

    function generateXQuestion() {
        // Z is between 0.1 and 60
        const z = Math.round((Math.random() * 59.9 + 0.1) * 100) / 100;
        // Y is integer between 1 and 60
        const y = Math.floor(Math.random() * 60) + 1;
        const x = z / y;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If Z = ${z} and Y = ${y}, what is X? (Z ÷ Y = X)`,
            answer: x,
            type: 'x'
        };
    }

    function generateYQuestion() {
        // Z is between 0.1 and 60
        const z = Math.round((Math.random() * 59.9 + 0.1) * 100) / 100;
        // X is between 0.005 and 1 in steps of 0.005
        const x = Math.round((Math.random() * 0.995 + 0.005) * 200) / 200;
        const y = z / x;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If Z = ${z} and X = ${x}, what is Y? (Z ÷ X = Y)`,
            answer: y,
            type: 'y'
        };
    }

    function checkMathAnswer() {
        const userAnswer = parseFloat(answerEl.value);
        const correctAnswer = currentQuestion.answer;
        const tolerance = 0.001; // Allow for floating point rounding

        if (isNaN(userAnswer)) {
            feedbackEl.textContent = 'Please enter a valid number';
            feedbackEl.className = 'feedback incorrect';
            return;
        }

        if (Math.abs(userAnswer - correctAnswer) < tolerance) {
            // Correct answer
            score++;
            updateScore();
            feedbackEl.textContent = 'Correct!';
            feedbackEl.className = 'feedback correct';

            if (score >= 10) {
                // Move to next format or to recall questions
                currentFormat++;
                if (currentFormat < formats.length) {
                    score = 0;
                    updateScore();
                    formatEl.textContent = formats[currentFormat].name;
                    setTimeout(generateNewQuestion, 1500);
                } else {
                    // All formats completed, show recall questions
                    mathQuiz.classList.add('hidden');
                    recallQuiz.classList.remove('hidden');
                    initRecallQuiz();
                }
            } else {
                setTimeout(generateNewQuestion, 1500);
            }
        } else {
            // Wrong answer
            if (score > 0) score--;
            updateScore();
            feedbackEl.textContent = `Incorrect. The correct answer is ${correctAnswer.toFixed(3)}. Try again.`;
            feedbackEl.className = 'feedback incorrect';
            setTimeout(() => {
                questionEl.textContent = currentQuestion.text; // Show same question again
                answerEl.value = '';
                answerEl.focus();
                feedbackEl.textContent = '';
            }, 1500);
        }
    }

    function updateScore() {
        scoreEl.textContent = score;
    }

    function initRecallQuiz() {
        recallQuestions = generateRecallQuestions();
        currentRecallIndex = 0;
        recallScore = 0;
        showRecallQuestion(0);
    }

    function generateRecallQuestions() {
        // Placeholder recall questions - replace with your actual questions
        return [
            {
                question: "What is the capital of France?",
                options: ["London", "Paris", "Berlin", "Madrid"],
                answer: 1
            },
            {
                question: "Which planet is known as the Red Planet?",
                options: ["Venus", "Mars", "Jupiter", "Saturn"],
                answer: 1
            },
            {
                question: "What is 2 + 2?",
                options: ["3", "4", "5", "6"],
                answer: 1
            },
            {
                question: "Who painted the Mona Lisa?",
                options: ["Van Gogh", "Picasso", "Da Vinci", "Michelangelo"],
                answer: 2
            },
            {
                question: "What is the largest ocean on Earth?",
                options: ["Atlantic", "Indian", "Arctic", "Pacific"],
                answer: 3
            }
        ];
    }

    function showRecallQuestion(index) {
        const question = recallQuestions[index];
        recallQuestionEl.textContent = question.question;
        recallOptionsEl.innerHTML = '';
        
        question.options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'recall-option';
            optionDiv.innerHTML = `
                <input type="radio" name="recall-answer" id="option-${i}" value="${i}">
                <label for="option-${i}">${option}</label>
            `;
            recallOptionsEl.appendChild(optionDiv);
        });
        
        recallFeedbackEl.textContent = '';
        recallFeedbackEl.className = 'feedback';
        nextRecallBtn.classList.add('hidden');
    }

    function showNextRecallQuestion() {
        currentRecallIndex++;
        if (currentRecallIndex < recallQuestions.length) {
            showRecallQuestion(currentRecallIndex);
        } else {
            // Quiz completed
            recallQuestionEl.textContent = `Recall quiz completed! You got ${recallScore} out of ${recallQuestions.length} correct.`;
            recallOptionsEl.innerHTML = '';
            recallFeedbackEl.textContent = '';
            nextRecallBtn.classList.add('hidden');
        }
    }

    // Handle recall question selection
    recallOptionsEl.addEventListener('change', function(e) {
        if (e.target.name === 'recall-answer') {
            const selectedOption = parseInt(e.target.value);
            const correctAnswer = recallQuestions[currentRecallIndex].answer;
            
            if (selectedOption === correctAnswer) {
                recallFeedbackEl.textContent = 'Correct!';
                recallFeedbackEl.className = 'feedback correct';
                recallScore++;
            } else {
                recallFeedbackEl.textContent = `Incorrect. The correct answer is: ${recallQuestions[currentRecallIndex].options[correctAnswer]}`;
                recallFeedbackEl.className = 'feedback incorrect';
            }
            
            nextRecallBtn.classList.remove('hidden');
        }
    });
});
