document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const mathQuiz = document.getElementById('math-quiz');
    const recallQuiz = document.getElementById('recall-quiz');
    const mathComplete = document.getElementById('math-complete');
    const recallComplete = document.getElementById('recall-complete');
    const mathStatus = document.getElementById('math-status');
    
    // Math question elements
    const questionCards = {
        z: {
            questionEl: document.getElementById('z-question'),
            answerEl: document.getElementById('z-answer'),
            submitBtn: document.getElementById('z-submit'),
            feedbackEl: document.getElementById('z-feedback'),
            scoreEl: document.getElementById('z-score'),
            progressEl: document.getElementById('z-progress'),
            cardEl: document.getElementById('z-card')
        },
        x: {
            questionEl: document.getElementById('x-question'),
            answerEl: document.getElementById('x-answer'),
            submitBtn: document.getElementById('x-submit'),
            feedbackEl: document.getElementById('x-feedback'),
            scoreEl: document.getElementById('x-score'),
            progressEl: document.getElementById('x-progress'),
            cardEl: document.getElementById('x-card')
        },
        y: {
            questionEl: document.getElementById('y-question'),
            answerEl: document.getElementById('y-answer'),
            submitBtn: document.getElementById('y-submit'),
            feedbackEl: document.getElementById('y-feedback'),
            scoreEl: document.getElementById('y-score'),
            progressEl: document.getElementById('y-progress'),
            cardEl: document.getElementById('y-card')
        }
    };
    
    // Recall question elements
    const recallQuestionEl = document.getElementById('recall-question');
    const recallOptionsEl = document.getElementById('recall-options');
    const recallFeedbackEl = document.getElementById('recall-feedback');
    const nextRecallBtn = document.getElementById('next-recall');
    const recallStatus = document.getElementById('recall-status');
    const finalScoreEl = document.getElementById('final-score');

    // Quiz state
    const quizState = {
        z: { score: 0, currentQuestion: null, completed: false },
        x: { score: 0, currentQuestion: null, completed: false },
        y: { score: 0, currentQuestion: null, completed: false }
    };
    
    let recallQuestions = [];
    let currentRecallIndex = 0;
    let recallScore = 0;

    // Initialize the quiz
    initMathQuiz();
    initRecallQuiz();

    // Event listeners
    questionCards.z.submitBtn.addEventListener('click', () => checkAnswer('z'));
    questionCards.x.submitBtn.addEventListener('click', () => checkAnswer('x'));
    questionCards.y.submitBtn.addEventListener('click', () => checkAnswer('y'));
    
    questionCards.z.answerEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer('z');
    });
    questionCards.x.answerEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer('x');
    });
    questionCards.y.answerEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer('y');
    });
    
    nextRecallBtn.addEventListener('click', showNextRecallQuestion);

    // Functions
    function initMathQuiz() {
        // Generate initial questions for all types
        generateNewQuestion('z');
        generateNewQuestion('x');
        generateNewQuestion('y');
        
        // Update all progress displays
        updateProgress('z');
        updateProgress('x');
        updateProgress('y');
    }
    
    function initRecallQuiz() {
        recallQuestions = generateRecallQuestions();
    }

    function generateNewQuestion(type) {
        let question;
        switch(type) {
            case 'z':
                question = generateZQuestion();
                break;
            case 'x':
                question = generateXQuestion();
                break;
            case 'y':
                question = generateYQuestion();
                break;
        }
        
        quizState[type].currentQuestion = question;
        questionCards[type].questionEl.textContent = question.text;
        questionCards[type].answerEl.value = '';
        questionCards[type].feedbackEl.textContent = '';
        questionCards[type].feedbackEl.className = 'feedback';
        questionCards[type].answerEl.focus();
    }

    function generateZQuestion() {
        // First choose X (0.005-1.000 in 0.005 steps)
        const x = Math.round((Math.random() * 0.995 + 0.005) * 200) / 200;
        
        // Calculate maximum Y that keeps Z ≤ 20
        const maxY = Math.min(60, Math.floor(20 / x));
        
        // Y is integer between 1 and maxY
        const y = Math.floor(Math.random() * maxY) + 1;
        
        const z = x * y;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If X = ${x.toFixed(3)} and Y = ${y}, what is Z? (X × Y = Z)`,
            answer: z,
            type: 'z'
        };
    }
    
    function generateXQuestion() {
        // First choose Z (0.1-20)
        const z = Math.round((Math.random() * 19.9 + 0.1) * 100) / 100;
        
        // Calculate maximum Y that keeps X ≤ 1
        const minY = Math.ceil(z / 1);
        const y = Math.floor(Math.random() * (60 - minY + 1)) + minY;
        
        const x = z / y;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If Z = ${z.toFixed(3)} and Y = ${y}, what is X? (Z ÷ Y = X)`,
            answer: x,
            type: 'x'
        };
    }
    
    function generateYQuestion() {
        // First choose Z (0.1-20)
        const z = Math.round((Math.random() * 19.9 + 0.1) * 100) / 100;
        
        // Calculate minimum X that keeps Y ≤ 60
        const minX = z / 60;
        const x = Math.round((Math.random() * (1 - minX) + minX) * 200) / 200;
        
        const y = z / x;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If Z = ${z.toFixed(3)} and X = ${x.toFixed(3)}, what is Y? (Z ÷ X = Y)`,
            answer: y,
            type: 'y'
        };
    }

    function checkAnswer(type) {
        const state = quizState[type];
        const card = questionCards[type];
        const userAnswer = parseFloat(card.answerEl.value);
        const correctAnswer = state.currentQuestion.answer;
        const tolerance = 0.001; // Allow for floating point rounding

        if (isNaN(userAnswer)) {
            card.feedbackEl.textContent = 'Please enter a valid number';
            card.feedbackEl.className = 'feedback incorrect';
            return;
        }

        if (Math.abs(userAnswer - correctAnswer) < tolerance) {
            // Correct answer
            state.score++;
            card.feedbackEl.textContent = 'Correct!';
            card.feedbackEl.className = 'feedback correct';
            
            if (state.score >= 10) {
                state.completed = true;
                card.cardEl.style.opacity = '0.7';
                card.cardEl.style.pointerEvents = 'none';
                card.submitBtn.disabled = true;
                card.answerEl.disabled = true;
                
                // Check if all formats are completed
                if (quizState.z.completed && quizState.x.completed && quizState.y.completed) {
                    mathComplete.classList.remove('hidden');
                    mathStatus.textContent = 'Completed';
                    mathStatus.classList.add('completed');
                    setTimeout(() => {
                        mathQuiz.classList.add('hidden');
                        recallQuiz.classList.remove('hidden');
                        showRecallQuestion(0);
                    }, 2000);
                }
            }
            
            setTimeout(() => {
                generateNewQuestion(type);
                updateProgress(type);
            }, 1000);
        } else {
            // Wrong answer
            if (state.score > 0) state.score--;
            card.feedbackEl.textContent = `Incorrect. The correct answer is ${correctAnswer.toFixed(3)}. Try again.`;
            card.feedbackEl.className = 'feedback incorrect';
            updateProgress(type);
            
            setTimeout(() => {
                card.questionEl.textContent = state.currentQuestion.text;
                card.answerEl.value = '';
                card.answerEl.focus();
                card.feedbackEl.textContent = '';
            }, 1500);
        }
    }
    
    function updateProgress(type) {
        const state = quizState[type];
        const card = questionCards[type];
        
        card.scoreEl.textContent = `${state.score}/10`;
        card.progressEl.style.width = `${(state.score/10)*100}%`;
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
            
            // Add click handler to the entire option div
            optionDiv.addEventListener('click', function() {
                document.getElementById(`option-${i}`).checked = true;
                checkRecallAnswer();
            });
        });
        
        recallFeedbackEl.textContent = '';
        recallFeedbackEl.className = 'feedback';
        nextRecallBtn.classList.add('hidden');
        recallStatus.textContent = `${index + 1}/${recallQuestions.length}`;
    }
    
    function checkRecallAnswer() {
        const selectedOption = document.querySelector('input[name="recall-answer"]:checked');
        if (selectedOption) {
            const correctAnswer = recallQuestions[currentRecallIndex].answer;
            const isCorrect = parseInt(selectedOption.value) === correctAnswer;
            
            if (isCorrect) {
                recallFeedbackEl.textContent = 'Correct!';
                recallFeedbackEl.className = 'feedback correct';
                recallScore++;
            } else {
                recallFeedbackEl.textContent = `Incorrect. The correct answer is: ${recallQuestions[currentRecallIndex].options[correctAnswer]}`;
                recallFeedbackEl.className = 'feedback incorrect';
            }
            
            nextRecallBtn.classList.remove('hidden');
        }
    }

    function showNextRecallQuestion() {
        currentRecallIndex++;
        if (currentRecallIndex < recallQuestions.length) {
            showRecallQuestion(currentRecallIndex);
        } else {
            // Quiz completed
            recallQuestionEl.textContent = 'Quiz Completed!';
            recallOptionsEl.innerHTML = '';
            recallFeedbackEl.textContent = '';
            nextRecallBtn.classList.add('hidden');
            recallComplete.classList.remove('hidden');
            finalScoreEl.textContent = recallScore;
            recallStatus.textContent = 'Completed';
            recallStatus.classList.add('completed');
        }
    }
});
