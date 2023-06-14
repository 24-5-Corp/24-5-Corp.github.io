class ProfileInput extends Input {
  constructor(element) {
    super(element);

    this._name = new RegexInput(element.querySelector("#name"));
    this._name.key = "name";
    this._name.regexMessage = name.message;
    this._name.regex = /^.{2,30}$/;

    this._email = new RegexInput(element.querySelector("#email"));
    this._email.key = "email";
    this._email.regex = regex.email;
    this._email.regexMessage = "올바른 이메일을 입력해주세요.";

    this._contact = new RegexInput(element.querySelector("#contact"));
    this._contact.key = "contact";
    this._contact.regex = regex.phoneNumber;
    this._contact.regexMessage = "올바른 전화번호를 입력해주세요.";
    this._contact.extract = (input, value) => {
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

    this._avgScore = new Input(element.querySelector("#avgScore"));
    this._avgScore.key = "avgScore";
    this._avgScore.message = "";

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

class ResumeInput extends Input {
  categories = [
    { id: 0, name: "이력서" },
    { id: 1, name: "포트폴리오" },
  ];

  constructor(element) {
    super(element);

    this._error = element.querySelector(".error-text");

    this._category = new Dropdown(element.querySelector("#category"));
    this._category.bind(this.categories);

    this._url = new RegexInput(element.querySelector("#url"));
    this._url.key = "";
    this._url.regex = regex.website;
    this._url.regexMessage = "";

    this._add = element.querySelector("#add");
    this._add.addEventListener("click", () => this._addResume());

    this._divider = element.querySelector("#divider");

    this._resumeList = element.querySelector("#resumeList");
    this._resume = element.querySelector("#resume");

    removeAllChildren(this._resumeList);
    this._updateDivider();
  }

  get value() {
    let data = {
      resumes: [],
      portfolios: [],
    };

    for (const resume of this._resumeList.childNodes) {
      const value = resume.querySelector("#url").textContent;

      if (resume.querySelector("#category").value === 0) {
        data.resumes.push(value);
      } else {
        data.portfolios.push(value);
      }
    }

    //if (data.resumes.length === 0 && data.portfolios.length === 0) return;
    return data;
  }

  reset() {
    removeAllChildren(this._resumeList);

    this.value = undefined;

    this.category.value = "";
    super.reset();
  }

  get isValid() {
    return [...this._resumeList.children].some(
      (child) => child.querySelector("#category").value === 0
    );
  }

  validate() {
    this._error.textContent = "* 이력서는 필수 항목입니다.";
    super.validate();
  }

  _updateDivider() {
    this._divider.style.display = this._resumeList.hasChildNodes()
      ? "flex"
      : "none";
  }

  _addResume() {
    if (!this._category.isValid) {
      this._category.validate();
      this._error.textContent = "* 구분, URL 값을 다시 한 번 확인해주세요.";
      this.updateValidity(false);

      return;
    }

    if (!this._url.isValid) {
      this._url.validate();
      this._error.textContent = "* 구분, URL 값을 다시 한 번 확인해주세요.";
      this.updateValidity(false);
      return;
    }

    apiService
      .makeRequest(`/util/resume-check?url=${this._url.value}`)
      .then(() => {
        const resume = this._resume.cloneNode(true);
        const category = resume.querySelector("#category");
        category.value = this._category.value;
        category.textContent = this.categories[category.value].name;
        resume.querySelector("#url").textContent = this._url.value;
        resume.querySelector("#delete").addEventListener("click", () => {
          this._resumeList.removeChild(resume);
          this._updateDivider();
        });

        this._resumeList.appendChild(resume);

        this._category.reset();
        this._category.bind(this.categories);
        this._url.reset();

        this._updateDivider();
        this._input.dispatchEvent(this.inputEvent);
      })
      .catch((error) => {
        this._error.textContent = `* ${error.message}`;
        this.updateValidity(false);
        this._url.updateValidity(false);
      });
  }

  updateValidity(isValid) {
    this._showError(isValid);
  }
}

class AwardInput extends Input {
  constructor(element) {
    super(element);

    this._program = new Input(element.querySelector("#awardProgram"));
    this._prize = new Input(element.querySelector("#awardPrize"));
    this._host = new Input(element.querySelector("#awardHost"));

    this._date = new Input(element.querySelector("#awardDate"));
    this._date.key = "awardDate";
    this._date._input.readOnly = true;

    this.$awardDate = $("#awardDate #Date").datepicker({
      language: "ko-KR",
      format: "yyyy.mm",
      autoHide: true,
      pick: () => {
        this._date.updateValidity(true);
      },
    });

    this._add = element.querySelector("#add");
    this._add.addEventListener("click", () => this._addAward());

    this._divider = element.querySelector("#divider");

    this._awardList = element.querySelector("#awardList");
    this._award = element.querySelector("#award");

    removeAllChildren(this._awardList);
    this._updateDivider();

    this.$expandableContent = element.querySelector(".expendable-content");
    this.$expend = element.querySelector("#expend");
    this.$expend.addEventListener("click", () => {
      this.$expend.style.display = "none";
      this.$expandableContent.style.display = "flex";
    });
  }

  get isValid() {
    return true;
  }

  validate() {}

  _addAward() {
    let isInvalid = false;
    if (!this._program.isValid) {
      this._program.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._prize.isValid) {
      this._prize.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._date.isValid) {
      this._date.validate();
      this._date._error.textContent = "";
      isInvalid = isInvalid | true;
    } else {
      const date = new Date();
      const currentYearMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const awardDateValid =
        this.$awardDate.datepicker("getDate") > currentYearMonth;
      this._date._error.textContent = "* 현재 이전의 날짜를 입력해주세요.";
      isInvalid = isInvalid | awardDateValid;
      this._date.updateValidity(!awardDateValid);
    }

    if (isInvalid) return;

    let data = {
      program: this._program.value,
      prize: this._prize.value,
      host: this._host.value,
      date: this._date.value,
    };

    const award = this._award.cloneNode(true);
    award.setAttribute("data", JSON.stringify(data));

    const program = award.querySelector("#program");
    program.textContent = data.program;

    const prize = award.querySelector("#prize");
    prize.textContent = data.prize;

    const host = award.querySelector("#host");
    host.textContent = data.host;

    if (!data.host) {
      award.querySelector("#seperater").style.display = "none";
    }

    const awardDate = award.querySelector("#awardDate");
    awardDate.textContent = data.date;

    award.querySelector("#delete").addEventListener("click", () => {
      this._awardList.removeChild(award);
      this._updateDivider();
    });

    this._awardList.appendChild(award);

    this._program.reset();
    this._prize.reset();
    this._host.reset();
    this._date.reset();

    this._updateDivider();
    this._input.dispatchEvent(this.inputEvent);
  }

  _updateDivider() {
    this._divider.style.display = this._awardList.hasChildNodes()
      ? "flex"
      : "none";
  }

  get data() {
    let data = [...this._awardList.childNodes].map((element) =>
      JSON.parse(element.getAttribute("data"))
    );

    return data;
  }
}

class CertificateInput extends Input {
  constructor(element) {
    super(element);

    this._name = new Input(element.querySelector("#certName"));
    this._issuer = new Input(element.querySelector("#certIssuer"));
    this._grade = new Input(element.querySelector("#certGrade"));

    this._date = new Input(element.querySelector("#certDate"));
    this._date.key = "certDate";
    this._date._input.readOnly = true;

    this.$certDate = $("#certDate #Date").datepicker({
      language: "ko-KR",
      format: "yyyy.mm",
      autoHide: true,
      pick: () => {
        this._date.updateValidity(true);
      },
    });

    this._add = element.querySelector("#add");
    this._add.addEventListener("click", () => this._addCertificate());

    this._divider = element.querySelector("#divider");

    this._certificateList = element.querySelector("#certificateList");
    this._certificate = element.querySelector("#certificate");

    removeAllChildren(this._certificateList);
    this._updateDivider();

    this.$expandableContent = element.querySelector(".expendable-content");
    this.$expend = element.querySelector("#expend");
    this.$expend.addEventListener("click", () => {
      this.$expend.style.display = "none";
      this.$expandableContent.style.display = "flex";
    });
  }

  get isValid() {
    return true;
  }

  validate() {}

  _addCertificate() {
    let isInvalid = false;

    if (!this._name.isValid) {
      this._name.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._issuer.isValid) {
      this._issuer.validate();
      isInvalid = isInvalid | true;
    }
    if (!this._grade.isValid) {
      this._grade.validate();
      isInvalid = isInvalid | true;
    }
    if (!this._date.isValid) {
      this._date.validate();
      this._date._error.textContent = "";
      isInvalid = isInvalid | true;
    } else {
      const date = new Date();
      const currentYearMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const certDateValid =
        this.$certDate.datepicker("getDate") > currentYearMonth;

      isInvalid = isInvalid | certDateValid;
      this._date._error.textContent = "* 현재 이전의 날짜를 입력해주세요.";
      this._date.updateValidity(!certDateValid);
    }

    if (isInvalid) return;

    let data = {
      name: this._name.value,
      issuer: this._issuer.value,
      grade: this._grade.value,
      date: this._date.value,
    };

    const certificate = this._certificate.cloneNode(true);
    certificate.setAttribute("data", JSON.stringify(data));

    const name = certificate.querySelector("#name");
    name.textContent = data.name;

    const issuer = certificate.querySelector("#issuer");
    issuer.textContent = data.issuer;

    const grade = certificate.querySelector("#grade");
    grade.textContent = data.grade;

    const date = certificate.querySelector("#date");
    date.textContent = data.date;

    certificate.querySelector("#delete").addEventListener("click", () => {
      this._certificateList.removeChild(certificate);
      this._updateDivider();
    });

    this._certificateList.appendChild(certificate);

    this._name.reset();
    this._issuer.reset();
    this._grade.reset();
    this._date.reset();

    this._updateDivider();
    this._input.dispatchEvent(this.inputEvent);
  }

  _updateDivider() {
    this._divider.style.display = this._certificateList.hasChildNodes()
      ? "flex"
      : "none";
  }

  get data() {
    let data = [...this._certificateList.childNodes].map((element) =>
      JSON.parse(element.getAttribute("data"))
    );

    return data;
  }
}

class LanguageTestInput extends Input {
  constructor(element) {
    super(element);

    this._language = new Input(element.querySelector("#language"));
    this._name = new Input(element.querySelector("#name"));
    this._grade = new Input(element.querySelector("#grade"));

    this._date = new Input(element.querySelector("#testDate"));
    this._date.key = "date";
    this._date._input.readOnly = true;

    this.$testDate = $("#testDate #Date").datepicker({
      language: "ko-KR",
      format: "yyyy.mm",
      autoHide: true,
      pick: () => {
        this._date.updateValidity(true);
      },
    });

    this._add = element.querySelector("#add");
    this._add.addEventListener("click", () => this._addLanguageTest());

    this._divider = element.querySelector("#divider");

    this._languageTestList = element.querySelector("#languageTestList");
    this._languageTest = element.querySelector("#languageTest");

    removeAllChildren(this._languageTestList);
    this._updateDivider();

    this.$expandableContent = element.querySelector(".expendable-content");
    this.$expend = element.querySelector("#expend");
    this.$expend.addEventListener("click", () => {
      this.$expend.style.display = "none";
      this.$expandableContent.style.display = "flex";
    });
  }

  get isValid() {
    return true;
  }

  validate() {}

  _addLanguageTest() {
    let isInvalid = false;
    if (!this._language.isValid) {
      this._language.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._name.isValid) {
      this._name.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._grade.isValid) {
      this._grade.validate();
      isInvalid = isInvalid | true;
    }
    if (!this._date.isValid) {
      this._date.validate();
      this._date._error.textContent = "";
      isInvalid = isInvalid | true;
    } else {
      const date = new Date();
      const currentYearMonth = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      const testDateValid =
        this.$testDate.datepicker("getDate") > currentYearMonth;
      isInvalid = isInvalid | testDateValid;
      this._date._error.textContent = "* 현재 이전의 날짜를 입력해주세요.";
      this._date.updateValidity(!testDateValid);
    }

    if (isInvalid) return;

    let data = {
      language: this._language.value,
      name: this._name.value,
      grade: this._grade.value,
      date: this._date.value,
    };

    const languageTest = this._languageTest.cloneNode(true);
    languageTest.setAttribute("data", JSON.stringify(data));

    const language = languageTest.querySelector("#language");
    language.textContent = data.language;

    const name = languageTest.querySelector("#name");
    name.textContent = data.name;

    const grade = languageTest.querySelector("#grade");
    grade.textContent = data.grade;

    const date = languageTest.querySelector("#date");
    date.textContent = data.date;

    languageTest.querySelector("#delete").addEventListener("click", () => {
      this._languageTestList.removeChild(languageTest);
      this._updateDivider();
    });

    this._languageTestList.appendChild(languageTest);

    this._language.reset();
    this._name.reset();
    this._grade.reset();
    this._date.reset();

    this._updateDivider();
    this._input.dispatchEvent(this.inputEvent);
  }

  _updateDivider() {
    this._divider.style.display = this._languageTestList.hasChildNodes()
      ? "flex"
      : "none";
  }

  get data() {
    let data = [...this._languageTestList.childNodes].map((element) =>
      JSON.parse(element.getAttribute("data"))
    );

    return data;
  }
}

class LanguageAbilityInput extends Input {
  grades = [
    { id: 0, proficiency: "beginner", name: "초급" },
    { id: 1, proficiency: "novice", name: "중급(업무상 의사소통 가능)" },
    {
      id: 2,
      proficiency: "intermediate",
      name: "중상급(업무상 원활한 의사소통)",
    },
    { id: 3, proficiency: "advanced", name: "고급(자유자재의 의사소통)" },
    { id: 4, proficiency: "native", name: "원어민 수준" },
  ];
  constructor(element) {
    super(element);

    this._language = new Input(element.querySelector("#language"));
    this._grade = new Dropdown(element.querySelector("#grade"));
    this._grade.bind(this.grades);

    this._add = element.querySelector("#add");
    this._add.addEventListener("click", () => this._addLanguageAbilityList());

    this._divider = element.querySelector("#divider");

    this._languageAbilityList = element.querySelector("#languageAbilityList");
    this._languageAbility = element.querySelector("#languageAbility");

    removeAllChildren(this._languageAbilityList);
    this._updateDivider();

    this.$expandableContent = element.querySelector(".expendable-content");
    this.$expend = element.querySelector("#expend");
    this.$expend.addEventListener("click", () => {
      this.$expend.style.display = "none";
      this.$expandableContent.style.display = "flex";
    });
  }

  get isValid() {
    return true;
  }

  validate() {}

  _addLanguageAbilityList() {
    let isInvalid = false;

    if (!this._language.isValid) {
      this._language.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._grade.isValid) {
      this._grade.validate();
      isInvalid = isInvalid | true;
    }

    if (isInvalid) return;

    const languageGrade = this.grades.find(
      (grade) => this._grade.value == grade.id
    );

    let data = {
      language: this._language.value,
      grade: languageGrade,
    };

    const languageAbility = this._languageAbility.cloneNode(true);
    languageAbility.setAttribute("data", JSON.stringify(data));

    const language = languageAbility.querySelector("#language");
    language.textContent = data.language;

    const grade = languageAbility.querySelector("#grade");
    grade.textContent = data.grade.name;

    languageAbility.querySelector("#delete").addEventListener("click", () => {
      this._languageAbilityList.removeChild(languageAbility);
      this._updateDivider();
    });

    this._languageAbilityList.appendChild(languageAbility);

    this._language.reset();
    this._grade.reset();
    this._grade.bind(this.grades);

    this._updateDivider();
    this._input.dispatchEvent(this.inputEvent);
  }

  _updateDivider() {
    this._divider.style.display = this._languageAbilityList.hasChildNodes()
      ? "flex"
      : "none";
  }

  get data() {
    let data = [...this._languageAbilityList.childNodes].map((element) =>
      JSON.parse(element.getAttribute("data"))
    );

    return data;
  }
}

class EducationInput extends Input {
  constructor(element) {
    super(element);

    this._course = new Input(element.querySelector("#courseName"));
    this._institution = new Input(element.querySelector("#institutionName"));
    this._startDate = new Input(element.querySelector("#startDate"));
    this._startDate.key = "startDate";
    this._startDate._input.readOnly = true;

    this._endDate = new Input(element.querySelector("#endDate"));
    this._endDate.key = "endDate";
    this._endDate._input.readOnly = true;

    this.$startDate = $("#startDate #Date").datepicker({
      language: "ko-KR",
      format: "yyyy.mm",
      autoHide: true,
      pick: () => {
        this._startDate.updateValidity(true);
      },
    });

    this.$endDate = $("#endDate #Date").datepicker({
      language: "ko-KR",
      format: "yyyy.mm",
      autoHide: true,
      pick: () => {
        this._endDate.updateValidity(true);
      },
    });

    this._add = element.querySelector("#add");
    this._add.addEventListener("click", () => this._addEducation());

    this._divider = element.querySelector("#divider");

    this._educationList = element.querySelector("#educationList");
    this._education = element.querySelector("#education");

    removeAllChildren(this._educationList);
    this._updateDivider();

    this.$expandableContent = element.querySelector(".expendable-content");
    this.$expend = element.querySelector("#expend");
    this.$expend.addEventListener("click", () => {
      this.$expend.style.display = "none";
      this.$expandableContent.style.display = "flex";
    });
  }

  get isValid() {
    return true;
  }

  validate() {}

  _addEducation() {
    let isInvalid = false;

    if (!this._course.isValid) {
      this._course.validate();
      isInvalid = isInvalid | true;
    }

    if (!this._institution.isValid) {
      this._institution.validate();
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
        this.$startDate.datepicker("getDate") > currentYearMonth;
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
        this.$startDate.datepicker("getDate") >
        this.$endDate.datepicker("getDate");
      isInvalid = isInvalid | endDateValid;
      this._endDate._error.textContent = "* 시작일 이후 날짜를 입력해주세요.";
      this._endDate.updateValidity(!endDateValid);
    }

    if (isInvalid) return;

    let data = {
      course: this._course.value,
      institution: this._institution.value,
      startDate: this._startDate.value,
      endDate: this._endDate.value,
    };

    const education = this._education.cloneNode(true);
    education.setAttribute("data", JSON.stringify(data));

    const course = education.querySelector("#courseName");
    course.textContent = data.course;

    const institution = education.querySelector("#institutionName");
    institution.textContent = data.institution;

    const startDate = education.querySelector("#startDate");
    startDate.textContent = data.startDate;

    const endDate = education.querySelector("#endDate");
    endDate.textContent = data.endDate;

    education.querySelector("#delete").addEventListener("click", () => {
      this._educationList.removeChild(education);
      this._updateDivider();
    });

    this._educationList.appendChild(education);

    this._course.reset();
    this._institution.reset();

    this._startDate.reset();
    this._endDate.reset();

    this._updateDivider();
    this._input.dispatchEvent(this.inputEvent);
  }

  _updateDivider() {
    this._divider.style.display = this._educationList.hasChildNodes()
      ? "flex"
      : "none";
  }

  get data() {
    let data = [...this._educationList.childNodes].map((element) =>
      JSON.parse(element.getAttribute("data"))
    );

    return data;
  }
}

class JobSkillInput extends Input {
  constructor(element) {
    super(element);

    this._jobGroup = new Dropdown(element.querySelector("#jobGroup"));
    this._jobGroup.key = "jobGroupId";
    this._jobGroup.endpoint = "jobgroup";

    this._job = new CheckboxGroup(element.querySelector("#job"));
    this._job.key = "jobIds";
    this._job.maxCount = 3;

    apiService
      .makeRequest(`/common/v2/${this._jobGroup.endpoint}`)
      .then((response) => this._jobGroup.bind(response.data))
      .catch((error) => console.error(error));

    this._jobGroup.onInput = () => {
      apiService
        .makeRequest(`/common/v2/job?jobGroupId=${this._jobGroup.value}`)
        .then((response) => {
          this._job.bind(response.data);
          this._job.element.style.display =
            this._jobGroup.value !== "" ? "block" : "none";
        })
        .catch((error) => console.error(error));
    };

    this._requirementSkills = new SkillSearch(
      element.querySelector("#requirementSkills")
    );
    this._requirementSkills.key = "requirementSkills";
  }

  get isValid() {
    return this._jobGroup.isValid && this._job.isValid;
  }

  validate() {
    this._jobGroup.validate();
    this._job.validate();
  }

  get data() {
    let data = {
      jobData: {
        jobGroupId: this._jobGroup.value,
        jobIds: this._job.value[this._job.key],
      },
      skillData: this._requirementSkills.value,
    };

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

logScreenView({ screenName: "superpass_apply" });
addLogButtonEventListener();

const profile = new ProfileInput(document.querySelector(".profile-section"));
profile.key = "profile";

const academic = new AcademicInput(document.querySelector(".academic-section"));
academic.key = "academic";

const appealKeyword = new AppealKeywordInput(
  document.querySelector(".appealkeyword-section")
);
appealKeyword.key = "appealKeyword";

const project = new ProjectInput(document.querySelector(".project-section"));
project.key = "project";

const resume = new ResumeInput(
  document.querySelector(".resume-portfolio-section")
);
resume.key = "document";

const award = new AwardInput(document.querySelector(".award-section"));
award.key = "award";

const certificate = new CertificateInput(
  document.querySelector(".certificate-section")
);
certificate.key = "certificate";

const languageTest = new LanguageTestInput(
  document.querySelector(".languagetest-section")
);
languageTest.key = "languageTest";

const languageAbility = new LanguageAbilityInput(
  document.querySelector(".languageability-section")
);
languageAbility.key = "languageAbility";

const extraEducation = new EducationInput(
  document.querySelector(".education-section")
);
extraEducation.key = "extraEducation";

const jobSkill = new JobSkillInput(document.querySelector(".jobskill-section"));
jobSkill.key = "jobSkill";

const workConditition = new WorkConditionInput(
  document.querySelector(".workcondition-section")
);
workConditition.key = "workConditition";

const term = new Checkbox(document.querySelector("#term"));
term.key = "term";

const applyForm = new Form(document.querySelector("#applyForm"), [
  profile,
  academic,
  appealKeyword,
  project,
  resume,
  award,
  certificate,
  languageTest,
  languageAbility,
  extraEducation,
  jobSkill,
  workConditition,
  term,
]);
applyForm.onSubmit = () => {
  checkFormData();
};

const checkFormData = () => {
  applyForm.validate();

  if (!applyForm.isValid) {
    logScreenView({ screenName: "superpass_apply_popup_error" });
    applyErrorModal.handleShow(true);
    return;
  }

  logScreenView({ screenName: "superpass_apply_popup_complete" });
  applyCheckModal.handleShow(true);
}

const submitButton = document.querySelector(".submit-button");
submitButton.addEventListener("click", checkFormData);

const applyCheckModal = new ConfirmModal(
  document.querySelector("#applyCheckModal")
);
applyCheckModal.onConfirm = () => {
  adjustOverflow();

  const data = {
    personalInfo: profile.data,
    document: resume.value,
    educationInfo: academic.data,
    preferJob: jobSkill.data.jobData,
    skills: jobSkill.data.skillData,
    workCondtition: workConditition.data,

    repKeywordIds: appealKeyword.data,
    repProjects: project.data,
    awards: award.data,
    certificates: certificate.data,
    languageTests: languageTest.data,
    languageAbilities: languageAbility.data,
    extraEducations: extraEducation.data,

    term: term.value,
  };

  apiService
    .makeRequest("/superpass/v2/apply-seeker", {
      method: "POST",
      body: JSON.stringify(data),
    })
    .then((response) => {
      fbq("track", "SubmitApplication");
      logScreenView({ screenName: "superpass_apply_popup_submit" });
      applyCheckModal.handleShow(false);
      applyDoneModal.handleShow(true);
    })
    .catch((error) => console.error(error));
};

const applyDoneModal = new AlertModal(
  document.querySelector("#applyDoneModal")
);
applyDoneModal.onCheck = () => {
  location.href = "/";
};

const applyErrorModal = new AlertModal(
  document.querySelector("#applyErrorModal")
);
