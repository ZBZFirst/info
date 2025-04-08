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

    const quizState = {
        z: { score: 0, currentQuestion: null, completed: false },
        x: { score: 0, currentQuestion: null, completed: false },
        y: { score: 0, currentQuestion: null, completed: false },
        recall: { 
            score: 0, 
            currentIndex: 0, 
            questions: [],
            remainingQuestions: []
        }
    };

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

    function checkAnswer(type) {
        const state = quizState[type];
        const card = questionCards[type];
        const userAnswer = parseFloat(card.answerEl.value);
        const correctAnswer = state.currentQuestion.answer;
        const tolerance = 0.001;
    
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
            
            if (state.score >= 5) {
                state.completed = true;
                card.cardEl.classList.add('disabled-card');
                card.submitBtn.disabled = true;  // JUST ADD THIS LINE
            }
            
            setTimeout(() => {
                generateNewQuestion(type);
                updateProgress(type);
            }, 1000);
        } else {
            // Wrong answer
            if (state.score > 0) state.score--;
            card.feedbackEl.textContent = `Incorrect. The correct answer is ${correctAnswer.toFixed(2)}. Try again.`;
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
                question: "What was the unit of measurement for Respiratory Rate?",
                options: ["Breaks Per Minute", "Breaths Per Minute", "Beats Per Minute", "Burps Per Minute"],
                answer: 1
            },
            {
                question: "What was the unit of measurement for Tidal Volume?",
                options: ["Ounces", "Liters", "Grams", "Cups"],
                answer: 1
            },
            {
                question: "What was the unit of measurement for Minute Ventilation?",
                options: ["Breaths Per Minute", "Liters per Minute", "42", "Big Chungus"],
                answer: 1
            },
            {
                question: "Why is the Minute Ventilation important?",
                options: ["It determines the amount of oxygen dissolved in the blood plasma.", "It indicates the strength of the diaphragm muscle alone.", "It reflects the total air movement in the lungs per minute, ensuring proper gas exchange.", "It is used to diagnose specific heart rhythm abnormalities."],
                answer: 2
            },
            {
                question: "MV is the only way Minute Ventilation can be reported as a variable.",
                options: ["True", "False"],
                answer: 1
            }
        ];
    }

    function showRandomRecallQuestion() {
        // If no questions left, show completion
        if (quizState.recall.remainingQuestions.length === 0) {
            questionCards.recall.questionEl.textContent = 'Recall Quiz Completed!';
            questionCards.recall.optionsEl.innerHTML = '';
            questionCards.recall.feedbackEl.textContent = `You got ${quizState.recall.score} out of ${quizState.recall.questions.length} correct!`;
            questionCards.recall.feedbackEl.className = 'feedback correct';
            questionCards.recall.nextBtn.classList.add('hidden');
            questionCards.recall.submitBtn.classList.add('hidden');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * quizState.recall.remainingQuestions.length);
        const question = quizState.recall.remainingQuestions[randomIndex];
        quizState.recall.currentIndex = quizState.recall.questions.indexOf(question);
        questionCards.recall.questionEl.textContent = question.question;
        questionCards.recall.optionsEl.innerHTML = '';
        question.options.forEach((option, i) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'recall-option';
            optionDiv.innerHTML = `
                <input type="radio" name="recall-answer" id="option-${i}" value="${i}">
                <label for="option-${i}">${option}</label>
            `;
            questionCards.recall.optionsEl.appendChild(optionDiv);
        });
        
        questionCards.recall.feedbackEl.textContent = '';
        questionCards.recall.feedbackEl.className = 'feedback';
        questionCards.recall.nextBtn.classList.add('hidden');
        questionCards.recall.submitBtn.classList.remove('hidden');
        updateProgress('recall');
    }
    
    function checkRecallAnswer() {
        questionCards.recall.submitBtn.disabled = true;
        
        const selectedOption = document.querySelector('input[name="recall-answer"]:checked');
        if (!selectedOption) {
            questionCards.recall.feedbackEl.textContent = 'Please select an answer';
            questionCards.recall.feedbackEl.className = 'feedback incorrect';
            questionCards.recall.submitBtn.disabled = false;
            return;
        }
    
        const currentQuestion = quizState.recall.questions[quizState.recall.currentIndex];
        const isCorrect = parseInt(selectedOption.value) === currentQuestion.answer;
        
        // Show feedback immediately
        if (isCorrect) {
            questionCards.recall.feedbackEl.textContent = 'Correct!';
            questionCards.recall.feedbackEl.className = 'feedback correct';
            quizState.recall.score++;
        } else {
            questionCards.recall.feedbackEl.textContent = 'Incorrect';
            questionCards.recall.feedbackEl.className = 'feedback incorrect';
        }
    
        // Remove question from pool (regardless of correctness)
        quizState.recall.remainingQuestions = quizState.recall.remainingQuestions.filter(
            q => q.question !== currentQuestion.question
        );
    
        // Advance after 1 second
        setTimeout(() => {
            // Clear selection and re-enable button
            const options = document.querySelectorAll('input[name="recall-answer"]');
            options.forEach(option => option.checked = false);
            questionCards.recall.submitBtn.disabled = false;
            
            showRandomRecallQuestion();
            updateProgress('recall');
        }, 1000);
    }

    function showNextRecallQuestion() {
        showRandomRecallQuestion();
    }
});
