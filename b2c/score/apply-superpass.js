class ProfileInput extends Input {
  constructor(element) {
    super(element);

    this._name = new RegexInput(element.querySelector("#name"));
    this._name.key = "name";
    this._name.regexMessage = "* 2~30자 이내로 입력해주세요.";
    this._name.regex = /^.{2,30}$/;

    this._email = new RegexInput(element.querySelector("#email"));
    this._email.key = "email";
    this._email.regex = regex.email;
    this._email.regexMessage = "* 올바른 이메일을 입력해주세요.";

    this._contact = new RegexInput(element.querySelector("#contact"));
    this._contact.key = "contact";
    this._contact.regex = regex.phoneNumber;
    this._contact.regexMessage = "* 올바른 전화번호를 입력해주세요.";
    this._contact.extract = (_, value) => {
      return value.replace(/-/g, "");
    };
    this._contact.replace = (input, value) => {
      input.value = value
        .replace(/[^0-9]/g, "")
        .substring(0, 11)
        .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
    };
  }

  validate() {
    this._name.validate();
    this._email.validate();
    this._contact.validate();
  }

  get data() {
    let data = {};

    data[this._name.key] = this._name.value;
    data[this._email.key] = this._email.value;
    data[this._contact.key] = this._contact.value;

    return data;
  }

  get isValid() {
    return this._name.isValid && this._email.isValid && this._contact.isValid;
  }
}

class AcademicInput extends Input {
  graduates = [
    { id: 0, name: "졸업" },
    { id: 1, name: "재학" },
    { id: 2, name: "휴학" },
    { id: 3, name: "유예" },
  ];

  grades = [
    { id: 1, name: "1학년" },
    { id: 2, name: "2학년" },
    { id: 3, name: "3학년" },
    { id: 4, name: "4학년" },
    { id: 5, name: "5학년" },
  ];

  semesters = [
    { id: 1, name: "1학기" },
    { id: 2, name: "2학기" },
  ];

  stdScores = [
    { id: 1, name: "4.5" },
    { id: 2, name: "4.3" },
    { id: 3, name: "4.0" },
  ];

  years = undefined;

  months = [
    { id: 2, name: "2월" },
    { id: 8, name: "8월" },
  ];

  constructor(element) {
    super(element);

    const currentYear = new Date().getFullYear();
    this.years = Array.from({ length: 21 }, (_, index) => {
      const year = currentYear - 10 + index;
      return { id: year, name: year };
    });

    this._university = new Input(element.querySelector("#university"));
    this._university.key = "university";

    this._major = new Input(element.querySelector("#major"));
    this._major.key = "major";

    this._avgScore = new RegexInput(element.querySelector("#avgScore"));
    this._avgScore.key = "avgScore";
    this._avgScore.regexMessage = "* 학점을 올바르게 입력해주세요.";
    this._avgScore.regex = /^[0-9](\.[0-9]{1,2})?$/;
    this._avgScore.replace = (input, value) => {
      input.value = value
        .replace(/[^0-9]/g, "")
        .substring(0, 3)
        .replace(/^(\d{1})(\d{1,2})$/, `$1.$2`);
    };

    this._stdScore = new Dropdown(element.querySelector("#stdScore"));
    this._stdScore.key = "stdScore";
    this._stdScore.bind(this.stdScores);

    this._graduate = new Dropdown(element.querySelector("#graduate"));
    this._graduate.key = "graduate";
    this._graduate.bind(this.graduates);
    this._graduate._input.addEventListener("input", () => {
      const isGraduated = this._graduate.value === 0;
      this._graduate.isConditioned = isGraduated;
      this._grade._input.required = !isGraduated;
      this._semester._input.required = !isGraduated;
    });

    this._semester = new ConditionedDropdown(
      element.querySelector("#semester"),
      this._graduate
    );
    this._semester.key = "semester";
    this._semester.bind(this.semesters);
    this._semester.onReset = () => {
      this._semester.bind(this.semesters);
    };

    this._grade = new ConditionedDropdown(
      element.querySelector("#grade"),
      this._graduate
    );
    this._grade.key = "grade";
    this._grade.bind(this.grades);
    this._grade.onReset = () => {
      this._grade.bind(this.grades);
    };

    this._year = new Dropdown(element.querySelector("#year"));
    this._year.key = "year";
    this._year.bind(this.years);

    this._month = new Dropdown(element.querySelector("#month"));
    this._month.key = "month";
    this._month.bind(this.months);
  }

  validate() {
    this._university.validate();
    this._major.validate();

    this._stdScore.validate();
    this._avgScore.validate();

    if (!this._avgScore.isValid) {
      this._avgScore.validate();
      this._avgScore._error.textContent = "";
    } else if (
      Number(this._avgScore.value) == 0 ||
      Number(
        this.stdScores.find((score) => score.id == this._stdScore.value).name
      ) < Number(this._avgScore.value)
    ) {
      this._avgScore._error.textContent = "* 학점을 올바르게 입력해주세요.";
      this._avgScore.updateValidity(false);
    }

    this._graduate.validate();
    this._semester.validate();
    this._grade.validate();
    this._year.validate();
    this._month.validate();
  }

  get data() {
    let data = {};

    data[this._university.key] = this._university.value;
    data[this._major.key] = this._major.value;
    data[this._avgScore.key] = this._avgScore.value;
    data[this._stdScore.key] = this.stdScores.find(
      (score) => score.id == this._stdScore.value
    ).name;
    data[this._graduate.key] = this._graduate.value;
    data[this._grade.key] = this._grade.value;
    data[this._semester.key] = this._semester.value;
    data[this._year.key] = this._year.value;
    data[this._month.key] = this._month.value;

    return data;
  }

  get isValid() {
    return (
      this._university.isValid &&
      this._major.isValid &&
      this._avgScore.isValid &&
      this._stdScore.isValid &&
      Number(
        this.stdScores.find((score) => score.id == this._stdScore.value).name
      ) >= Number(this._avgScore.value) &&
      this._graduate.isValid &&
      this._grade.isValid &&
      this._semester.isValid &&
      this._year.isValid &&
      this._month.isValid
    );
  }
}

class AppealKeywordInput extends Input {
  keywords = [
    { id: 1, name: "창의적인" },
    { id: 2, name: "도전적인" },
    { id: 3, name: "적응 빠른" },
    { id: 4, name: "책임감 있는" },
    { id: 5, name: "논리적인" },
    { id: 6, name: "실행 빠른" },
    { id: 7, name: "소통에 능한" },
    { id: 8, name: "꼼꼼한" },
    { id: 9, name: "리더십 갖춘" },
    { id: 10, name: "팔로워십 갖춘" },
  ];
  constructor(element) {
    super(element);

    this._keyword = new CheckboxGroup(element.querySelector("#keyword"));
    this._keyword.key = "appealKeywords";
    this._keyword.maxCount = 2;
    this._keyword.bind(this.keywords);
  }

  get isValid() {
    return this._keyword.count == 2;
  }

  validate() {
    this._error.textContent = "* 2개 필수로 선택해주세요.";
    this._keyword.updateValidity(this.isValid);
  }

  updateValidity(isValid) {
    this._showError(isValid);

    this._input.style.borderColor = isValid
      ? style.getPropertyValue("--disabled")
      : style.getPropertyValue("--red");
  }

  _showError(isValid) {
    this._error.style.display = isValid ? "none" : "block";
  }

  get data() {
    return this._keyword.value.appealKeywords;
  }
}

class ProjectInput extends Input {
  projectCategories = [
    { id: 1, name: "경력" },
    { id: 2, name: "동아리/학회" },
    { id: 3, name: "대외활동" },
    { id: 4, name: "봉사활동" },
    { id: 5, name: "프로젝트" },
    { id: 6, name: "수강" },
    { id: 100, name: "기타" },
  ];

  constructor(element) {
    super(element);

    this._category = new Dropdown(element.querySelector("#projectCategory"));
    this._category.bind(this.projectCategories);

    this._name = new RegexInput(element.querySelector("#projectName"));
    this._name.regex = /^.{1,18}$/;

    this._role = new Input(element.querySelector("#projectRole"));

    this._startDate = new Input(element.querySelector("#projectStartDate"));
    this._startDate.key = "projectStartDate";
    this._startDate._input.readOnly = true;

    this._endDate = new Input(element.querySelector("#projectEndDate"));
    this._endDate.key = "projectEndDate";
    this._endDate._input.readOnly = true;

    this.$projectStartDate = $("#projectStartDate #Date").datepicker({
      language: "ko-KR",
      format: "yyyy.mm",
      autoHide: true,
      pick: () => {
        this._startDate.updateValidity(true);
      },
    });

    this.$projectEndDate = $("#projectEndDate #Date").datepicker({
      language: "ko-KR",
      format: "yyyy.mm",
      autoHide: true,
      pick: () => {
        this._endDate.updateValidity(true);
      },
    });

    this._add = element.querySelector("#projectAdd");
    this._add.addEventListener("click", () => this._addProject());

    this._divider = element.querySelector("#projectDivider");

    this._projectList = element.querySelector("#projectList");
    this._project = element.querySelector("#project");

    removeAllChildren(this._projectList);
    this._updateDivider();
  }

  _addProject() {
    if ([...this._projectList.childNodes].length == 3) {
      return;
    }

    let isInvalid = false;
    if (!this._category.isValid) {
      this._category.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._name.isValid) {
      this._name.validate();
      this._name._error.textContent = "* 18자 이내로 입력해주세요.";
      isInvalid = isInvalid | true;
    }

    if (!this._role.isValid) {
      this._role.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._startDate.isValid) {
      this._startDate.validate();
      this._startDate._error.textContent = "";
      isInvalid = isInvalid | true;
    } else {
      const date = new Date();
      const currentYearMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const startDateValid =
        this.$projectStartDate.datepicker("getDate") > currentYearMonth;
      isInvalid = isInvalid | startDateValid;
      this._startDate._error.textContent =
        "* 시작일은 현재 이전의 날짜를 입력해주세요.";
      this._startDate.updateValidity(!startDateValid);
    }

    if (!this._endDate.isValid) {
      this._endDate.validate();
      this._endDate._error.textContent = "";
      isInvalid = isInvalid | true;
    } else {
      const endDateValid =
        this.$projectStartDate.datepicker("getDate") >
        this.$projectEndDate.datepicker("getDate");
      isInvalid = isInvalid | endDateValid;
      this._endDate._error.textContent = "* 시작일 이후 날짜를 입력해주세요.";
      this._endDate.updateValidity(!endDateValid);
    }

    if (isInvalid) return;

    const projectCategory = this.projectCategories.find(
      (category) => this._category.value == category.id
    );

    let data = {
      name: this._name.value,
      category: projectCategory,
      role: this._role.value,
      startDate: this._startDate.value,
      endDate: this._endDate.value,
    };

    const project = this._project.cloneNode(true);
    project.setAttribute("data", JSON.stringify(data));

    const name = project.querySelector("#name");
    name.textContent = data.name;

    const category = project.querySelector("#category");
    category.textContent = data.category.name;

    const role = project.querySelector("#role");
    role.textContent = data.role;

    const startDate = project.querySelector("#startDate");
    startDate.textContent = data.startDate;

    const endDate = project.querySelector("#endDate");
    endDate.textContent = data.endDate;

    project.querySelector("#delete").addEventListener("click", () => {
      this._projectList.removeChild(project);
      this._updateDivider();

      this._add.style.backgroundColor = "";
      this._add.style.cursor = "pointer";
    });

    this._projectList.appendChild(project);

    if ([...this._projectList.childNodes].length == 3) {
      this._add.style.backgroundColor = "#CCCCCC";
      this._add.style.cursor = "default";
    }

    this._category.reset();
    this._category.bind(this.projectCategories);

    this._name.reset();
    this._role.reset();

    this._startDate.reset();
    this._endDate.reset();

    this._updateDivider();
    this._input.dispatchEvent(this.inputEvent);
  }

  get count() {
    return this._projectList.children.length;
  }

  get isValid() {
    return this.count > 0;
  }

  validate() {
    if (!this.isValid) {
      this._category.validate();
      this._name.validate();
      this._role.validate();
      this._startDate.validate();
      this._startDate._error.textContent =
        "* 대표 프로젝트를 1개 이상 입력해주세요.";
      this._startDate._showError(false);
      this._endDate.validate();
      this._endDate._error.textContent = "";
    }
  }

  _updateDivider() {
    this._divider.style.display = this._projectList.hasChildNodes()
      ? "flex"
      : "none";
  }

  get data() {
    let data = [...this._projectList.childNodes].map((element) =>
      JSON.parse(element.getAttribute("data"))
    );

    return data;
  }
}

class WorkConditionInput extends Input {
  types = [
    { id: 2, name: "신입" },
    { id: 1, name: "인턴" },
  ];
  regions = [
    { id: 1, name: "서울" },
    { id: 2, name: "경기" },
  ];
  constructor(element) {
    super(element);

    this._type = new CheckboxGroup(element.querySelector("#type"));
    this._type.key = "recruitmentTypeGroups";
    this._type.bind(this.types);

    this._region = new CheckboxGroup(element.querySelector("#region"));
    this._region.key = "regionIds";
    this._region.bind(this.regions);

    this._date = new Input(element.querySelector("#date"));
    this._date.key = "workStart";
    this._date._input.readOnly = true;

    const $workStartDate = $("#date #Date");

    $workStartDate.datepicker({
      language: "ko-KR",
      format: "yyyy.mm.dd",
      autoHide: true,
      pick: () => {
        this._date.updateValidity(true);
      },
    });

    this._additional = new RegexInput(element.querySelector("#additional"));
    this._additional.key = "additional";
    this._additional.replace = (input, value) => {
      input.value = value.substring(0, 100);
    };
    this._additional.regex = /^(.|\n|\r|\t|\s){0,100}$/;
  }

  get isValid() {
    return this._type.isValid && this._region.isValid && this._date.isValid;
  }

  validate() {
    this._type.validate();
    this._region.validate();
    this._date.validate();
  }

  get data() {
    let data = {
      recruitmentTypeGroups: this._type.value[this._type.key],
      regionIds: this._region.value[this._region.key],
      workStart: this._date.value,
      additional: this._additional.value,
    };

    return data;
  }
}

const $profile = document.querySelector("#profile");
const $academic = document.querySelector("#academic");
const $information = document.querySelector("#information");
const $condition = document.querySelector("#condition");

const $percentage = document.querySelector(".percentage");
const $inprogress = document.querySelector(".inprogress");
const $progress = document.querySelector(".progress");

const $submitButton = document.querySelector(".submit-button");

const profile = new ProfileInput($profile);
profile.key = "profile";

const academic = new AcademicInput($academic);
academic.key = "academic";

const appealKeyword = new AppealKeywordInput(
  $information.querySelector(".appealkeyword-section")
);
appealKeyword.key = "appealKeyword";

const requirementSkills = new SkillSearch(
  $information.querySelector("#requirementSkills")
);
requirementSkills.key = "requirementSkills";

const project = new ProjectInput(
  $information.querySelector(".project-section")
);
project.key = "project";

const workConditition = new WorkConditionInput($condition);
workConditition.key = "workConditition";

const term = new Checkbox(document.querySelector("#term"));

let current = "profile";

const handleNext = (from) => {
  switch (from) {
    case "profile":
      profile.validate();
      if (!profile.isValid) {
        applyErrorModal.handleShow(true);
        return;
      }

      $profile.style.display = "none";
      $academic.style.display = "block";
      current = "academic";

      $percentage.textContent = "40%";
      $inprogress.style.flex = "2 auto";
      $progress.style.flex = "2 auto";
      break;
    case "academic":
      academic.validate();
      if (!academic.isValid) {
        applyErrorModal.handleShow(true);
        return;
      }

      $academic.style.display = "none";
      $information.style.display = "block";
      current = "information";

      $percentage.textContent = "60%";
      $inprogress.style.flex = "3 auto";
      $progress.style.flex = "1 auto";
      break;
    case "information":
      appealKeyword.validate();
      requirementSkills.validate();
      project.validate();

      const isValid = appealKeyword.isValid &&
        requirementSkills.isValid &&
        project.isValid;
      if (!isValid) {
        applyErrorModal.handleShow(true);
        return;
      }

      $information.style.display = "none";
      $condition.style.display = "block";
      current = "condition";

      $percentage.textContent = "80%";
      $inprogress.style.flex = "4 auto";
      $progress.style.flex = "0 auto";
      $submitButton.textContent = "제출하기";
      break;
    case "condition":
      workConditition.validate();
      term.validate();
      if (!workConditition.isValid || !term.isValid) {
        applyErrorModal.handleShow(true);
        return;
      }

      applyCheckModal.handleShow(true);
      break;
  }

  document.documentElement.scrollTo(0, 0);
}

// NOTE: View
const params = new URLSearchParams(location.search);
const documentReviewId = params.get("documentReviewId");

const makeData = (documentReviewId) => {
  const data = {
    documentReviewId: documentReviewId,
    personalInfo: profile.data,
    educationInfo: academic.data,
    repKeywordIds: appealKeyword.data,
    repProjects: project.data,
    skills: requirementSkills.value,
    workCondition: workConditition.data,
    term: term.value,
  };

  return JSON.stringify(data);
};

const applyCheckModal = new ConfirmModal(
  document.querySelector("#applyCheckModal")
);
applyCheckModal.onConfirm = () => {
  adjustOverflow();

  apiService
    .makeRequest("/superpass/v2/apply-seeker-from-review", {
      method: "POST",
      body: makeData(documentReviewId),
    })
    .then(() => {
      applyCheckModal.handleShow(false);
      applyDoneModal.handleShow(true);
    })
    .catch((error) => console.error(error));
};

const applyDoneModal = new AlertModal(
  document.querySelector("#applyDoneModal")
);
applyDoneModal.onCheck = () => {
  location.href = "/matches";
};

const applyErrorModal = new AlertModal(
  document.querySelector("#applyErrorModal")
);

const applyInvalidModal = new AlertModal(
  document.querySelector("#applyInvalidModal")
);

$submitButton.addEventListener("click", () => {
  handleNext(current);
});

const login = () => {
  localStorage.setItem("loginUrl", location.href);
  location.href = "/signup"
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

if (!accessToken) {
  kakaoSigninModal.handleShow(true);
} else if (!documentReviewId) {
  applyInvalidModal.onCheck = () => {
    location.href = "/score";
  };
  applyInvalidModal.handleShow(true);
} else {
  apiService
    .makeRequest("/superpass/v2/apply-seeker", {
      method: "GET",
    })
    .then((response) => {
      if (response.data === null) {
        apiService
          .makeRequest("/superpass/v2/document-review")
          .then((response) => {
            if (response.data === null) {
              applyInvalidModal.onCheck = () => {
                location.href = "/score";
              };
              applyInvalidModal.handleShow(true);
            } else if (response.data.totalScore.percentage > 40) {
              applyInvalidModal.onCheck = () => {
                location.href = "/score-result";
              };
              applyInvalidModal.handleShow(true);
            } else {
              return;
            }
          })
          .catch((error) => console.error(error));
      } else {
        applyInvalidModal.onCheck = () => {
          location.href = "/matches";
        };
        applyInvalidModal.handleShow(true);
      }
    })
    .catch((error) => console.error(error));
}
