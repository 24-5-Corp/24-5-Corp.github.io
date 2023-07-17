logScreenView({ screenName: "superpass_my-application" });
addLogButtonEventListener();

const projectCategories = [
  { id: 1, name: "경력" },
  { id: 2, name: "동아리/학회" },
  { id: 3, name: "대외활동" },
  { id: 4, name: "봉사활동" },
  { id: 5, name: "프로젝트" },
  { id: 6, name: "수강" },
  { id: 100, name: "기타" },
];

const graduates = [
  { id: 0, name: "졸업" },
  { id: 1, name: "재학" },
  { id: 2, name: "휴학" },
  { id: 3, name: "유예" },
];

const parseDate = (dateString, hasDay = false) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = formattedNumber(date.getMonth() + 1, 2);
  if (hasDay) {
    const day = formattedNumber(date.getDate(), 2);
    return `${year}.${month}.${day}`;
  } else {
    return `${year}.${month}`;
  }
};

const parsePhoneNumber = (phoneNumber) => {
  return phoneNumber.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
};

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
    this._position = element.querySelector(".position-name");

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

    this._credentialContainer = element.querySelector(".credential-container");
    this._credentialList = element.querySelector(".credential-record-list");
    this._credentialRecord = element.querySelector(".credential-record");
  }

  bind(model) {
    this.reset();
    this._name.textContent = model.seeker.name;
    this._email.textContent = model.seeker.email;
    this._contact.textContent = parsePhoneNumber(model.seeker.contact);

    if (model.repKeywords.length > 0) {
      model.repKeywords.forEach((keyword) => {
        const clonedKeyword = this._keyword.cloneNode(true);
        clonedKeyword.textContent = keyword;
        this._keywordList.appendChild(clonedKeyword);
      });
    } else {
      this._introduceContainer.style.display = "none";
    }

    this._position.textContent = model.jobSkill.jobs.join(", ");

    model.documents.forEach((document) => {
      const clonedCV = this._cv.cloneNode(true);
      const icon = document.documentUrl.endsWith(".pdf")
        ? "https://uploads-ssl.webflow.com/64abb259c07028189d10bc82/64abb259c07028189d10bcd6_ic_resume.svg"
        : "https://uploads-ssl.webflow.com/64abb259c07028189d10bc82/64abb259c07028189d10bcd5_ic_link.svg";
      const title = document.type === 0 ? "이력서" : "포트폴리오";
      clonedCV.querySelector(".document-item-icon").src = icon;
      clonedCV.querySelector(".document-item-title").textContent = title;
      clonedCV.addEventListener("click", () => {
        window.open(document.documentUrl);
      });

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

    const graduate = graduates.find(
      (graduate) => graduate.id === academic.graduate
    ).name;

    let description = `${graduate} (${academic.graduateYearMonth.replace(
      /(\d{4})(\d{2})/,
      "$1.$2"
    )} 졸업)`;

    if (academic.graduate !== 0) {
      description =
        `${academic.grade}학년 ${academic.semester}학기 ` + description;
    }

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

        const categoryName = projectCategories.find(
          (category) => category.id === project.category
        ).name;

        clonedProjectRecord.querySelector(
          ".record-sub-title"
        ).textContent = `${categoryName} | ${project.role}`;

        const projectDate = project.inProgress
          ? `${parseDate(project.startDate)} ~ 진행중`
          : `${parseDate(project.startDate)} ~ ${parseDate(project.endDate)}`;
        clonedProjectRecord.querySelector(".record-description").textContent =
          projectDate;

        projectList.appendChild(clonedProjectRecord);
      });

      this._recordContainer.appendChild(projectContainer);
    }

    this._credentialList.removeChild(this._credentialRecord);

    // 추가 이력
    this.bindCredential(mapper.credentials.awards(model.awards));
    this.bindCredential(mapper.credentials.certificates(model.certificates));
    this.bindCredential(mapper.credentials.languageTests(model.languageTests));
    this.bindCredential(mapper.credentials.languages(model.languages));
    this.bindCredential(mapper.credentials.educations(model.educations));

    if (!this._credentialList.hasChildNodes()) {
      this._credentialContainer.style.display = "none";
    }

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
    this._workType.textContent = workTypeArray.join(", ");

    const workLocationArray = [];
    workCondition.regions.forEach((region) => {
      workLocationArray.push(region.name);
    });
    this._workLocation.textContent = workLocationArray.join(", ");

    this._workStartDate.textContent = parseDate(workCondition.workStart, true);

    const additional = !workCondition.additional ?? "없음";
    this._workAdditional.textContent = additional;

    this.handleShow(true);
  }

  reset() {
    this._recordContainer.removeChild(this._recordItem);
    this._cvList.removeChild(this._cv);
    this._skillList.removeChild(this._skill);
    this._keywordList.removeChild(this._keyword);
  }

  handleShow = (isShow) => {
    const display = isShow ? "flex" : "none";
    this._element.style.display = display;
  };

  bindCredential = (credentials) => {
    credentials.forEach((credential) => {
      const clonedItem = this._credentialRecord.cloneNode(true);
      const $title = clonedItem.querySelector(".record-title");
      const $subtitle = clonedItem.querySelector(".record-sub-title");
      const $date = clonedItem.querySelector(".record-description");

      $title.textContent = credential.title;
      $subtitle.textContent = credential.subtitle;

      if (credential.date) {
        $date.textContent = credential.date;
      } else {
        $date.style.display = "none";
      }

      this._credentialList.appendChild(clonedItem);
    });
  };
}

const applyStatusTypes = {
  prepare: 0,
  apply: 1,
  registeredPool: 2,
  complated: 3,
  cancelled: 4,
  reject: 5,
};

const application = new MyAppicationView(
  document.querySelector(".application-container")
);
const $information = document.querySelector(".information");
const $button = $information.querySelector(".information-button");
$button.addEventListener("click", () => {
  location.href = "/apply-superpasss";
});
const $applicaionInformation = document.querySelector(
  ".application-information"
);
const $editButton = document.querySelector(".edit-application-button");
const $cancelContainer = document.querySelector(".cancel-container");
const $applyCancelButton = document.querySelector(".apply-cancel-button");
const applyCancelModal = new ConfirmModal(
  document.querySelector("#applyCancelModal")
);
applyCancelModal.onConfirm = () => {
  apiService
    .makeRequest("/superpass/v2/apply-seeker", {
      method: "DELETE",
    })
    .then(() => {
      applyCancelModal.handleShow(false);
      applyCancelDoneModal.handleShow(true);
      fetchMyApplicaion();
    })
    .catch((error) => console.error(error));
};
const applyCancelDoneModal = new AlertModal(
  document.querySelector("#applyCancelDoneModal")
);

$applyCancelButton.addEventListener("click", () => {
  applyCancelModal.handleShow(true);
});

const fetchMyApplicaion = async () => {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    return loginWithKakao();
  } else {
    return getApplyStatus()
      .then((applyStatusDto) => {
        const applyStatus = applyStatusDto.applyStatus;

        switch (applyStatus) {
          case applyStatusTypes.prepare:
          case applyStatusTypes.complated:
          case applyStatusTypes.cancelled:
          case applyStatusTypes.reject:
            $information.style.display = "flex";
            $cancelContainer.style.display = "none";
            $applicaionInformation.style.display = "none";
            $editButton.style.display = "none";
            application.handleShow(false);
            break;

          case applyStatusTypes.apply:
          case applyStatusTypes.registeredPool:
            $information.style.display = "none";
            getApplySeeker();
            break;

          default:
            throw new Error("Invalid apply status");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }
};

const getApplyStatus = async () => {
  return await apiService.makeRequest("/superpass/v2/apply-status", {
    method: "GET",
  });
};

const getApplySeeker = () => {
  apiService
    .makeRequest("/superpass/v2/apply-seeker", {
      method: "GET",
    })
    .then((applicationDto) => {
      application.bind(applicationDto.data);
      $applicaionInformation.style.display = "flex";
      $cancelContainer.style.display = "flex";
      $editButton.style.display = "flex";
    })
    .catch((error) => console.error(error));
};

fetchMyApplicaion();

const $loginButton = document.getElementById("loginButton");
$loginButton.addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  location.href = "/";
});

Webflow.push(() => {
  document.querySelector("#application").classList.add("current");
});
