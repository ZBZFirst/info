document.addEventListener('DOMContentLoaded', function() {
    const mathStatus = document.getElementById('math-status');
    const mathComplete = document.getElementById('math-complete');
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
        },
        recall: {
            questionEl: document.getElementById('recall-question'),
            optionsEl: document.getElementById('recall-options'),
            feedbackEl: document.getElementById('recall-feedback'),
            scoreEl: document.getElementById('recall-score'),
            progressEl: document.getElementById('recall-progress'),
            cardEl: document.getElementById('recall-card'),
            nextBtn: document.getElementById('next-recall'),
            submitBtn: document.getElementById('recall-submit')
        }
    };

    // Quiz State
    const quizState = {
        z: { score: 0, currentQuestion: null, completed: false },
        x: { score: 0, currentQuestion: null, completed: false },
        y: { score: 0, currentQuestion: null, completed: false },
        recall: { 
            score: 0, 
            currentQuestion: null,
            questions: [], 
            remainingQuestions: [],
            completed: false,
            currentAttempts: 0,
            maxAttempts: 3 
        },
        allComplete: false
    };

    // Debug Logger (now inside the scope where quizState exists)
    function logRecallState(action) {
        console.log(`${action} - Recall State:`, {
            score: quizState.recall.score,
            remaining: quizState.recall.remainingQuestions?.length || 0,
            completed: quizState.recall.completed
        });
    }

    // Add at top of file
    function saveProgress() {
        localStorage.setItem('quizProgress', JSON.stringify(quizState));
    }
    
    function loadProgress() {
        const saved = localStorage.getItem('quizProgress');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(quizState, parsed);
            
            // Update UI to reflect loaded state
            if (quizState.z.completed) questionCards.z.cardEl.classList.add('disabled-card');
            if (quizState.x.completed) questionCards.x.cardEl.classList.add('disabled-card');
            if (quizState.y.completed) questionCards.y.cardEl.classList.add('disabled-card');
            
            updateProgress('z');
            updateProgress('x');
            updateProgress('y');
            updateProgress('recall');
        }
    }
    
    // Initialize Quiz
    initMathQuiz();

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
    questionCards.recall.submitBtn.addEventListener('click', checkRecallAnswer);
    questionCards.recall.nextBtn.addEventListener('click', showNextRecallQuestion);
    
    // Functions
    function initMathQuiz() {
        generateNewQuestion('z');
        generateNewQuestion('x');
        generateNewQuestion('y');
        
        // Initialize recall questions and make them active immediately
        quizState.recall.questions = generateRecallQuestions();
        quizState.recall.remainingQuestions = [...quizState.recall.questions];
        
        // Update all progress displays
        updateProgress('z');
        updateProgress('x');
        updateProgress('y');
        updateProgress('recall');
        
        // Show first recall question
        showRandomRecallQuestion();
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
        // X is between 0.05 and 1 in steps of 0.05 (2 decimal places)
        const x = Math.round((Math.random() * 0.55 + 0.25) * 20) / 20;
        
        // Calculate maximum Y that keeps Z ≤ 20
        const maxY = Math.min(60, Math.floor(20 / x));
        
        // Y is integer between 1 and maxY
        const y = Math.floor(Math.random() * maxY) + 1;
        
        const z = x * y;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If Vt = ${x.toFixed(2)} and RR = ${y}, what is MV? (Vt × RR = MV)`,
            answer: z,
            type: 'z'
        };
    }
    
    function generateXQuestion() {
        // First choose X (0.05 to .60 in steps of 0.05)
        const x = Math.round((Math.random() * 0.55 + 0.25) * 20) / 20;
        
        // Y is integer between 1 and 20
        const y = Math.floor(Math.random() * 20) + 1;
        
        // Calculate Z
        const z = x * y;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If MV = ${z.toFixed(2)} and RR = ${y}, what is VT? (MV ÷ RR = Vt)`,
            answer: x,
            type: 'x'
        };
    }
    
    function generateYQuestion() {
        // First choose Y (integer between 1 and 30)
        const y = Math.floor(Math.random() * 30) + 1;
        
        // X is between 0.05 and 1 in steps of 0.25
        const x = Math.round((Math.random() * 0.55 + 0.25) * 20) / 20;
        
        // Calculate Z
        const z = x * y;
        
        return {
            x: x,
            y: y,
            z: z,
            text: `If MV = ${z.toFixed(2)} and VT = ${x.toFixed(2)}, what is RR? (MV ÷ Vt = RR)`,
            answer: y,
            type: 'y'
        };
    }

    // Section-specific answer checkers
    const answerCheckers = {
        z: {
            check: function(userAnswer, correctAnswer) {
                return Math.abs(userAnswer - correctAnswer) < 0.001;
            },
            onComplete: function() {
                quizState.z.completed = true;
                questionCards.z.cardEl.classList.add('disabled-card');
                questionCards.z.submitBtn.disabled = true;
                updateProgress('z');
                checkGlobalCompletion();
            }
        },
        x: {
            check: function(userAnswer, correctAnswer) {
                return Math.abs(userAnswer - correctAnswer) < 0.001;
            },
            onComplete: function() {
                quizState.x.completed = true;
                questionCards.x.cardEl.classList.add('disabled-card');
                questionCards.x.submitBtn.disabled = true;
                updateProgress('x');
                checkGlobalCompletion();               
            }
        },
        y: {
            check: function(userAnswer, correctAnswer) {
                return Math.abs(userAnswer - correctAnswer) < 0.001;
            },
            onComplete: function() {
                quizState.y.completed = true;
                questionCards.y.cardEl.classList.add('disabled-card');
                questionCards.y.submitBtn.disabled = true;
                updateProgress('y');
                checkGlobalCompletion();         
            }
        },
        recall: {
            // Recall has different handling (omitted for brevity)
        }
    };
    
    // Main checkAnswer function
    function checkAnswer(type) {
        const state = quizState[type];
        const card = questionCards[type];
        const userAnswer = parseFloat(card.answerEl.value);
        const correctAnswer = state.currentQuestion.answer;
    
        // Validate input
        if (isNaN(userAnswer)) {
            showFeedback(card, 'Please enter a valid number', 'incorrect');
            return;
        }
    
        // Get the appropriate checker
        const checker = answerCheckers[type];
        
        if (checker.check(userAnswer, correctAnswer)) {
            handleCorrectAnswer(type, card);
        } else {
            handleIncorrectAnswer(type, card, correctAnswer);
        }
    }
    
    function handleCorrectAnswer(type, card) {
        const state = quizState[type];
        state.score++;
        saveProgress();
        
        showFeedback(card, 'Correct!', 'correct');
        updateProgress(type);
    
        // Check for completion - modified condition
        if (state.score >= 5) {
            if (!state.completed) {
                answerCheckers[type].onComplete();
                checkGlobalCompletion();
                updateProgress(type);

            }
            return; // Always return after completion
        }
    
        // Only generate new question if not completed
        setTimeout(() => {
            generateNewQuestion(type);
        }, 1000);
    }
    
    function handleIncorrectAnswer(type, card, correctAnswer) {
        const state = quizState[type];
        if (state.score > 0) state.score--;
        
        showFeedback(card, `Incorrect. The correct answer is ${correctAnswer.toFixed(2)}. Try again.`, 'incorrect');
        updateProgress(type);
        
        setTimeout(() => {
            resetQuestionDisplay(card, state.currentQuestion.text);
        }, 1500);
    }
    
    // Helper functions
    function showFeedback(card, message, type) {
        card.feedbackEl.textContent = message;
        card.feedbackEl.className = `feedback ${type}`;
    }
    
    function resetQuestionDisplay(card, questionText) {
        card.questionEl.textContent = questionText;
        card.answerEl.value = '';
        card.answerEl.focus();
        card.feedbackEl.textContent = '';
    }
    
    function checkGlobalCompletion() {
        const sectionsComplete = (
            quizState.z.completed &&
            quizState.x.completed &&
            quizState.y.completed &&
            quizState.recall.completed
        );
        
        if (sectionsComplete) {
            quizState.allComplete = true;
            showFinalCompletion();
        }
    }
    
    function updateProgress(type) {
        const state = quizState[type];
        const card = questionCards[type];
        
        if (type === 'recall') {
            card.scoreEl.textContent = `${state.score}/${state.questions.length}`;
            card.progressEl.style.width = `${(state.score/state.questions.length)*100}%`;
        } else {
            card.scoreEl.textContent = `${state.score}/5`;
            card.progressEl.style.width = `${(state.score/5)*100}%`;
        }
    }

    function generateRecallQuestions() {
        return [
            {
                id: 1,
                question: "What was the unit of measurement for Respiratory Rate?",
                options: ["Breaks Per Minute", "Breaths Per Minute", "Beats Per Minute", "Burps Per Minute"],
                answer: 1
            },
            {
                id: 2,
                question: "What was the unit of measurement for Tidal Volume?",
                options: ["Ounces", "Liters", "Grams", "Cups"],
                answer: 1
            },
            {
                id: 3,
                question: "What was the unit of measurement for Minute Ventilation?",
                options: ["Breaths Per Minute", "Liters per Minute", "42", "Big Chungus"],
                answer: 1
            },
            {
                id: 4,
                question: "Why is the Minute Ventilation important?",
                options: ["It determines the amount of oxygen dissolved in the blood plasma.", "It indicates the strength of the diaphragm muscle alone.", "It reflects the total air movement in the lungs per minute, ensuring proper gas exchange.", "It is used to diagnose specific heart rhythm abnormalities."],
                answer: 2
            },
            {
                id: 5,
                question: "MV is the only way Minute Ventilation can be reported as a variable.",
                options: ["True", "False"],
                answer: 1
            }
        ];
    }

    function showRandomRecallQuestion() {
        if (quizState.recall.remainingQuestions.length === 0) {
            completeRecallSection();
            return;
        }
    
        const randomIndex = Math.floor(Math.random() * quizState.recall.remainingQuestions.length);
        quizState.recall.currentQuestion = quizState.recall.remainingQuestions[randomIndex];
        
        // Display new question
        questionCards.recall.questionEl.textContent = quizState.recall.currentQuestion.question;
        questionCards.recall.optionsEl.innerHTML = '';
        
        quizState.recall.currentQuestion.options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'recall-option';
            optionDiv.innerHTML = `
                <input type="radio" name="recall-answer" id="option-${i}" value="${i}">
                <label for="option-${i}">${option}</label>
            `;
            questionCards.recall.optionsEl.appendChild(optionDiv);
        });
        
        // Reset UI state for new question
        questionCards.recall.feedbackEl.textContent = '';
        questionCards.recall.feedbackEl.className = 'feedback';
        questionCards.recall.submitBtn.disabled = false;
        
        updateProgress('recall');
    }
    
    function checkRecallAnswer() {
        const selectedOption = document.querySelector('input[name="recall-answer"]:checked');
        if (!selectedOption) {
            showFeedback('Please select an answer', 'incorrect');
            return;
        }
    
        const isCorrect = parseInt(selectedOption.value) === quizState.recall.currentQuestion.answer;
        
        if (isCorrect) {
            // Handle correct answer
            quizState.recall.score++;
            
            // Remove answered question from pool
            quizState.recall.remainingQuestions = quizState.recall.remainingQuestions.filter(
                q => q.id !== quizState.recall.currentQuestion.id
            );
    
            showFeedback('Correct!', 'correct');
            
            // Clear selection and re-enable button after delay
            setTimeout(() => {
                const options = document.querySelectorAll('input[name="recall-answer"]');
                options.forEach(option => option.checked = false);
                questionCards.recall.submitBtn.disabled = false;
                
                if (quizState.recall.remainingQuestions.length === 0) {
                    completeRecallSection();
                } else {
                    showRandomRecallQuestion();
                }
            }, 1000);
            
        } else {
            // Handle incorrect answer
            showFeedback('Incorrect - Try again', 'incorrect');
            // Keep submit button enabled for retry
            questionCards.recall.submitBtn.disabled = false;
        }
    }

    
    function handleCorrectRecallAnswer() {
        quizState.recall.score++;
        quizState.recall.currentQuestion.answeredCorrectly = true;
        
        // Remove from remaining questions
        quizState.recall.remainingQuestions = quizState.recall.remainingQuestions.filter(
            q => q.id !== quizState.recall.currentQuestion.id
        );
    
        showFeedback('Correct!', 'correct');
        logRecallState("Correct answer");
    
        if (quizState.recall.remainingQuestions.length === 0) {
            completeRecallSection();
        } else {
            setTimeout(showNextRecallQuestion, 1000);
        }
        
        saveProgress();
    }
    
    function handleIncorrectRecallAnswer() {
        quizState.recall.currentAttempts++;
        
        if (quizState.recall.currentAttempts >= quizState.recall.maxAttempts) {
            showFeedback(`Maximum attempts reached. Correct answer was: ${quizState.recall.currentQuestion.options[quizState.recall.currentQuestion.answer]}`, 'incorrect');
            setTimeout(showNextRecallQuestion, 1500);
        } else {
            showFeedback('Incorrect - Try again', 'incorrect');
        }
        
        saveProgress();
    }
    
    function completeRecallSection() {
        quizState.recall.completed = true;
        questionCards.recall.cardEl.classList.add('disabled-card');
        showFeedback(`Completed with score: ${quizState.recall.score}/${quizState.recall.questions.length}`, 'correct');
        saveProgress();
        checkAllComplete();
    }

    // Update your showRecallCompletion function:
    function showRecallCompletion() {
        questionCards.recall.questionEl.textContent = 'Recall Quiz Completed!';
        questionCards.recall.optionsEl.innerHTML = '';
        questionCards.recall.feedbackEl.textContent = `Perfect! You got all ${quizState.recall.questions.length} questions correct!`;
        questionCards.recall.feedbackEl.className = 'feedback correct';
        questionCards.recall.submitBtn.classList.add('hidden');
        questionCards.recall.cardEl.classList.add('disabled-card'); // Add this line
        quizState.recall.completed = true;
        saveProgress();
        checkAllComplete();
    }

    function showFeedback(message, type) {
        questionCards.recall.feedbackEl.textContent = message;
        questionCards.recall.feedbackEl.className = `feedback ${type}`;
        questionCards.recall.submitBtn.disabled = (type === 'correct');
    }
        
    function checkAllComplete() {
        const mathComplete = quizState.z.completed && 
                           quizState.x.completed && 
                           quizState.y.completed;
        const recallComplete = quizState.recall.completed;
        
        if (mathComplete && recallComplete) {
            quizState.allComplete = true;
            showFinalCompletion();
        }
    }

    // Add this new function to show final completion:
    function showFinalCompletion() {
        // Create completion overlay with certificate button
        const overlay = document.createElement('div');
        overlay.className = 'completion-overlay';
        overlay.innerHTML = `
            <div class="completion-container">
                <h2>Quiz Completed!</h2>
                <p>You've unlocked certificate generation</p>
                <div class="results">
                    <h3>Your Results:</h3>
                    <p>Math Equations: Perfect scores in all categories</p>
                    <p>Recall Questions: ${quizState.recall.score}/${quizState.recall.questions.length} correct</p>
                </div>
                <button id="generate-certificate">Generate Certificate</button>
                <button id="restart-quiz">Restart Quiz</button>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Add certificate generation
        document.getElementById('generate-certificate').addEventListener('click', () => {
            // Store completion in localStorage
            localStorage.setItem('quizCompleted', 'true');
            // Redirect to certificate page
            window.location.href = '/certificate.html'; 
        });
        
        document.getElementById('restart-quiz').addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    }

    function showNextRecallQuestion() {
        showRandomRecallQuestion();
    }
});







