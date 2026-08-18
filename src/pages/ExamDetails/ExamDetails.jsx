import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchExamById } from "../../services/exams";
import { useAuth } from "../../contexts/auth-context";
import { ButtonVoltar } from "../../components";
import "./ExamDetails.css";

function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal, recordAttempt } = useAuth();

  const [examData, setExamData] = useState(null);
  const [loadingExam, setLoadingExam] = useState(true);

  const [screenState, setScreenState] = useState("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [attemptResult, setAttemptResult] = useState(null);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  useEffect(() => {
    fetchExamById(id)
      .then((data) => {
        if (data) {
          const validQuestions = (data.questions || []).filter(
            (question) => question.status === "VALID"
          );
          setExamData({ ...data, questions: validQuestions });
          setUserAnswers(Array(validQuestions.length).fill(null));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingExam(false));
  }, [id]);

  useEffect(() => {
    if (examData) {
      document.title = `Prepara IF - ${examData.title}`;
    }
  }, [examData]);

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
        <div className="exam-header">
          <ButtonVoltar />
        </div>
        <p>Não foi possível carregar a prova.</p>
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];

  const startExam = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    if (examData.questions.length === 0) return;
    setScreenState("playing");
  };

  const handleOptionSelect = (index) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = index;
    setUserAnswers(newAnswers);
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
    } else {
      setIsModalOpen(true);
    }
  };

  const confirmFinish = async () => {
    setSavingAttempt(true);
    setSubmissionError("");
    try {
      const savedAttempt = await recordAttempt({
        examId: Number(id),
        answers: examData.questions.map((question, index) => ({
          questionId: question.id,
          optionIndex: userAnswers[index],
        })),
      });
      setAttemptResult(savedAttempt);
      setIsModalOpen(false);
      setScreenState("finished");
    } catch (error) {
      setSubmissionError(error.message || "Não foi possível salvar sua tentativa.");
    } finally {
      setSavingAttempt(false);
    }
  };

  const restartExam = () => {
    setScreenState("intro");
    setCurrentQuestionIndex(0);
    setUserAnswers(Array(examData.questions.length).fill(null));
    setAttemptResult(null);
    setSubmissionError("");
  };

  if (screenState === "intro") {
    return (
      <div className="exam-page-container">
        <div className="exam-header">
          <ButtonVoltar />
        </div>
        <div className="intro-content">
          <h1 className="intro-title">
            Você fará {examData.title}
          </h1>
          <button
            className="btn-green-large"
            onClick={startExam}
            disabled={examData.questions.length === 0}
          >
            {examData.questions.length > 0 ? "Começar" : "Prova indisponível"}
          </button>
          {examData.questions.length === 0 && (
            <p role="alert">Esta prova ainda não possui questões válidas para responder.</p>
          )}
        </div>
      </div>
    );
  }

  if (screenState === "playing") {
    return (
      <div className="exam-page-container">
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="finish-title">
              <h2 id="finish-title">Tem certeza que deseja finalizar?</h2>
              {submissionError && <p role="alert">{submissionError}</p>}
              <div className="modal-buttons">
                <button
                  className="btn-gray-large"
                  onClick={() => setIsModalOpen(false)}
                  disabled={savingAttempt}
                >
                  Voltar
                </button>
                <button className="btn-green-large" onClick={confirmFinish} disabled={savingAttempt}>
                  {savingAttempt ? "Salvando..." : "Finalizar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="progress-bar-container">
          {examData.questions.map((question, index) => (
            <div
              key={question.id}
              className={`progress-step ${index <= currentQuestionIndex ? "active" : ""}`}
            ></div>
          ))}
        </div>

        <div className="exam-header">
          <ButtonVoltar onClick={() => setScreenState("intro")} />
        </div>

        <div className="question-content">
          {currentQuestion.supportText && (
            <section className="question-support" aria-label="Texto de apoio">
              <span className="question-support-label">Texto de apoio</span>
              <p>{currentQuestion.supportText}</p>
            </section>
          )}

          {currentQuestion.imageUrls?.length > 0 && (
            <div className="question-images" aria-label="Figuras da questão">
              {currentQuestion.imageUrls.map((imageUrl, imageIndex) => (
                <figure className="question-image" key={`${currentQuestion.id}-${imageIndex}`}>
                  <img src={imageUrl} alt={`Figura ${imageIndex + 1} da questão ${currentQuestion.number}`} />
                </figure>
              ))}
            </div>
          )}

          {currentQuestion.credits && (
            <p className="question-credits">Fonte / Créditos: {currentQuestion.credits}</p>
          )}

          <h2 className="question-text">{currentQuestion.text}</h2>

          <div className="options-list">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`option-item ${userAnswers[currentQuestionIndex] === index ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="exam-option"
                  checked={userAnswers[currentQuestionIndex] === index}
                  onChange={() => handleOptionSelect(index)}
                />
                <span className="option-text">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="exam-footer">
          {currentQuestionIndex > 0 && (
            <button className="btn-gray-large" onClick={prevQuestion}>
              Anterior
            </button>
          )}
          <button
            className="btn-green-large"
            onClick={nextQuestion}
            disabled={userAnswers[currentQuestionIndex] === null}
          >
            {currentQuestionIndex === examData.questions.length - 1
              ? "Finalizar"
              : "Próxima"}
          </button>
        </div>
      </div>
    );
  }

  if (screenState === "finished") {
    const totalQuestions = attemptResult?.total || 0;
    const correctCount = attemptResult?.score || 0;
    const wrongCount = totalQuestions - correctCount;
    const percentage = totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    const getResultMessage = (pct) => {
      if (pct >= 80) {
        return {
          title: "Excelente Desempenho!",
          subtitle: "Você dominou o conteúdo desta prova. Parabéns!",
          color: "#059669",
          ringColor: "#10B981",
          trackBg: "#D1FAE5"
        };
      }
      if (pct >= 50) {
        return {
          title: "Bom Trabalho!",
          subtitle: "Você teve um bom rendimento! Revise as questões que errou para melhorar ainda mais.",
          color: "#D97706",
          ringColor: "#F59E0B",
          trackBg: "#FDE68A"
        };
      }
      return {
        title: "Continue Praticando!",
        subtitle: "Não desanime! Cada tentativa é uma oportunidade de aprendizado. Revise o conteúdo e tente novamente.",
        color: "#DC2626",
        ringColor: "#EF4444",
        trackBg: "#FCA5A5"
      };
    };

    const feedback = getResultMessage(percentage);

    return (
      <div className="exam-page-container">
        <div className="exam-header">
          <ButtonVoltar onClick={restartExam} />
        </div>

        <div className="intro-content">
          <div
            className="progress-wrapper"
            style={{
              background: `conic-gradient(${feedback.ringColor} ${percentage}%, ${feedback.trackBg} 0)`,
            }}
          >
            <div className="progress-inner">
              <span className="percentage-text" style={{ color: feedback.color }}>
                {percentage}%
              </span>
            </div>
          </div>

          <div className="results-text-container">
            <h2 className="results-title">{feedback.title}</h2>
            <p className="results-subtitle">{feedback.subtitle}</p>
          </div>

          <div className="score-boxes">
            <div className="score-box correct">{correctCount} acertos</div>
            <div className="score-box wrong">{wrongCount} erros</div>
          </div>

          <div className="action-buttons-vertical">
            <button
              className="btn-green-large w-100"
              onClick={() => navigate(-1)}
            >
              Continuar
            </button>
            <button className="btn-outline-large w-100" onClick={restartExam}>
              Refazer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ExamDetails;
