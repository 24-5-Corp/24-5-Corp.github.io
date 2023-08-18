logScreenView({ screenName: "superpass_score-result" });
addLogButtonEventListener();

const upload = "https://uploads-ssl.webflow.com/641969d09672c909169b6d7e";

function endsWithAny(str, suffixes) {
  for (const suffix of suffixes) {
    if (str.endsWith(suffix)) {
      return true;
    }
  }
  return false;
}

const fileExtensions = [".pdf", ".doc", ".docx"];

const bindDocument = (documents) => {
  const list = document.querySelector(".application-document-list");
  const item = document.querySelector(".application-document-item");

  list.removeChild(item);

  documents.forEach((document) => {
    const icon = endsWithAny(document.url, fileExtensions)
      ? `${upload}/64a7bfe4e0cfaf4d349fd850_ic_resume.svg`
      : `${upload}/64a7bfe47ba13bc4c3cf6e7c_ic_link.svg`;
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
      buttonName: "superpass_score-result_consulting",
    },
    {
      title: "이력서, 포트폴리오",
      spanTitle: "지금 보완해야 하는 이유?",
      subTitle: `잘 만든 이력서 하나면
        급성장 중인 스타트업 면접 제안이 도착해요.`,
      buttonLabel: "더 알아보기",
      color: "#189E58",
      background: "#F7FEF6",
      buttonName: "superpass_score-result_superpass-more",
    },
    {
      title: "제출한 이력서로",
      spanTitle: "면접 제안 받아볼래요?",
      subTitle: `몇 가지 정보만 더 입력하면
        급성장 중인 스타트업에서 면접 제안이 도착해요.`,
      buttonLabel: "면접 제안 받기",
      color: "#656EF0",
      background: "#F6F6FE",
      buttonName: "superpass_score-result_superpass-apply",
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
    this._scoreResultTitle.textContent = `${model.name}님의 이력 등급은`;
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
      `/score/apply-superpass?documentReviewId=${model.id}`,
    ];
    this._addInformationButton.addEventListener("click", () => {
      const infomationUrl = urls[this.getAddInformation(model)];
      if (infomationUrl.startsWith("/")) {
        location.href = infomationUrl;
      } else {
        window.open(infomationUrl);
      }

      logButtonClick({ buttonName: applyInformation.buttonName });
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
        return `${upload}/64d5e57de812d772ab2a75a2_img_graph_20.png`;
      case 2:
        return `${upload}/64d5e57e3585f6bbbac0f847_img_graph_19.png`;
      case 5:
        return `${upload}/64d5e57d5e66f55a73ca0f81_img_graph_18.png`;
      case 15:
        return `${upload}/64d5e57d4a8399350ecd3b99_img_graph_17.png`;
      case 30:
        return `${upload}/64d5e57d62dd96d36f4531e7_img_graph_16.png`;
      case 40:
        return `${upload}/64d5e57d4a8399350ecd3c41_img_graph_15.png`;
      case 50:
      case 60:
        return `${upload}/64d5e57de5f9ee8943a3d21c_img_graph_14.png`;
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
const mentoringTitles = document.querySelectorAll(".mentoring-title");
const resendButton = document.querySelector(".resend-button");
const enhanceButton = document.querySelector(".enhance-button");

const resendModal = new ConfirmModal(
  document.querySelector("#resendScoreModal")
);

resendModal.onConfirm = () => {
  location.href = "/score?isReset=true";
};

enhanceButton.addEventListener("click", () => {
  window.open(
    "https://ssgsag.notion.site/5795b201a5c042f5bfc384efe081a67a?pvs=4"
  );
});
resendButton.addEventListener("click", () => {
  resendModal.handleShow(true);
});

const login = () => {
  localStorage.setItem("loginUrl", location.href);
  location.href = "/signup";
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  location.href = "/score";
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

const applyInvalidModal = new AlertModal(
  document.querySelector("#applyInvalidModal")
);

const mentors = [
  {
    jobGroupId: 1,
    profileUrl: `${upload}/64dc9c89fec90a680e304947_img_mento_mrk_1.png`,
    name: "유니 멘토",
    career: "카카오 / 디지털 마케터 / 8년차",
    mentorUrl:
      "https://ssgsag.notion.site/1-N-a1308c8602894073b97abb00d3db8f58?pvs=4",
  },
  {
    jobGroupId: 1,
    profileUrl: `${upload}/64dc9c89d12c1cc492fe4ee7_img_mento_mrk_2.png`,
    name: "브라이언 멘토",
    career: "(전) 오늘의집 / CRM 마케터 / 9년차",
    mentorUrl:
      "https://ssgsag.notion.site/2-N-2ffdc45aef4440299966c0faf8cad0d3?pvs=4",
  },
  {
    jobGroupId: 1,
    profileUrl: `${upload}/64dc9c8ae3175bfdb7c7e088_img_mento_mrk_2-1.png`,
    name: "준비중",
    career: "-",
    mentorUrl: "",
  },
  {
    jobGroupId: 2,
    profileUrl: `${upload}/64ddd8478a19854ed3fceea5_img_mento_dev_1.png`,
    name: "제이든 멘토",
    career: "마켓컬리 / Android 개발자 / 4년차",
    mentorUrl:
      "https://ssgsag.notion.site/e367f1eb27fe42399c97af53b3800685?pvs=4",
  },
  {
    jobGroupId: 2,
    profileUrl: `${upload}/64dc9c89e79a172c36bb1b53_img_mento_dev_2.png`,
    name: "람다 멘토",
    career: "네이버 / 백엔드 엔지니어 / 10년차",
    mentorUrl:
      "https://ssgsag.notion.site/2-N-205c21d3c39f4926b059e442818632a1?pvs=4",
  },
  {
    jobGroupId: 2,
    profileUrl: `${upload}/64ddd847634a1b4e1a95652e_img_mento_dev_3.png`,
    name: "TU 멘토",
    career: "라인플러스 / 소프트웨어 엔지니어 / 5년차",
    mentorUrl:
      "https://ssgsag.notion.site/TU-18a12de9e06c4d22986b28191f1c6e0d?pvs=4",
  },
  {
    jobGroupId: 3,
    profileUrl: `${upload}/64dc9c89baa006e0f3b97a4a_img_mento_management_1.png`,
    name: "쿠쿠 멘토",
    career: "쿠팡 / 인사 기획 / 3년차",
    mentorUrl:
      "https://ssgsag.notion.site/N-03007d33247043f5a7e30d0dea8c64c4?pvs=4",
  },
  {
    jobGroupId: 3,
    profileUrl: `${upload}/64dc9c880f3656291fbd799f_img_mento_management_2.png`,
    name: "우와 멘토",
    career: "네이버I&S / 경영 지원 / 4년차",
    mentorUrl:
      "https://ssgsag.notion.site/2-N-e3792815f6444e55892c63cfda152d42?pvs=4",
  },
  {
    jobGroupId: 3,
    profileUrl: `${upload}/64dc9c89c6a3c935c9a1f97a_img_mento_management_3.png`,
    name: "알로 멘토",
    career: "카카오 / 경영 지원 / 10년차",
    mentorUrl:
      "https://ssgsag.notion.site/3-N-c92bbfce95cb4a3c9abaa8b43c56986e?pvs=4",
  },
  {
    jobGroupId: 4,
    profileUrl: `${upload}/64ddd84930ef3bf0335ce8ee_img_mento_design_1.png`,
    name: "미리미터 멘토",
    career: "배달의민족 / 브랜드 디자이너 / 6년차",
    mentorUrl:
      "https://ssgsag.notion.site/1-N-7cf4a97b479743a1920c14526c65c84e?pvs=4",
  },
  {
    jobGroupId: 4,
    profileUrl: `${upload}/64dc9c890156e8d54c9da2f0_img_mento_design_2.png`,
    name: "리지 멘토",
    career: "카카오페이 / 콘텐츠 디자이너 / 10년차",
    mentorUrl:
      "https://ssgsag.notion.site/2-N-261fc4e2d8fa4934842856ce4a91a3ec?pvs=4",
  },
  {
    jobGroupId: 4,
    profileUrl: `${upload}/64dd89531a903a3f7647e374_img_mento_design_3.png`,
    name: "해치 멘토",
    career: "야놀자 / 프로덕트 디자이너 / 11년차",
    mentorUrl:
      "https://ssgsag.notion.site/11-84be9e3cd4b64c0ab4e711bb7f74a88e?pvs=4",
  },
  {
    jobGroupId: 5,
    profileUrl: `${upload}/64dc9c89afbf93965fc28616_img_mento_pm_1.png`,
    name: "단 멘토",
    career: "라인플러스 / PM / 12년차",
    mentorUrl:
      "https://ssgsag.notion.site/1-CEO-4-e86d3fb2066f483384e9255ca301b86e?pvs=4",
  },
  {
    jobGroupId: 5,
    profileUrl: `${upload}/64dc9c893ec6291b9033088e_img_mento_pm_2.png`,
    name: "아이린 멘토",
    career: "카카오 / UX, 서비스 기획 / 10년차",
    mentorUrl:
      "https://ssgsag.notion.site/2-CEO-4-7821c5977f9a4d858cea8fa7bc178e5b?pvs=4",
  },
  {
    profileUrl: `${upload}/64dc9c89dc475efb34cd7791_img_mento_pm_3.png`,
    jobGroupId: 5,
    name: "슈듀슈 멘토",
    career: "네이버클라우드 / PM / 10년차",
    mentorUrl:
      "https://ssgsag.notion.site/3-CEO-4-d671f46390394011876ff66f7f2e4443?pvs=4",
  },
];

if (!accessToken) {
  document.querySelector(".lnb-contents-container").style.minHeight = "1000px";
  document.querySelector(".document-review-container").style.display = "none";
  kakaoSigninModal.handleShow(true);
} else {
  apiService
    .makeRequest("/superpass/v2/document-review")
    .then((response) => {
      if (response.data === null) {
        applyInvalidModal.onCheck = () => {
          location.href = "/score";
        };
        applyInvalidModal.handleShow(true);
      }

      userName.textContent = response.data.name;
      userEmail.textContent = response.data.email;
      mentoringTitles[0].textContent = `${response.data.name}님에게 추천하는`;
      mentoringTitles[1].textContent = `3명의 ${response.data.jobGroup.name} 멘토`;

      document.querySelectorAll(".mentor-item").forEach((item, index) => {
        const mentor = mentors.filter(
          (mentor) => mentor.jobGroupId === response.data.jobGroup.id
        )[index];

        item.querySelector(".mentor-image").src = mentor.profileUrl;
        item.querySelector(".mentor-name").textContent = mentor.name;
        item.querySelector(".mentor-career").textContent = mentor.career;
        const mentorSite = item.querySelector(".mentor-site");
        mentorSite.href = !mentor.mentorUrl ? "#" : mentor.mentorUrl;
        mentorSite.style.cursor = !mentor.mentorUrl ? "not-allowed" : "pointer";

        item.querySelector(".mentor-site").addEventListener("click", () => {
          gtag("event", "button_click", {
            button_name: `superpass_score-result_mentor${index + 1}`,
            job_group: response.data.jobGroup.name,
          });
        });
      });

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
