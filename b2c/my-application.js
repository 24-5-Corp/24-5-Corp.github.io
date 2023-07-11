class MyAppicationView {
  constructor(element) {
    this._element = element;

    this._container = element.querySelector(".application-container");
    this._name = element.querySelector(".application-name");
    this._introduceContainer = element.querySelector(".application-introduce");
    this._keywordList = element.querySelector(".application-introduce-keyword");
    this._keyword = element.querySelector(".keyword-chip");
    this._email = element.querySelector(".application-email");
    this._contact = element.querySelector(".application-contact");
    this._cvList = element.querySelector(".application-document-list");
    this._cv = element.querySelector(".application-document");
    this._recordContainer = element.querySelector(
      ".application-record-container"
    );
    this._record = element.querySelector(".application-record");
    this._skillList = element.querySelector(".application-skill-list");

    this._workType = element.querySelector(".work-type");
    this._workLocation = element.querySelector(".work-location");
    this._workStartDate = element.querySelector(".work-start-date");
    this._workAdditional = element.querySelector(".work-additional");
  }

  bind(model) {
    this._name.textContent = model.seeker.name;
    this._email.textContent = model.seeker.email;
    this._contact.textContent = model.seeker.contact;

    model.documents.forEach((document) => {
      const clonedCV = this._cv.cloneNode(true);
      const title = document.type === 0 ? "이력서" : "포트폴리오";
      clonedCV.querySelector(".document-item-icon").src =
        document.thummbnailUrl;
      clonedCV.querySelector(".document-item-title").textContent = title;

      this._cvList.appendChild(clonedCV);
    });

    // 학적 정보
    const academic = model.academicRecord;
    const academicContainer = this._recordContainer.cloneNode(true);
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

    academicList.appendChild(academic);
    this._container.appendChild(academicContainer);

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

    this._container.style.display = "flex";
  }
}

const getApplyStatus = () => {
  apiService
    .makeRequest("/apply-status")
    .then((response) => {
      // -> 있으면 신청서 조회 get
      // -> 없으면 신청 유도 뷰 노출
    })
    .catch((error) => console.error(error));
};

const application = new MyAppicationView();

const getApplySeeker = () => {
  apiService
    .makeRequest("/apply-seeker")
    .then((response) => {
      application.bind(response);
    })
    .catch((error) => console.error(error));
};

// 신청 상태 get
getApplyStatus();
