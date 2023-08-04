const upload = "https://uploads-ssl.webflow.com/64abb259c07028189d10bc82";

const bindDocument = (documents) => {
  const list = document.querySelector(".application-document-list");
  const item = document.querySelector(".application-document-item");

  documents.forEach((document) => {
    const icon = document.documentUrl.endsWith(".pdf")
      ? `${upload}/64abb259c07028189d10bcd6_ic_resume.svg`
      : `${upload}/64abb259c07028189d10bcd5_ic_link.svg`;
    const title = document.type === 0 ? "이력서" : "포트폴리오";

    const clonedItem = item.cloneNode(true);

    clonedItem.querySelector(".document-item-icon").src = icon;
    clonedItem.querySelector(".document-item-title").textContent = title;
    clonedItem.addEventListener("click", () => {
      window.open(document.documentUrl);
    });

    list.appendChild(clonedCV);
  });
};

class ScoreResultView {
  constructor(element) {
    this._element = element;

    this._applyDate = element.querySelector(".score-apply-date");
    this._totalScore = element.querySelector(".total-score");
    this._totalPercentage = element.querySelector(".total-percentage");
    this._opinionSummary = element.querySelector(".opnion-summary");

    this._competenceScore = element.querySelector(".competence-score");
    this._competenceScoreText = element.querySelector(".competence-score-text");
    this._competenceDetail1 = element.querySelector("._competence-detail-1");
    this._competenceDetail2 = element.querySelector("._competence-detail-2");
    this._competenceDetail3 = element.querySelector("._competence-detail-3");

    this._humanismScore = element.querySelector(".humanism-score");
    this._humanismScoreText = element.querySelector(".humanism-score-text");
    this._humanismDetail1 = element.querySelector("._humanism-detail-1");
    this._humanismDetail2 = element.querySelector("._humanism-detail-2");
    this._humanismDetail3 = element.querySelector("._humanism-detail-3");
  }

  bind(model) {
    this._applyDate.textContent = `${model.createdAt} 제출`;
    this._totalScore.textContent = model.totalScore.grade;
    this._totalPercentage.textContent = `상위 ${model.totalScore.percentage}%`;
    this._opinionSummary = model.opinionSummary ?? "";

    this._competenceScore.textContent = model.competenceScore.grade;
    this._competenceScoreText.textContent = model.competenceScore.label;
    this._competenceDetail1.textContent = model.competenceDetail1Rating;
    this._competenceDetail2.textContent = model.competenceDetail2Rating;
    this._competenceDetail3.textContent = model.competenceDetail3Rating;

    this._humanismScore.textContent = model.humanismScore.grade;
    this._humanismScoreText.textContent = model.humanismScore.label;
    this._humanismDetail1.textContent = model.humanismDetail1Rating;
    this._humanismDetail2.textContent = model.humanismDetail2Rating;
    this._humanismDetail3.textContent = model.humanismDetail3Rating;
  }
}

const data = {
  createdAt: "2023.08.04",
  status: 0,
  resumeUrl: "https://naver.com",
  portfolioUrl: "https://ssgsag.kr",
  jobGroup: {
    id: 2,
    name: "개발",
  },
  job: {
    id: 11,
    name: "프론트엔드 개발자",
  },
  competenceScore: {
    grade: "C",
    label: "보완 필요해요",
  },
  competenceDetail1Rating: "하",
  competenceDetail2Rating: "하",
  competenceDetail3Rating: "하",
  humanismScore: {
    grade: "C",
    label: "보완 필요해요",
  },
  humanismDetail1Rating: "하",
  humanismDetail2Rating: "하",
  humanismDetail3Rating: "하",
  totalScore: {
    grade: "C",
    percentage: 60,
  },
  opinionSummary: null,
};

const scoreResultView = new ScoreResultView(
  document.querySelector(".score-result-container")
);

scoreResultView.bind(data);
