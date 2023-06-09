class CheckboxGroup extends RegexInput {
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
    this._name = element.querySelector(".text-block-36");

    this._academic = element.querySelectorAll(".match-card-contents-text")[0];
    this._position = element.querySelectorAll(".match-card-contents-text")[1];

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

    this._academic.textContent = model.academicRecord.status.name;
    if (model.academicRecord.status.id !== 0) {
      this._academic.textContent += ` (${model.academicRecord.grade}학년/${model.academicRecord.semester}학기)`;
    }

    const [firstJob, ...restJobs] = model.preferJobs;
    this._position.textContent = restJobs.reduce(
      (jobs, job) => `${jobs} / ${job}`,
      firstJob
    );

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

    this._cvList = element.querySelector(".match-card-portfolio-div");
    this._cv = element.querySelector(".match-card-portfolio");
  }

  bind(model) {
    super.bind(model);

    this._empty.style.display = "none";
    this._card.style.display = "flex";

    this._newBadge.style.display = model.isNew ? "block" : "none";

    removeAllChildren(this._cvList);
    model.documents.forEach((cv) => {
      const clonedCV = this._cv.cloneNode(true);
      clonedCV.src = cv.thumbnailUrl;
      this._cvList.appendChild(clonedCV);
    });

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

    this._resumeList = element.querySelectorAll(".list-3")[0];
    this._portfolioList = element.querySelectorAll(".list-3")[1];
    this._cv = element.querySelectorAll(".resume-list-item")[0];

    this._cancel = element.querySelector(".resume-button-negative");
    this._accept = element.querySelector(".resume-button-positive");
    this._disabled = element.querySelector(".resume-button-disabled");
  }

  bind(model) {
    super.bind(model);

    removeAllChildren(this._resumeList);
    removeAllChildren(this._portfolioList);
    model.documents.forEach((cv) => this._bindCV(cv));
    Webflow.require("ix2").init();
    [...this._resumeList.children][0].click();

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
  }

  _bindCV(cv) {
    const clonedCV = this._cv.cloneNode(true);

    clonedCV.querySelector(".resume-title").textContent = cv.name;
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

    if (cv.type.id === 0) this._resumeList.appendChild(clonedCV);
    else if (cv.type.id === 1) this._portfolioList.appendChild(clonedCV);

    clonedCV.addEventListener("click", (event) => {
      if (event.target === action) return;

      const list = [
        ...this._resumeList.children,
        ...this._portfolioList.children,
      ];

      list.forEach((item) => {
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

    const isPortfolioEmpty = this._portfolioList.children.length === 0;
    this._element.querySelectorAll(
      ".match-card-contents-title"
    )[1].style.display = isPortfolioEmpty ? "none" : "flex";
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

const removeAllChildren = (node) => {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
};

const checkboxGroup = new CheckboxGroup(
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
