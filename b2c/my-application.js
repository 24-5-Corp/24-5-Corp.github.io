const mapper = {
  credentials: {
    repProjects: (repProjects) => {
      return repProjects.map((repProject) => {
        let date = parseDate(repProject.startDate);
        if (repProject.inProgress) {
          date += "진행중";
        } else if (repProject.endDate) {
          date += `~${parseDate(repProject.endDate)}`;
        }
        const categoryName = projectCategories.find(
          (category) => category.id === repProject.category
        ).name;

        return {
          title: repProject.name,
          subtitle: `${categoryName} | ${repProject.role}`,
          date: date,
        };
      });
    },

    awards: (awards) => {
      return awards.map((award) => {
        let subtitle = award.prize;
        if (award.prize) {
          subtitle += ` | ${award.host}`;
        }

        return {
          title: award.name,
          subtitle: subtitle,
          date: parseDate(award.awardDate),
        };
      });
    },

    certificates: (certificates) => {
      return certificates.map((certificate) => {
        return {
          title: certificate.name,
          subtitle: `${certificate.issuer} | ${certificate.grade}`,
          date: parseDate(certificate.acquisitionDate),
        };
      });
    },

    languageTests: (languageTests) => {
      return languageTests.map((languageTest) => {
        return {
          title: languageTest.language,
          subtitle: `${languageTest.name} | ${languageTest.grade}`,
          date: parseDate(languageTest.acquisitionDate),
        };
      });
    },

    languages: (languages) => {
      return languages.map((language) => {
        return {
          title: language.name,
          subtitle: language.proficiency,
        };
      });
    },

    educations: (educations) => {
      return educations.map((education) => {
        let date = parseDate(education.startDate);
        if (education.inProgress) {
          date += "진행중";
        } else if (education.endDate) {
          date += `~${parseDate(education.endDate)}`;
        }

        return {
          title: education.courseName,
          subtitle: education.institutionName,
          date: date,
        };
      });
    },
  },
};

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
    this._skillList = element.querySelector(".application-skill-list");
    this._skill = element.querySelector(".skill-chip");

    this._workType = element.querySelector(".application-work-type");
    this._workLocation = element.querySelector(".application-work-location");
    this._workStartDate = element.querySelector(".application-work-start-date");
    this._workAdditional = element.querySelector(
      ".application-work-additional"
    );

    this._additionalContainer = this._recordItem.cloneNode(true);
    this._additionalList =
      this._additionalContainer.querySelector(".record-list");
    this._additionalRecord = this._additionalContainer.querySelector(
      ".application-record"
    );
  }

  bind(model) {
    this.reset();
    this._name.textContent = model.seeker.name;
    this._email.textContent = model.seeker.email;
    this._contact.textContent = model.seeker.contact;

    if (model.repKeywords.length > 0) {
      model.repKeywords.forEach((keyword) => {
        const clonedKeyword = this._keyword.cloneNode(true);
        clonedKeyword.textContent = keyword;
        this._keywordList.appendChild(clonedKeyword);
      });
    } else {
      this._introduceContainer.style.display = "none";
    }

    model.documents.forEach((document) => {
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
    const academicRecord = academicList.querySelector(".application-record");
    const clonedAcademicRecord = academicRecord.cloneNode(true);
    academicList.removeChild(academicRecord);
    academicContainer.querySelector(".record-container-title").textContent =
      "학적 정보";

    clonedAcademicRecord.querySelector(
      ".record-title"
    ).textContent = `${academic.university} ${academic.major}`;

    clonedAcademicRecord.querySelector(
      ".record-sub-title"
    ).textContent = `학점 ${academic.avgScore} / ${academic.stdScore}`;

    let description = `${academic.graduate} (${academic.graduateYearMonth} 졸업)`;
    clonedAcademicRecord.querySelector(".record-description").textContent =
      description;

    academicList.appendChild(clonedAcademicRecord);
    this._recordContainer.appendChild(academicContainer);

    // 대표 프로젝트
    if (model.repProjects.length > 0) {
      const projectContainer = this._recordItem.cloneNode(true);
      const projectList = projectContainer.querySelector(".record-list");
      const projectRecord = projectList.querySelector(".application-record");
      projectList.removeChild(projectRecord);
      projectContainer.querySelector(".record-container-title").textContent =
        "대표 프로젝트";

      model.repProjects.forEach((project) => {
        const clonedProjectRecord = projectRecord.cloneNode(true);
        clonedProjectRecord.querySelector(".record-title").textContent =
          project.name;

        clonedProjectRecord.querySelector(
          ".record-sub-title"
        ).textContent = `${project.category} | ${project.role}`;

        const projectDate = project.inProgress
          ? `${project.startDate} ~ 진행중`
          : `${project.startDate} ~ ${project.endDate}`;
        clonedProjectRecord.querySelector(".record-description").textContent =
          projectDate;

        projectList.appendChild(clonedProjectRecord);
      });

      this._recordContainer.appendChild(projectContainer);
    }

    this._additionalList.removeChild(additionalRecord);
    this._additionalContainer.querySelector(
      ".record-container-title"
    ).textContent = "추가 이력";

    // 수상
    bindCredential(model.awards);

    // 스킬
    model.jobSkill.skills.forEach((skill) => {
      const clonedSkill = this._skill.cloneNode(true);
      clonedSkill.textContent = skill.name;
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

  reset() {
    this._recordContainer.removeChild(this._recordItem);
    this._cvList.removeChild(this._cv);
    this._skillList.removeChild(this._skill);
    this._keywordList.removeChild(this._keyword);
  }

  bindCredential = (credentials) => {
    credentials.forEach((credential) => {
      const clonedRecord = additionalRecord.cloneNode(true);
      const $title = clonedRecord.querySelector(".record-title");
      const $subtitle = clonedRecord.querySelector(".record-sub-title");
      const $date = clonedRecord.querySelector(".record-description");

      $title.textContent = credential.title;
      $subtitle.textContent = credential.subtitle;

      if (credential.date) {
        $date.textContent = credential.date;
      } else {
        $date.style.display = "none";
      }

      additionalList.appendChild(clonedAwardRecord);
    });
  };
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

  repKeywords: [],

  repProjects: [
    {
      category: 1,
      name: "프로젝트",
      role: "역할",
      startDate: "2023.05",
      endDate: "2023.05",
      inProgress: false,
    },
    {
      category: 1,
      name: "프로젝트2",
      role: "역할",
      startDate: "2023.05",
      endDate: "",
      inProgress: true,
    },
  ],

  awards: [
    {
      name: "AWS 해커톤",
      prize: "1등",
      host: "AWS",
      awardDate: "2023-02",
    },
    {
      name: "AWS 해커톤 2",
      prize: "2등",
      host: "AWS",
      awardDate: "2023-02",
    },
  ],
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
