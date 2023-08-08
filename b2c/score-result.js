const upload = "https://uploads-ssl.webflow.com/64abb259c07028189d10bc82";

const bindDocument = (documents) => {
  const list = document.querySelector(".application-document-list");
  const item = document.querySelector(".application-document-item");

  list.removeChild(item);

  documents.forEach((document) => {
    const icon = document.url.endsWith(".pdf")
      ? `${upload}/64abb259c07028189d10bcd6_ic_resume.svg`
      : `${upload}/64abb259c07028189d10bcd5_ic_link.svg`;
    const title = document.type === 0 ? "이력서" : "포트폴리오";

    const clonedItem = item.cloneNode(true);

    clonedItem.querySelector(".document-item-icon").src = icon;
    clonedItem.querySelector(".document-item-title").textContent = title;
    clonedItem.addEventListener("click", () => {
      window.open(document.url);
    });

    list.appendChild(clonedItem);
  });
};

class ScoreResultView {
  scoreColor = [
    {
      score: "S",
      scoreLabel: "최상",
      color: "#F3B81E",
      subColor: "#F5D04C",
      backgroundColor: "#FFFCF1",
    },
    {
      score: "A",
      scoreLabel: "상",
      color: "#656EF0",
      subColor: "#B2B6F7",
      backgroundColor: "#F3F3FE",
    },
    {
      score: "B",
      scoreLabel: "중",
      color: "#189E58",
      subColor: "#96DEBC",
      backgroundColor: "#EEFAF4",
    },
    {
      score: "C",
      scoreLabel: "하",
      color: "#E14E4E",
      subColor: "#F09E9E",
      backgroundColor: "#FFEFEF",
    },
  ];

  addInformationSection = [
    {
      title: "내 이력서에 딱 맞는",
      spanTitle: "기업, 포지션이 궁금하다면?",
      subTitle: "슈퍼패스 매칭 매니저와 바로 상담해보세요!",
      buttonLabel: "상담 신청하기",
      color: "#FF5247",
      background: "#FEFAF6",
    },
    {
      title: "이력서, 포트폴리오",
      spanTitle: "지금 보완해야 하는 이유?",
      subTitle:
        "잘 만든 이력서 하나면\n급성장 중인 스타트업 면접 제안이 도착해요.",
      buttonLabel: "더 알아보기",
      color: "#189E58",
      background: "#F7FEF6",
    },
    {
      title: "제출한 이력서로",
      spanTitle: "면접 제안 받아볼래요?",
      subTitle:
        "몇 가지 정보만 더 입력하면\n급성장 중인 스타트업에서 면접 제안이 도착해요.",
      buttonLabel: "면접 제안 받기",
      color: "#656EF0",
      background: "#F6F6FE",
    },
  ];

  constructor(element) {
    this._element = element;

    this._scoreResultTitle = element.querySelector(".score-result-title");
    this._applyDate = element.querySelector(".score-apply-date");
    this._totalScore = element.querySelector(".total-score");
    this._totalPercentage = element.querySelector(".total-percentage");
    this._opinionSummary = element.querySelector(".opinion-summary");
    this._scoreGraphImage = element.querySelector(".score-graph-image");

    this._competenceScoreCotainer = element.querySelector(
      ".competence-score-container"
    );
    this._competenceScore = element.querySelector(".competence-score");
    this._competenceScoreText = element.querySelector(".competence-score-text");
    this._competenceDetail1 = element.querySelector(".competence-detail-1");
    this._competenceDetail2 = element.querySelector(".competence-detail-2");
    this._competenceDetail3 = element.querySelector(".competence-detail-3");

    this._humanismScoreContainer = element.querySelector(
      ".humanism-score-container"
    );
    this._humanismScore = element.querySelector(".humanism-score");
    this._humanismScoreText = element.querySelector(".humanism-score-text");
    this._humanismDetail1 = element.querySelector(".humanism-detail-1");
    this._humanismDetail2 = element.querySelector(".humanism-detail-2");
    this._humanismDetail3 = element.querySelector(".humanism-detail-3");

    this._addInformationSection = element.querySelector(
      ".add-information-section"
    );
    this._addInformationTitle = element.querySelector(".add-information-title");
    this._addInformationTitleSpan = element.querySelector(
      ".add-information-title-span"
    );
    this._addInformationSubTitle = element.querySelector(
      ".add-information-sub-title "
    );
    this._addInformationButton = element.querySelector(
      ".add-information-button"
    );
  }

  bind = (model) => {
    this._scoreResultTitle.textContent = `${model.name}의 이력 등급은`;
    this._applyDate.textContent = `${model.createdAt} 제출`;
    this._totalScore.textContent = model.totalScore.grade;
    this._totalPercentage.textContent = `상위 ${model.totalScore.percentage}%`;
    this._opinionSummary.textContent = model.opinionSummary ?? "";

    const competenceColor = this.scoreColor.find(
      (score) => score.score === model.competenceScore.grade
    );
    this._competenceScoreCotainer.style.backgroundColor =
      competenceColor.backgroundColor;
    this._competenceScore.style.color = competenceColor.color;
    this._competenceScoreText.style.color = competenceColor.subColor;
    this._competenceScore.textContent = model.competenceScore.grade;
    this._competenceScoreText.textContent = model.competenceScore.label;
    this._competenceDetail1.textContent = model.competenceDetail1Rating;
    this._competenceDetail2.textContent = model.competenceDetail2Rating;
    this._competenceDetail3.textContent = model.competenceDetail3Rating;

    const humanismColor = this.scoreColor.find(
      (score) => score.score === model.humanismScore.grade
    );
    this._humanismScoreContainer.style.backgroundColor =
      humanismColor.backgroundColor;
    this._humanismScore.style.color = humanismColor.color;
    this._humanismScoreText.style.color = humanismColor.subColor;
    this._humanismScore.textContent = model.humanismScore.grade;
    this._humanismScoreText.textContent = model.humanismScore.label;
    this._humanismDetail1.textContent = model.humanismDetail1Rating;
    this._humanismDetail2.textContent = model.humanismDetail2Rating;
    this._humanismDetail3.textContent = model.humanismDetail3Rating;

    this.setScoreChip(this._competenceDetail1, model.competenceDetail1Rating);
    this.setScoreChip(this._competenceDetail2, model.competenceDetail2Rating);
    this.setScoreChip(this._competenceDetail3, model.competenceDetail3Rating);
    this.setScoreChip(this._humanismDetail1, model.humanismDetail1Rating);
    this.setScoreChip(this._humanismDetail2, model.humanismDetail2Rating);
    this.setScoreChip(this._humanismDetail3, model.humanismDetail3Rating);

    this._scoreGraphImage.src = this.getGraphImage(model.totalScore.percentage);
    this._scoreGraphImage.style.display = "block";

    const applyInformation =
      this.addInformationSection[this.getAddInformation(model)];

    this._addInformationSection.style.backgroundColor =
      applyInformation.background;
    this._addInformationTitle.textContent = applyInformation.title;
    this._addInformationTitleSpan.textContent = applyInformation.spanTitle;
    this._addInformationTitleSpan.style.color = applyInformation.color;
    this._addInformationSubTitle.textContent = applyInformation.subTitle;
    this._addInformationButton.textContent = applyInformation.buttonLabel;
    this._addInformationButton.style.backgroundColor = applyInformation.color;

    const urls = [
      "https://whattime.co.kr/superpassmento/30min",
      "/",
      `/score/apply-superpass?documentReviewId=${model.id}`
    ];
    this._addInformationButton.addEventListener("click", () => {
      const infomationUrl = urls[this.getAddInformation(model)];
      if (infomationUrl.startsWith("/")) {
        location.href = infomationUrl;
      } else {
        window.open(infomationUrl);
      }
    });

    this.handleShow(true);
  };

  getAddInformation = (model) => {
    const applyStatus = model.superpassApplyStatus;
    const grade = model.totalScore.grade;
    if (applyStatus === 1 || applyStatus === 2) {
      return 0;
    } else if (grade === "C") {
      return 1;
    } else {
      return 2;
    }
  };

  getGraphImage = (percentage) => {
    switch (percentage) {
      case 1:
        return "https://uploads-ssl.webflow.com/641969d09672c909169b6d7e/64d04c968416a474a550331b_img_graph_20.png";
      case 2:
        return "https://uploads-ssl.webflow.com/641969d09672c909169b6d7e/64d04c966b645b27d693f1c9_img_graph_19.png";
      case 5:
        return "https://uploads-ssl.webflow.com/641969d09672c909169b6d7e/64d04c96347c14534e8c5f16_img_graph_18.png";
      case 15:
        return "https://uploads-ssl.webflow.com/641969d09672c909169b6d7e/64d04c9baea07df5b0341d2a_img_graph_17.png";
      case 30:
        return "https://uploads-ssl.webflow.com/641969d09672c909169b6d7e/64d04c9633771b6a552ce64b_img_graph_16.png";
      case 40:
        return "https://uploads-ssl.webflow.com/641969d09672c909169b6d7e/64d04c95b6c6593d1610b7b2_img_graph_15.png";
      case (50, 60):
        return "https://uploads-ssl.webflow.com/641969d09672c909169b6d7e/64d048906ff6fe47702e0fd8_img_graph_low.png";
      default:
        return "";
    }
  };

  setScoreChip = (chipView, score) => {
    const chipColor = this.scoreColor.find(
      (color) => color.scoreLabel === score
    );

    chipView.style.backgroundColor = chipColor.backgroundColor;
    chipView.style.color = chipColor.color;
  };

  handleShow = (isShow) => {
    const display = isShow ? "flex" : "none";
    this._element.style.display = display;
  };
}

const scoreResultView = new ScoreResultView(
  document.querySelector(".score-result-container")
);

const userName = document.querySelector(".application-name");
const userEmail = document.querySelector(".email-text");
const pendingView = document.querySelector(".result-pending");
const resendButton = document.querySelector(".resend-button");

const resendModal = new ConfirmModal(
  document.querySelector("#resendScoreModal")
);

resendModal.onConfirm = () => {
  location.href = "/score?isReset=true";
};

resendButton.addEventListener("click", () => {
  resendModal.handleShow(true);
});

const login = () => {
  localStorage.setItem("loginUrl", location.href);
  location.href = "/signup"
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  location.reload();
};

const $loginButton = document.getElementById("loginButton");
const $dashboardButton = document.getElementById("dashboardButton");
const accessToken = localStorage.getItem("accessToken");
$loginButton.textContent = accessToken ? "로그아웃" : "로그인";
$dashboardButton.style.display = accessToken ? "block" : "none";

$loginButton.addEventListener("click", () => {
  accessToken ? logout() : login();
});
$dashboardButton.addEventListener("click", () => {
  if (accessToken) {
    location.href = "/matches";
  }
});

const $profileImage = document.querySelector(".profile-image");
const $mobileMenu = document.querySelector(".navigation-mobile-menu");
const $dashboardMenu = document.querySelector(".dashboard-menu");
const $logoutMenu = document.querySelector(".logout-menu");

const adaptMedia = (isMobile) => {
  $loginButton.style.display = isMobile || !accessToken ? "block" : "none";
  $dashboardButton.style.display = isMobile && accessToken ? "block" : "none";
  $profileImage.style.display = !isMobile && accessToken ? "block" : "none";
  if (isMobile) {
    $mobileMenu.style.display = "none";
  }
};

const media = matchMedia("screen and (min-width: 768px)");

adaptMedia(media.matches);

media.addListener((event) => {
  adaptMedia(event.matches);
});

$dashboardMenu.addEventListener("click", () => {
  if (accessToken) {
    location.href = "/matches";
  }
});
$logoutMenu.addEventListener("click", () => {
  if (accessToken) {
    logout();
  }
});

const loginWithKakao = () => {
  localStorage.setItem("loginUrl", location.href);
  Kakao.Auth.authorize({
    redirectUri: `${document.location.origin}/signin`,
  });
};

const kakaoSigninModal = new Modal(
  document.querySelector(".kakao-signin-modal")
);
document.querySelector(".kakao-modal-button").addEventListener("click", () => {
  loginWithKakao();
});

if (!accessToken) {
  document.querySelector(".lnb-contents-container").style.minHeight = "1000px";
  document.querySelector(".document-review-container").style.display = "none";
  kakaoSigninModal.handleShow(true);
} else {
  apiService
    .makeRequest("/superpass/v2/document-review")
    .then((response) => {
      if (response.data === null) {
        redirectMain();
      }

      userName.textContent = response.data.name;
      userEmail.textContent = response.data.email;
      bindDocument(response.data.documents);

      if (response.data.status === 1) {
        scoreResultView.bind(response.data);
        pendingView.style.display = "none";
      } else {
        scoreResultView.handleShow(false);
        pendingView.style.display = "flex";
      }
    })
    .catch((error) => console.error(error));
}
