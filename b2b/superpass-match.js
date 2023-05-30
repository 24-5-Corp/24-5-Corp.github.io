class CancelCheckboxGroup extends RegexInput {
  constructor(element) {
    super(element);

    this._input.disabled = true;

    this._buttons = element.querySelectorAll("label div");
    this._radios = element.querySelectorAll("label input");
    this._input.reasonIds = [];

    for (const radio of this._radios) {
      radio.addEventListener("input", (event) => {
        const reasonId = parseInt(event.target.id);
        const isETC = reasonId === 900;

        if (radio.checked) this._input.reasonIds.push(reasonId);
        else {
          const index = this._input.reasonIds.indexOf(reasonId);
          if (index > -1) this._input.reasonIds.splice(index, 1);
        }

        if (isETC) {
          const before = this._input.disabled ? "conditioned" : "enabled";
          const after = this._input.disabled ? "enabled" : "conditioned";

          this._input.classList.replace(before, after);
          this._input.disabled = !this._input.disabled;

          this._input.value = "";
        }

        this._input.dispatchEvent(this.inputEvent);
      });
    }
  }

  get isValid() {
    return this._input.reasonIds.length !== 0;
  }

  reset() {
    for (const button of this._buttons) {
      button.classList.remove("w--redirected-checked");
    }
    for (const radio of this._radios) {
      radio.checked = false;
    }

    this._input.classList.replace("enabled", "conditioned");
    this._input.reasonIds = [];
    this._input.value = "";
    this._input.disabled = true;
  }
}

class Matchup {
  constructor(element) {
    this._element = element;

    this._step = element.querySelector(".match-card-step-chip");
    this._dday = element.querySelector(".match-card-dday-chip");

    this._date = element.querySelector(".match-date-text");
    this._name = element.querySelector(".match-name-block");

    this._skillList = element.querySelector(".match-card-skil-div");
    this._skill = element.querySelector(".match-card-skill");
  }

  bind(model) {
    this.id = model.matchupId;
    this._status = model.matchupStatus;

    this._date.textContent = makeDate(model.matchedAt, "매칭");

    this._step.textContent = getStatusText(model.matchupStatus);
    this._step.style.backgroundColor = style.getPropertyValue(
      getStatusBackgroundColor(model.matchupStatus)
    );

    // START
    if (model.expirateDays !== undefined && model.expirateDays !== null) {
      // END
      this._dday.style.display = "inline-block";
      this._dday.textContent =
        model.expirateDays === 0 ? "오늘 만료" : `만료 D-${model.expirateDays}`;
    } else {
      this._dday.style.display = "none";
    }

    this._name.textContent = model.applicantName;

    removeAllChildren(this._skillList);
    model.personalSkills.forEach((skill) => {
      const clonedSkill = this._skill.cloneNode(true);
      clonedSkill.textContent = skill;
      this._skillList.appendChild(clonedSkill);
    });
  }

  reset() {
    this.id = undefined;
  }
}

class SuperpassCard extends Matchup {
  handleClick;

  constructor(element) {
    super(element);

    this._newBadge = element.querySelector(".math-card-new-badge-2");

    this._empty = element.querySelector(".match-card-empty");
    this._card = element.querySelector(".match-card-show");

    const scores = element.querySelectorAll(".match-card-score-text");
    this._jobCompetence = scores[0];
    this._practicalExperience = scores[1];
    this._attitude = scores[2];
    this._growthPotential = scores[3];

    this._keyword_first = element.querySelectorAll(".keyword-text")[0];
    this._keyword_second = element.querySelectorAll(".keyword-text")[1];

    this._projectContainer = element.querySelector(".match-card-project-div");
    this._projectList = element.querySelector(".match-card-project-list");
    this._project = element.querySelector(".match-card-project");
  }

  bind(model) {
    super.bind(model);

    this._empty.style.display = "none";
    this._card.style.display = "flex";

    this._newBadge.style.display = model.isNew ? "block" : "none";

    this._keyword_first.textContent = model.repKeywords[0];
    this._keyword_second.textContent = model.repKeywords[1];

    this._jobCompetence.textContent = model.scores.jobCompetence;
    this._practicalExperience.textContent = model.scores.practicalExperience;
    this._attitude.textContent = model.scores.attitude;
    this._growthPotential.textContent = model.scores.growthPotential;

    if (model.repProjects.length) {
      removeAllChildren(this._projectList);
      model.repProjects.forEach((project) => {
        const clonedProject = this._project.cloneNode(true);
        clonedProject.querySelector(".project-category-text").textContent =
          project.category;
        clonedProject.querySelector(".project-name-text").textContent =
          project.name;
        this._projectList.appendChild(clonedProject);
      });
      this._projectContainer.style.display = "flex";
    } else {
      this._projectContainer.style.display = "none";
    }

    this.handleClick = () => this.onClick(model);
    this._element.addEventListener("click", this.handleClick);
  }

  reset() {
    super.reset();

    this._element.removeEventListener("click", this.handleClick);
    this._empty.style.display = "flex";
    this._card.style.display = "none";
  }
}

class ResumeSection extends Matchup {
  constructor(element) {
    super(element);

    this._iframe = element.querySelector("iframe");
    this._content = element.querySelector(".div-block-82");

    this._university = element.querySelectorAll(".univ-info-text")[0];
    this._semesterInfo = element.querySelectorAll(".univ-info-text")[1];
    this._position = element.querySelector(".match-position-text");

    this._projectContainer = element.querySelector(".match-card-project-div");
    this._projectList = element.querySelector(".additional-info-list");
    this._project = element.querySelector(".additional-info");

    const additionalInfo = element.querySelectorAll(".additional-info-div");

    this._awardContainer = additionalInfo[0];
    this._awardList = additionalInfo[0].querySelector(".additional-info-list");
    this._award = additionalInfo[0].querySelector(".additional-info");

    this._certificateContainer = additionalInfo[1];
    this._certificateList = additionalInfo[1].querySelector(
      ".additional-info-list"
    );
    this._certificate = additionalInfo[1].querySelector(".additional-info");

    this._languageTestContainer = additionalInfo[2];
    this._languageTestList = additionalInfo[2].querySelector(
      ".additional-info-list"
    );
    this._languageTest = additionalInfo[2].querySelector(".additional-info");

    this._languageContainer = additionalInfo[3];
    this._languageList = additionalInfo[3].querySelector(
      ".additional-info-list"
    );
    this._language = additionalInfo[3].querySelector(".additional-info");

    this._educationContainer = additionalInfo[4];
    this._educationList = additionalInfo[4].querySelector(
      ".additional-info-list"
    );
    this._education = additionalInfo[4].querySelector(".additional-info");

    this._cancel = element.querySelector(".resume-button-negative");
    this._accept = element.querySelector(".resume-button-positive");
    this._disabled = element.querySelector(".resume-button-disabled");

    this._cvList = element.querySelector(".resume-detail-list");
    this._cv = element.querySelector(".resume-list-item");
  }

  bind(model) {
    super.bind(model);

    removeAllChildren(this._cvList);
    model.documents.forEach((cv) => this._bindCV(cv));
    this._bindAdditionalinfo(model);
    Webflow.require("ix2").init();
    [...this._cvList.children][0].click();

    this._cancel.style.display = getCancelDisplay(this._status);
    this._cancel.addEventListener("click", () => {
      cancelModal.status = this._status;
      cancelModal.title = replaceTitle(cancelModal);
      cancelModal.handleShow(true);
    });

    // START
    this._accept.textContent = getAcceptText(this._status);
    // END
    this._accept.style.display = getAcceptDisplay(this._status);
    this._accept.addEventListener("click", () => {
      switch (this._status) {
        case 10:
          interviewCheckModal.title = replaceTitle(interviewCheckModal);
          interviewCheckModal.handleShow(true);
          break;
        case 30:
          passCheckModal.title = replaceTitle(passCheckModal);
          passCheckModal.handleShow(true);
          break;
        default:
          break;
      }
    });

    this._disabled.style.display = getDisabledDisplay(this._status);

    const academic = model.academicRecord;
    this._university.textContent = academic.university + academic.major;
    let academicStatus = academic.status.name;
    if (academic.status.id != 0) {
      academicStatus += ` (${model.academicRecord.grade}학년/${model.academicRecord.semester}학기)`;
    }
    this._semesterInfo.textContent = academicStatus;

    const [firstJob, ...restJobs] = model.preferJobs;
    this._position.textContent = restJobs.reduce(
      (jobs, job) => `${jobs} / ${job}`,
      firstJob
    );

    if (model.repProjects.length) {
      removeAllChildren(this._projectList);
      model.repProjects.forEach((project) => {
        const itemView = this._project.cloneNode(true);
        const endDate = project.endDate ? makeDateMonth(project.endDate) : "진행 중";
        itemView.querySelector(
          ".resume-item-date-text"
        ).textContent = `${makeDateMonth(project.startDate)}~${endDate}`;
        itemView.querySelector(".resume-item-title-text").textContent =
          project.name;
        itemView.querySelector(
          ".resume-item-sub-title-text"
        ).textContent = `${project.category.name} | ${project.role}`;
        this._projectList.appendChild(itemView);
      });
      this._projectContainer.style.display = "flex";
    } else {
      this._projectContainer.style.display = "none";
    }
  }

  _bindAdditionalinfo(model) {
    if (model.awards.length) {
      removeAllChildren(this._awardList);
      model.awards.forEach((award) => {
        const itemView = this._award.cloneNode(true);
        itemView.querySelector(".resume-item-date-text").textContent = 
          makeDateMonth(award.awardDate);
        itemView.querySelector(".resume-item-title-text").textContent =
          award.name;
        const subTitle = award.host
          ? `${award.prize} | ${award.host}`
          : award.prize;
        itemView.querySelector(".resume-item-sub-title-text").textContent =
          subTitle;
        this._awardList.appendChild(itemView);
      });
      this._awardContainer.style.display = "flex";
    } else {
      this._awardContainer.style.display = "none";
    }

    if (model.certificates.length) {
      removeAllChildren(this._certificateList);
      model.certificates.forEach((certificate) => {
        const itemView = this._certificate.cloneNode(true);
        itemView.querySelector(".resume-item-date-text").textContent = 
          makeDateMonth(certificate.acquisitionDate);
        itemView.querySelector(".resume-item-title-text").textContent = 
          certificate.name;
        const subTitle = certificate.grade
          ? `${certificate.issuer} | ${certificate.grade}`
          : certificate.issuer;
        itemView.querySelector(".resume-item-sub-title-text").textContent =
          subTitle;
        this._certificateList.appendChild(itemView);
      });
      this._certificateContainer.style.display = "flex";
    } else {
      this._certificateContainer.style.display = "none";
    }

    if (model.languageTests.length) {
      removeAllChildren(this._languageTestList);
      model.languageTests.forEach((languageTest) => {
        const itemView = this._languageTest.cloneNode(true);
        itemView.querySelector(".resume-item-date-text").textContent =
          makeDateMonth(languageTest.acquisitionDate);
        itemView.querySelector(".resume-item-title-text").textContent =
        languageTest.language;
        const subTitle = languageTest.grade
          ? `${languageTest.name} | ${languageTest.grade}`
          : languageTest.name;
        itemView.querySelector(".resume-item-sub-title-text").textContent =
          subTitle;
        this._languageTestList.appendChild(itemView);
      });
      this._languageTestContainer.style.display = "flex";
    } else {
      this._languageTestContainer.style.display = "none";
    }

    if (model.languages.length) {
      removeAllChildren(this._languageList);
      model.languages.forEach((language) => {
        const itemView = this._language.cloneNode(true);
        itemView.querySelector(".resume-item-title-text").textContent =
          language.name;
        itemView.querySelector(".resume-item-sub-title-text").textContent =
          language.proficiency;
        this._languageList.appendChild(itemView);
      });
      this._languageContainer.style.display = "flex";
    } else {
      this._languageContainer.style.display = "none";
    }

    if (model.educations.length) {
      removeAllChildren(this._educationList);
      model.educations.forEach((education) => {
        const itemView = this._education.cloneNode(true);
        const endDate = education.endDate ? makeDateMonth(education.endDate) : "진행 중";
        itemView.querySelector(
          ".resume-item-date-text"
        ).textContent = `${makeDateMonth(education.startDate)}~${endDate}`;
        itemView.querySelector(".resume-item-title-text").textContent =
          education.courseName;
        itemView.querySelector(".resume-item-sub-title-text").textContent =
          education.institutionName;
        this._educationList.appendChild(itemView);
      });
      this._educationContainer.style.display = "flex";
    } else {
      this._educationContainer.style.display = "none";
    }
  }

  _bindCV(cv) {
    const clonedCV = this._cv.cloneNode(true);

    clonedCV.querySelector(".resume-title").textContent =
      cv.type.id === 0 ? "이력서" : "포트폴리오";
    clonedCV.querySelector(".resume-category-icon").src = cv.thumbnailUrl;

    const action = clonedCV.querySelector(".resume-action-button");
    const isPdf = cv.documentUrl.split(".").pop() === "pdf";

    action.classList.add(isPdf ? "download" : "copy");

    action.addEventListener("click", (event) => {
      if (isPdf) {
        event.preventDefault();
        event.stopPropagation();

        fetch(cv.documentUrl)
          .then((response) => response.blob())
          .then((blob) => {
            const a = document.createElement("a");
            a.href = window.URL.createObjectURL(blob);
            a.download = `${cv.name}.pdf`;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          });
      } else {
        navigator.clipboard.writeText(cv.documentUrl);
      }
    });

    this._cvList.appendChild(clonedCV);

    clonedCV.addEventListener("click", (event) => {
      if (event.target === action) return;

      [...this._cvList.children].forEach((item) => {
        const div = item.querySelector(".resume-list-item-div");
        div.style.borderColor = style.getPropertyValue("--silhouette");
        div.style.borderWidth = "1px";
        div.style.padding = "0 10px";
      });

      const div = clonedCV.querySelector(".resume-list-item-div");
      div.style.borderColor = style.getPropertyValue("--ssgsag-blue");
      div.style.borderWidth = "2px";
      div.style.padding = "0 9px";

      this._iframe.src = cv.documentUrl;
    });
  }

  reset() {
    super.reset();

    this._iframe.src = "";
    this._content.scrollTo(0, 0);
  }
}

const accessToken = localStorage.getItem("accessToken");
const params = new URLSearchParams(location.search);
const applicationId = params.get("applicationId");

if (!accessToken || !applicationId) redirectMain();

fetchLNB();

logScreenView({ screenName: "superpass_keep_matching" });
addLogButtonEventListener();

document.querySelector("#applySuperpass").addEventListener("click", () => {
  location.href = "/home?isApply=true";
});

const basePath = `/superpass/v2/applications/${applicationId}`;

const getPositionStatusBackgroundColor = (status) => {
  switch (status) {
    case 2:
      return "--red20";
    case 3:
      return "--green20";
    default:
      return "--divider";
  }
};

const getPositionStatusText = (status) => {
  switch (status) {
    case 2:
      return "채용 중";
    case 3:
      return "채용 완료";
    default:
      return "";
  }
};

const getStatusBackgroundColor = (status) => {
  switch (status) {
    case 10:
      return "--red20";
    case 20:
    case 30:
      return "--yellow20";
    case 40:
      return "--green20";
    default:
      return "--divider";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 10:
      return "서류 단계";
    case 20:
    case 30:
      return "면접 단계";
    case 40:
      return "최종 합격";
    default:
      return "";
  }
};

const getCancelDisplay = (status) => {
  switch (status) {
    case 10:
    case 20:
    case 30:
      return "block";
    default:
      return "none";
  }
};

// START
const getAcceptText = (status) => {
  switch (status) {
    case 10:
      return "면접 제안";
    case 20:
    case 30:
    case 40:
      return "최종 합격";
    default:
      return "";
  }
};
// EMD

const getAcceptDisplay = (status) => {
  switch (status) {
    case 10:
    case 30:
      return "block";
    default:
      return "none";
  }
};

const getDisabledDisplay = (status) => {
  switch (status) {
    case 20:
    case 40:
      return "block";
    default:
      return "none";
  }
};

const checkboxGroup = new CancelCheckboxGroup(
  document.querySelector("#cancelCheckbox")
);
checkboxGroup.extract = (input, value) => {
  let data = {};

  data.reasonIds = input.reasonIds;
  if (!!value) data.reasonEtcText = value;

  return data;
};
checkboxGroup.replace = (input, value) => {
  input.value = value.substring(0, 100);
};

const cancelForm = new Form(document.querySelector("#cancelForm"), [
  checkboxGroup,
]);

checkboxGroup.onInput = () => {
  cancelForm.isEnabled = checkboxGroup.isValid;
};

const cancelModal = new PromptModal(
  document.querySelector("#cancelModal"),
  cancelForm
);
cancelModal.onClose = () => {
  adjustOverflow();
};

const cancelDoneModal = new AlertModal(
  document.querySelector("#cancelDoneModal")
);

const interviewCheckModal = new ConfirmModal(
  document.querySelector("#interviewCheckModal")
);
const interviewDoneModal = new AlertModal(
  document.querySelector("#interviewDoneModal")
);
const passCheckModal = new ConfirmModal(
  document.querySelector("#passCheckModal")
);
const passDoneModal = new AlertModal(document.querySelector("#passDoneModal"));

let selectedUser = "";
const replaceTitle = (node) => {
  return node.title.replace(/.*님/, `${selectedUser}님`);
};

const cardList = document.querySelector("#cardList");

let cards = [];
[...cardList.children].forEach((child) => {
  const card = new SuperpassCard(child);
  cards.push(card);
});

const resumeSection = new ResumeSection(
  document.querySelector("#resumeSection")
);

const resumeModal = new PromptModal(
  document.querySelector("#resumeModal"),
  resumeSection
);
resumeModal.onClose = () => {
  if (resumeSection._status !== 40) return;
  alert("슈퍼패스 채용이 완료되었습니다.\n마감된 슈퍼패스로 이동합니다.");
  location.href = `/superpass-match-done?applicationId=${applicationId}`;
};

interviewCheckModal.onConfirm = () => {
  adjustOverflow();

  const matchupId = resumeSection.id;
  apiService
    .makeRequest(`${basePath}/matchup/${matchupId}/document-pass`, {
      method: "PUT",
    })
    .then((data) => {
      interviewDoneModal.title = replaceTitle(interviewDoneModal);
      interviewDoneModal.handleShow(true);
      fetchMatch();
      selectMatchup(matchupId);
    })
    .catch((error) => console.error(error));
};
interviewCheckModal.onClose = () => {
  adjustOverflow();
};
interviewDoneModal.onCheck = () => {
  adjustOverflow();
};

passCheckModal.onConfirm = () => {
  adjustOverflow();

  const matchupId = resumeSection.id;
  apiService
    .makeRequest(`${basePath}/matchup/${matchupId}/interview-pass`, {
      method: "PUT",
    })
    .then((data) => {
      passDoneModal.title = replaceTitle(passDoneModal);
      passDoneModal.handleShow(true);
      fetchMatch();
      selectMatchup(matchupId);
    })
    .catch((error) => console.error(error));
};
passCheckModal.onClose = () => {
  adjustOverflow();
};
passDoneModal.onCheck = () => {
  adjustOverflow();
};

const selectMatchup = (matchupId) => {
  apiService
    .makeRequest(`${basePath}/matchup/${matchupId}`, { method: "GET" })
    .then((response) => {
      selectedUser = response.data.applicantName;

      if (response.data.matchupStatus === 12) {
        alert(`${selectedUser}님의 면접 제안 기한이 만료되었습니다.`);
        fetchMatch();
        return;
      }

      if (response.data.matchupStatus == 10) {
        logScreenView({
          screenName: "superpass_keep_matching_detail",
          status: "document",
        });
      }
      if (response.data.matchupStatus == 30) {
        logScreenView({
          screenName: "superpass_keep_matching_detail",
          status: "interview",
        });
      }

      resumeSection.bind(response.data);
      resumeModal.handleShow(true);
    });
};

cancelForm.onSubmit = () => {
  adjustOverflow();

  const matchupId = resumeSection.id;

  if (!cancelForm.isValid && !!matchupId && !!cancelModal.status) return;

  if (cancelModal.status === 10) {
    logButtonClick({
      buttonName: "superpass_matching_detail_fail",
      status: "document",
    });
  }

  if (cancelModal.status === 30) {
    logButtonClick({
      buttonName: "superpass_matching_detail_fail",
      status: "interview",
    });
  }

  const cancelBasePath = basePath + `/matchup/${matchupId}`;
  const endpoint =
    cancelModal.status === 10 ? "/document-reject" : "/interview-reject";

  apiService
    .makeRequest(cancelBasePath + endpoint, {
      method: "PUT",
      body: JSON.stringify(checkboxGroup.value),
    })
    .then((data) => {
      checkboxGroup.matchupId = undefined;
      cancelModal.status = undefined;
      fetchMatch();

      // START
      cancelModal.handleShow(false);
      resumeModal.handleShow(false);

      cancelDoneModal.handleShow(true);
      cancelDoneModal.title = replaceTitle(cancelDoneModal);
      // END
    });
};

const jobs = [
  document.querySelector(".delete-account-title"),
  document.querySelector(".resume-position-text"),
];
const $createdAt = document.querySelector(".resume-apply-date-text");
const $jobGroup = document.querySelector(".text-block-27");
const $status = document.querySelector("#currentStatus");

const fetchMatch = () => {
  apiService
    .makeRequest(basePath)
    .then((response) => {
      const application = response.data.application;
      const matchup = response.data.matchup;
      const statusBackground = getPositionStatusBackgroundColor(
        application.status
      );

      jobs.forEach((job) => (job.textContent = application.job.name));
      $createdAt.textContent = makeDate(application.createdAt, "신청");
      $jobGroup.textContent = application.jobGroup.name;
      $status.textContent = getPositionStatusText(application.status);
      $status.style.backgroundColor = style.getPropertyValue(statusBackground);

      cards.forEach((card) => card.reset());

      matchup.forEach((data) => {
        cards[data.slot].bind(data);
        cards[data.slot].onClick = (model) => selectMatchup(model.matchupId);
      });
    })
    .catch((error) => console.error(error));
};

fetchMatch();
Webflow.push(() => {
  document.querySelector("#navigationSuperpass").classList.add("w--current");
});
