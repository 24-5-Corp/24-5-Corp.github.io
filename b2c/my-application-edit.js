// NOTE: const
const projectCategories = [
  { id: 1, name: "경력" },
  { id: 2, name: "동아리/학회" },
  { id: 3, name: "대외활동" },
  { id: 4, name: "봉사활동" },
  { id: 5, name: "프로젝트" },
  { id: 6, name: "수강" },
  { id: 100, name: "기타" },
];

const resumeTypes = [
  { id: 0, name: "이력서" },
  { id: 1, name: "포트폴리오" },
];

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

const academic = new AcademicInput(document.querySelector(".academic-section"));
academic.key = "academic";

const requirementSkills = new SkillSearch(
  document.querySelector("#requirementSkills")
);
requirementSkills.key = "requirementSkills";

const workConditition = new WorkConditionInput(
  document.querySelector(".workcondition-section")
);
workConditition.key = "workConditition";

// NOTE: api
class MockApiService {
  applicationDto = {
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

  makeRequest = async (endpoint, options = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Method: ${options.method}`);

    return this.applicationDto;
  };

  pushPortfolio = async () => {
    const portfolio = {
      type: 1,
      name: "피니 마이커리어.pdf",
      documentUrl:
        "https://s3.ap-northeast-2.amazonaws.com/project-hs/resumes/00e0c239-f682-45da-bcf9-d85bcc961923.pdf",
      thumbnailUrl:
        "https://s3.ap-northeast-2.amazonaws.com/project-hs/9ef5a7bf-c0f5-4710-9db3-8285c54b10c1.png",
    };

    this.applicationDto.documents.push(portfolio);
    await fetchApplication();
  };

  pushProject = async () => {
    const project = {
      category: 1,
      name: "프로젝트",
      role: "역할",
      startDate: "2023.05",
      endDate: "2023.05",
      inProgress: false,
    };

    this.applicationDto.repProjects.push(project);
    await fetchApplication();
  };

  pushAward = async () => {
    const award = {
      name: "피니즈3기",
      prize: "금상",
      host: "이십사점오",
      awardDate: "2021.06",
    };

    this.applicationDto.awards.push(award);
    await fetchApplication();
  };

  pushCertificate = async () => {
    const certificate = {
      name: "의료기기 RA전문가",
      issuer: "한국의료기기안전정보원",
      grade: "1급",
      acquisitionDate: "2023.05",
    };

    this.applicationDto.certificates.push(certificate);
    await fetchApplication();
  };

  pushLanguageTest = async () => {
    const languageTest = {
      language: "영어",
      name: "TOEIC",
      grade: 990,
      acquisitionDate: "2023.05",
    };

    this.applicationDto.languageTests.push(languageTest);
    await fetchApplication();
  };

  pushLanguage = async () => {
    const language = {
      name: "영어",
      proficiency: "초급",
    };

    this.applicationDto.languages.push(language);
    await fetchApplication();
  };

  pushEducation = async () => {
    const education = {
      courseName: "부트캠프",
      institutionName: "스파르타코딩클럽",
      startDate: "2023.05",
      endDate: "2023.05",
      inProgress: false,
    };

    this.applicationDto.educations.push(education);
    await fetchApplication();
  };
}
const mockApiService = new MockApiService();

const getApplication = async () => {
  return await mockApiService.makeRequest("/superpass/apply-seeker", {
    method: "GET",
  });
};

const mapper = {
  credentials: {
    repProjects: (repProjects) => {
      return repProjects.map((repProject) => {
        let date = repProject.startDate;
        if (repProject.inProgress) {
          date += "진행중";
        } else if (repProject.endDate) {
          date += `~${repProject.endDate}`;
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
          date: award.awardDate,
        };
      });
    },

    certificates: (certificates) => {
      return certificates.map((certificate) => {
        return {
          title: certificate.name,
          subtitle: `${certificate.issuer} | ${certificate.grade}`,
          date: certificate.acquisitionDate,
        };
      });
    },

    languageTests: (languageTests) => {
      return languageTests.map((languageTest) => {
        return {
          title: languageTest.language,
          subtitle: `${languageTest.name} | ${languageTest.grade}`,
          date: languageTest.acquisitionDate,
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
        let date = education.startDate;
        if (education.inProgress) {
          date += "진행중";
        } else if (education.endDate) {
          date += `~${education.endDate}`;
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

// NOTE: webflow
const $nameField = document.querySelector("#name-field");
const $emailField = document.querySelector("#email-field");
const $contactField = document.querySelector("#contact-field");

const $repKeywordList = document.querySelector("#rep-keyword-list");
const $repProjectList = document.querySelector("#rep-project-list");
const $resumeList = document.querySelector("#resume-list");

const $awardList = document.querySelector("#award-list");
const $certificateList = document.querySelector("#certificate-list");
const $languageTestList = document.querySelector("#language-test-list");
const $languageList = document.querySelector("#language-list");
const $educationList = document.querySelector("#education-list");

const $jobGroupField = document.querySelector("#job-group-field");
const $positionList = document.querySelector("#position-list");

const $chipItem = document.querySelector(".chip-item");
const $resumeItem = document.querySelector(".resume-item");
const $credentialItem = document.querySelector(".credential-item");
const $credentialEmpty = document.querySelector(".credential-empty");

const bindText = (field, text) => {
  field.querySelector(".text").textContent = text;
};

const bindChips = (list, repKeywords) => {
  removeAllChildren(list);

  repKeywords.forEach((repKeyword) => {
    const clonedItem = $chipItem.cloneNode(true);

    clonedItem.textContent = repKeyword;

    list.appendChild(clonedItem);
  });
};

const bindCredential = (list, credentials) => {
  removeAllChildren(list);

  if (credentials.length === 0) {
    const clonedEmpty = $credentialEmpty.cloneNode(true);
    return list.appendChild(clonedEmpty);
  }

  credentials.forEach((credential) => {
    const clonedItem = $credentialItem.cloneNode(true);
    const $title = clonedItem.querySelector(".credential-title");
    const $subtitle = clonedItem.querySelector(".credential-subtitle");
    const $date = clonedItem.querySelector(".credential-date");

    $title.textContent = credential.title;
    $subtitle.textContent = credential.subtitle;

    if (credential.date) {
      $date.textContent = credential.date;
    } else {
      $date.style.display = "none";
    }

    list.appendChild(clonedItem);
  });
};

const bindResumes = (list, resumes) => {
  removeAllChildren(list);

  resumes.forEach((resume) => {
    const clonedItem = $resumeItem.cloneNode(true);
    const $type = clonedItem.querySelector(".resume-type");
    const $url = clonedItem.querySelector(".resume-url");

    $type.textContent = resumeTypes.find(
      (resumeType) => resumeType.id === resume.type
    ).name;
    $url.textContent = resume.documentUrl;

    list.appendChild(clonedItem);
  });
};

const fetchApplication = async () => {
  return getApplication().then((applicationDto) => {
    bindText($nameField, applicationDto.seeker.name);
    bindText($emailField, applicationDto.seeker.email);
    bindText($contactField, applicationDto.seeker.contact);

    // NOTE: academic
    academic._university.value = applicationDto.academicRecord.university;
    academic._major.value = applicationDto.academicRecord.major;
    // TODO: avgScore
    academic._avgScore.value =
      applicationDto.academicRecord.avgScore.toString();
    academic._stdScore.value = academic.stdScores.find(
      (score) => score.name == applicationDto.academicRecord.stdScore
    ).id;
    academic._graduate.value = applicationDto.academicRecord.graduate;
    academic._grade.value = applicationDto.academicRecord.grade;
    academic._semester.value = applicationDto.academicRecord.semester;
    academic._year.value = parseInt(
      applicationDto.academicRecord.graduateYearMonth.substring(0, 4)
    );
    academic._month.value = parseInt(
      applicationDto.academicRecord.graduateYearMonth.substring(4, 6)
    );

    bindChips($repKeywordList, applicationDto.repKeywords);

    bindCredential(
      $repProjectList,
      mapper.credentials.repProjects(applicationDto.repProjects)
    );

    bindResumes($resumeList, applicationDto.documents);

    bindCredential(
      $awardList,
      mapper.credentials.awards(applicationDto.awards)
    );
    bindCredential(
      $certificateList,
      mapper.credentials.certificates(applicationDto.certificates)
    );
    bindCredential(
      $languageTestList,
      mapper.credentials.languageTests(applicationDto.languageTests)
    );
    bindCredential(
      $languageList,
      mapper.credentials.languages(applicationDto.languages)
    );
    bindCredential(
      $educationList,
      mapper.credentials.educations(applicationDto.educations)
    );

    bindText($jobGroupField, applicationDto.jobSkill.jobGroup);
    bindChips($positionList, applicationDto.jobSkill.jobs);
    // NOTE: skill
    applicationDto.jobSkill.skills.forEach((skill) => {
      requirementSkills.appendListItem(skill);
    });

    // TODO: workConditition
    applicationDto.workCondition.recruitmentTypeGroups.forEach((type) => {
      const checkbox = new Checkbox(
        workConditition._type._input.childNodes[type.id - 1]
      );
      checkbox.value = true;
    });
    applicationDto.workCondition.regions.forEach((region) => {
      const checkbox = new Checkbox(
        workConditition._type._input.childNodes[region.id - 1]
      );
      checkbox.value = true;
    });
    workConditition._date.value = applicationDto.workCondition.workStart;
    workConditition._additional.value = applicationDto.workCondition.additional;
  });
};

fetchApplication();
