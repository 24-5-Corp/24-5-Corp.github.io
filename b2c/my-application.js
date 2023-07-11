class MyAppicationView {
  constructor(element) {
    this._element = element;

    this._name = element.querySelector(".application-name");
    this._introduceContainer = element.querySelector(".application-introduce");
    this._keywordList = element.querySelector(".application-introduce-keyword");
    this._keyword = element.querySelector(".keyword-chip");
    this._email = element.querySelector(".application-email");
    this._contact = element.querySelector(".application-contact");
    this._cvList = element.querySelector(".application-document-list");
    this._cv = element.querySelector(".application-document");

    this._recordContainer = element.querySelector(".record-contents-container");
    this._recordItem = element.querySelector(".record-item-container");
    this._record = element.querySelector(".application-record");
    this._skillList = element.querySelector(".application-skill-list");

    this._workType = element.querySelector(".application-work-type");
    this._workLocation = element.querySelector(".application-work-location");
    this._workStartDate = element.querySelector(".application-work-start-date");
    this._workAdditional = element.querySelector(
      ".application-work-additional"
    );
  }

  bind(model) {
    this._name.textContent = model.seeker.name;
    this._email.textContent = model.seeker.email;
    this._contact.textContent = model.seeker.contact;

    model.documents.forEach((document) => {
      console.log(document);
      const clonedCV = this._cv.cloneNode(true);
      const icon = document.documentUrl.endsWith(".pdf")
        ? "https://uploads-ssl.webflow.com/64abb259c07028189d10bc82/64abb259c07028189d10bcd6_ic_resume.svg"
        : "https://uploads-ssl.webflow.com/64abb259c07028189d10bc82/64abb259c07028189d10bcd5_ic_link.svg";
      const title = document.type === 0 ? "이력서" : "포트폴리오";
      clonedCV.querySelector(".document-item-icon").src = icon;
      clonedCV.querySelector(".document-item-title").textContent = title;

      this._cvList.appendChild(clonedCV);
    });

    // 학적 정보
    const academic = model.academicRecord;
    const academicContainer = this._recordItem.cloneNode(true);
    const academicList = academicContainer.querySelector(".record-list");
    const academicRecord = this._record.cloneNode(true);
    academicContainer.querySelector(".record-container-title").textContent =
      "학적 정보";

    academicRecord.querySelector(
      ".record-title"
    ).textContent = `${academic.university} ${academic.major}`;

    academicRecord.querySelector(
      ".record-sub-title"
    ).textContent = `학점 ${academic.avgScore} ${academic.stdScore}`;

    let description = `${academic.graduate} (${academic.graduateYearMonth} 졸업)`;
    academicRecord.querySelector(".record-description").textContent =
      description;

    academicList.appendChild(academicRecord);
    this._recordContainer.appendChild(academicContainer);

    // 스킬
    model.repKeywords.forEach((skill) => {
      const clonedSkill = this._keyword.cloneNode(true);
      clonedSkill.textContent = skill;
      this._skillList.appendChild(clonedSkill);
    });

    // 근무조건
    const workCondition = model.workCondition;
    const workTypeArray = [];
    workCondition.recruitmentTypeGroups.forEach((type) => {
      workTypeArray.push(type.name);
    });
    this._workType.textContent = workTypeArray;

    const workLocationArray = [];
    workCondition.regions.forEach((region) => {
      workLocationArray.push(region.name);
    });
    this._workLocation.textContent = workLocationArray;

    this._workStartDate.textContent = workCondition.workStart;
    if (workCondition.additional != null) {
      this._workAdditional.textContent = workCondition.additional;
    }

    this._element.style.display = "flex";
  }
}

const applicationDto = {
  id: 0,

  seeker: {
    name: "피니",
    email: "moonp@ssgsag.kr",
    contact: "010-2415-8974",
  },

  academicRecord: {
    university: "한국해양대학교",
    major: "해양공학과",
    avgScore: 4.0,
    stdScore: 4.5,
    graduate: 1,
    grade: 1,
    semester: 2,
    graduateYearMonth: "202302",
  },

  documents: [
    {
      type: 0,
      name: "피니 마이커리어.pdf",
      documentUrl:
        "https://s3.ap-northeast-2.amazonaws.com/project-hs/resumes/00e0c239-f682-45da-bcf9-d85bcc961923.pdf",
    },
  ],

  repKeywords: ["창의적인", "도전적인"],

  repProjects: [
    {
      category: 1,
      name: "프로젝트",
      role: "역할",
      startDate: "2023.05",
      endDate: "2023.05",
      inProgress: false,
    },
  ],

  awards: [],
  certificates: [],
  languageTests: [],
  languages: [],
  educations: [],

  jobSkill: {
    jobGroup: "개발",
    jobs: ["웹 개발자", "서버 개발자"],
    skills: [
      {
        id: 728,
        name: "C",
      },
    ],
  },

  workCondition: {
    recruitmentTypeGroups: [
      {
        id: 1,
        name: "인턴십",
      },
    ],
    regions: [
      {
        id: 1,
        name: "서울",
      },
      {
        id: 2,
        name: "경기",
      },
    ],
    workStart: "2023-03-07",
    additional: "Hello, World!",
  },
};

const getApplyStatus = () => {
  // apiService
  //   .makeRequest("/apply-status")
  //   .then((response) => {
  //     // -> 있으면 신청서 조회 get
  //     // -> 없으면 신청 유도 뷰 노출
  //   })
  //   .catch((error) => console.error(error));
};

const application = new MyAppicationView(
  document.querySelector(".application-container")
);

const getApplySeeker = () => {
  apiService
    .makeRequest("/apply-seeker")
    .then((response) => {
      application.bind(response);
    })
    .catch((error) => console.error(error));
};

// 신청 상태 get
// getApplyStatus();
application.bind(applicationDto);
