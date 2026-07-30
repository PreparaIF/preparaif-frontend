import { useState, useEffect } from 'react';
import { fetchExams } from '../../services/exams';
import './ExamDetails.css';
import { useNavigate } from 'react-router-dom';

function Exam() {
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);

  const [screenState, setScreenState] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    fetchExams()
      .then((data) => {
        setExamData(data);
        if (data) {
          setUserAnswers(Array(data.questions.length).fill(null));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingExam(false));
  }, []);

  if (loadingExam) {
    return (
      <div className="exam-page-container">
        <p>Carregando prova...</p>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="exam-page-container">
        <p>Não foi possível carregar a prova.</p>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];

  const startExam = () => setScreenState('playing');

  const handleOptionSelect = (index) => {
    setSelectedOption(index);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = index;
    setUserAnswers(newAnswers);
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setSelectedOption(userAnswers[prevIndex]);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setSelectedOption(userAnswers[nextIndex]);
    } else {
      setIsModalOpen(true);
    }
  };

  const confirmFinish = () => {
    setIsModalOpen(false);
    setScreenState('finished');
  };

  const restartExam = () => {
    setScreenState('intro');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserAnswers(Array(examData.questions.length).fill(null));
  };

  if (screenState === 'intro') {
    return (
      <div className="exam-page-container">
        <div className="exam-header">
          <button className="btn-voltar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Voltar
          </button>
        </div>
        <div className="intro-content">
          <h1 className="intro-title">Você fará a prova para ingresso no curso<br />{examData.title}</h1>
          <button className="btn-green-large" onClick={startExam}>Começar</button>
        </div>
      </div>
    );
  }

  if (screenState === 'playing') {
    return (
      <div className="exam-page-container">

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h2>Tem certeza que deseja finalizar?</h2>
              <div className="modal-buttons">
                <button className="btn-gray-large" onClick={() => setIsModalOpen(false)}>Voltar</button>
                <button className="btn-green-large" onClick={confirmFinish}>Finalizar</button>
              </div>
            </div>
          </div>
        )}

        <div className="progress-bar-container">
          {examData.questions.map((_, index) => (
            <div
              key={index}
              className={`progress-step ${index <= currentQuestionIndex ? 'active' : ''}`}
            ></div>
          ))}
        </div>

        <div className="exam-header">
          <button className="btn-voltar" onClick={() => setScreenState('intro')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Voltar
          </button>
        </div>

        <div className="question-content">
          <h2 className="question-text">{currentQuestion.text}</h2>

          <div className="options-list">
            {currentQuestion.options.map((option, index) => (
              <label key={index} className={`option-item ${selectedOption === index ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="exam-option"
                  checked={selectedOption === index}
                  onChange={() => handleOptionSelect(index)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="exam-footer">
          {currentQuestionIndex > 0 && (
            <button className="btn-gray-large" onClick={prevQuestion}>Anterior</button>
          )}
          <button className="btn-green-large" onClick={nextQuestion} disabled={selectedOption === null}>
            {currentQuestionIndex === examData.questions.length - 1 ? 'Finalizar' : 'Próxima'}
          </button>
        </div>
      </div>
    );
  }

  if (screenState === 'finished') {
    const totalQuestions = examData.questions.length;
    const correctCount = userAnswers.filter((answer, i) => answer === examData.questions[i].correctAnswerIndex).length;
    const wrongCount = totalQuestions - correctCount;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    return (
      <div className="exam-page-container">
        <div className="exam-header">
          <button className="btn-voltar" onClick={restartExam}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            Voltar
          </button>
        </div>

        <div className="intro-content">
          <div
            className="progress-wrapper"
            style={{ background: `conic-gradient(#3b9159 ${percentage}%, #9ec7a9 0)` }}
          >
            <div className="progress-inner">
              <span className="percentage-text">{percentage}%</span>
            </div>
          </div>

          <div className="results-text-container">
            <h2 className="results-title">Parabéns!</h2>
            <p className="results-subtitle">Esse foi o seu resultado:</p>
          </div>

          <div className="score-boxes">
            <div className="score-box correct">{correctCount} acertos</div>
            <div className="score-box wrong">{wrongCount} erros</div>
          </div>

          <div className="action-buttons-vertical">
            <button className="btn-green-large w-100" onClick={() => navigate(-1)}>Continuar</button>
            <button className="btn-outline-large w-100" onClick={restartExam}>Refazer</button>
          </div>

        </div>
      </div>
    );
  }
}

export default Exam;