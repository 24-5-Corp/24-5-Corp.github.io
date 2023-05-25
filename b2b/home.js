class RadioGroup extends RegexInput {
  constructor(element) {
    super(element);

    this._input.disabled = true;

    this._buttons = element.querySelectorAll("label div");
    this._radios = element.querySelectorAll("label input");

    for (const radio of this._radios) {
      radio.addEventListener("input", (event) => {
        this._input.reasonId = parseInt(event.target.value);

        const isETC = this._input.reasonId === 900;
        const before = isETC ? "conditioned" : "enabled";
        const after = isETC ? "enabled" : "conditioned";

        this._input.classList.replace(before, after);
        this._input.disabled = !isETC;

        this._input.value = "";

        this._input.dispatchEvent(this.inputEvent);
      });
    }
  }

  get isValid() {
    if (this._input.reasonId === 900) return !!this._input.value;
    return !!this._input.reasonId;
  }

  reset() {
    for (const button of this._buttons) {
      button.classList.remove("w--redirected-checked");
    }
    for (const radio of this._radios) {
      radio.checked = false;
    }
    if (this._input.reasonId === 900)
      this._input.classList.replace("enabled", "conditioned");

    this._input.reasonId = undefined;
    this._input.value = "";
    this._input.disabled = true;
  }
}

const accessToken = localStorage.getItem("accessToken");
if (!accessToken) redirectMain();

fetchLNB();
addLogButtonEventListener();

const getTabId = () => {
  return document.querySelector(".w-tab-menu .w--current").id;
};

const pendingModal = new AlertModal(document.querySelector("#pendingModal"));

const radioGroup = new RadioGroup(document.querySelector("#cancelRadio"));
radioGroup.extract = (input, value) => {
  let data = {};

  data.reasonId = input.reasonId;
  if (!!value) data.reasonEtcText = value;

  return data;
};
radioGroup.replace = (input, value) => (input.value = value.substring(0, 100));

const cancelForm = new Form(document.querySelector("#cancelForm"), [
  radioGroup,
]);

radioGroup.onInput = () => {
  cancelForm.isEnabled = radioGroup.isValid;
};

const cancelModal = new PromptModal(
  document.querySelector("#cancelModal"),
  cancelForm
);
const cancelCheckModal = new ConfirmModal(
  document.querySelector("#cancelCheckModal")
);
const cancelDoneModal = new AlertModal(
  document.querySelector("#cancelDoneModal")
);

cancelForm.onSubmit = () => {
  if (!cancelForm.isValid) return;

  const id = radioGroup.applicationId;
  cancelCheckModal.onConfirm = () => {
    apiService
      .makeRequest(`/superpass/v2/applications/${id}/cancel`, {
        method: "PUT",
        body: JSON.stringify(radioGroup.value),
      })
      .then((data) => {
        cancelCheckModal.handleShow(false);
        cancelModal.handleShow(false);
        radioGroup.applicationId = undefined;

        const tab = getTabId() === "inprogressTab" ? inprogressTab : closedTab;
        tab.onSelect();

        cancelDoneModal.handleShow(true);
      });
  };
  cancelCheckModal.handleShow(true);
};

const $superpassListItem = document.getElementById("superpassListItem");

const inprogressList = new List(
  document.getElementById("inprogressList"),
  $superpassListItem
);

const inprogressListView = new SuperpassListView(
  inprogressList,
  document.getElementById("inprogressEmpty"),
  document.getElementById("inprogressCount")
);
inprogressListView.onClick = (item) => {
  if (item.status.id === 1) return pendingModal.handleShow(true);
  location.href = `/superpass-match?applicationId=${item.id}`;
};
inprogressListView.onCancel = (item) => {
  radioGroup.applicationId = item.id;
  cancelModal.handleShow(true);
  logScreenView({ screenName: "superpass_keep_cancel" });
};

const closedList = new List(
  document.getElementById("closedList"),
  $superpassListItem
);

const closedListView = new SuperpassListView(
  closedList,
  document.getElementById("closedEmpty")
);

closedListView.onClick = (item) => {
  location.href = `/superpass-match-done?applicationId=${item.id}`;
};

const fetchList = (query) => {
  apiService
    .makeRequest(`/superpass/v2/applications?status=${query}`)
    .then((response) => {
      const listView =
        getTabId() === "inprogressTab" ? inprogressListView : closedListView;
      listView.bind(response);
    })
    .catch((error) => {
      const listView =
        getTabId() === "inprogressTab" ? inprogressListView : closedListView;
      listView.bind({ data: [], totalCount: 0 });
    });
};

const inprogressTab = new Tab(document.querySelector("#inprogressTab"));
inprogressTab.onSelect = () => {
  logScreenView({ screenName: "superpass_keep" });
  fetchList("INPROGRESS");
};

const closedTab = new Tab(document.querySelector("#closedTab"));
closedTab.onSelect = () => {
  logScreenView({ screenName: "superpass_end" });
  fetchList("CLOSED");
};

const jobGroup = new Dropdown(document.querySelector("#jobGroup"));
jobGroup.key = "jobGroupId";
jobGroup.endpoint = "jobgroup";

const job = new ConditionedDropdown(document.querySelector("#job"), jobGroup);
job.key = "jobId";

const recruitmentType = new Dropdown(
  document.querySelector("#recruitmentType")
);
recruitmentType.key = "recruitmentTypeId";
recruitmentType.endpoint = "recruitment-type";

const employmentPeriod = new ConditionedDropdown(
  document.querySelector("#employmentPeriod"),
  recruitmentType
);
employmentPeriod.key = "employmentPeriodId";

const requirementSkills = new SkillSearch(
  document.querySelector("#requirementSkills")
);
requirementSkills.key = "requirementSkills";

const preferComment = new Input(document.querySelector("#preferComment"));
preferComment.key = "preferComment";

const recruitmentUrl = new RegexInput(
  document.querySelector("#recruitmentUrl")
);
recruitmentUrl.key = "recruitmentUrl";

recruitmentUrl.regex = regex.website;
recruitmentUrl.regexMessage = "웹사이트 URL을 확인해주세요.";

const requriedApplyInputs = [
  jobGroup,
  job,
  recruitmentType,
  employmentPeriod,
  requirementSkills,
];
const optionalApplyInputs = [preferComment, recruitmentUrl];

const applyForm = new Form(
  document.querySelector("#applyForm"),
  requriedApplyInputs.concat(optionalApplyInputs)
);

const onJobGroupInput = (value) => {
  apiService
    .makeRequest(`/common/v2/job?jobGroupId=${value}`)
    .then((response) => job.bind(response.data));
};

const onRecruitmentTypeInput = (value) => {
  employmentPeriod._input.required = value !== 3;

  if (!employmentPeriod._input.required) return employmentPeriod.reset();

  apiService
    .makeRequest("/common/v2/employment-period")
    .then((response) => employmentPeriod.bind(response.data));
};

requriedApplyInputs.forEach((input) => {
  input.onInput = (value) => {
    if (input === jobGroup) onJobGroupInput(value);
    if (input === recruitmentType) onRecruitmentTypeInput(value);

    applyForm.isEnabled = !requriedApplyInputs.some((input) => !input.isValid);
  };
});

const thumbnail = new ImageUpload(document.querySelector("#thumbnail"));
thumbnail.key = "thumbnailUrl";

const industry = new Dropdown(document.querySelector("#industry"));
industry.key = "industryId";
industry.endpoint = "industry";

const earn = new Dropdown(document.querySelector("#earn"));
earn.key = "revenueOrInvestmentId";
earn.endpoint = "revenue_or_investment";

const employee = new Dropdown(document.querySelector("#employee"));
employee.key = "employeeId";
employee.endpoint = "employee";

const workRegion = new Dropdown(document.querySelector("#workRegion"));
workRegion.key = "workRegionId";
workRegion.endpoint = "region";

const websiteUrl = new RegexInput(document.querySelector("#websiteUrl"));
websiteUrl.key = "websiteUrl";

websiteUrl.regex = regex["website"];
websiteUrl.regexMessage = "ex) https://www.ssgsag.kr";

const companyInputs = [
  thumbnail,
  industry,
  earn,
  employee,
  workRegion,
  websiteUrl,
];

const companyForm = new MultipartForm(
  document.querySelector("#companyForm"),
  companyInputs
);

const companyModal = new PromptModal(
  document.querySelector("#companyModal"),
  companyForm
);
companyModal.onShow = () => {
  logScreenView({ screenName: "superpass_apply_biz" });
  const fetch = () => {
    apiService
      .makeRequest("/auth/v2/company")
      .then((response) => (companyForm.value = response.data));
  };

  const promises = [industry, earn, employee, workRegion].map((dropdown) => {
    return apiService
      .makeRequest(`/common/v2/${dropdown.endpoint}`)
      .then((response) => dropdown.bind(response.data));
  });

  Promise.all(promises).then(fetch);
};

const applyModal = new PromptModal(
  document.querySelector("#applyModal"),
  applyForm
);
applyModal.onShow = () => {
  logScreenView({ screenName: "superpass_apply_detail" });
  [jobGroup, recruitmentType].map((dropdown) => {
    return apiService
      .makeRequest(`/common/v2/${dropdown.endpoint}`)
      .then((response) => dropdown.bind(response.data));
  });
};

const applyCheckModal = new ConfirmModal(
  document.querySelector("#applyCheckModal")
);
applyCheckModal.onClose = () => adjustOverflow();

const applyDoneModal = new AlertModal(
  document.querySelector("#applyDoneModal")
);
applyDoneModal.onCheck = () => {
  const tab = getTabId() === "inprogressTab" ? inprogressTab : closedTab;
  tab.onSelect();
};

applyForm.onSubmit = () => {
  applyForm.validate();
  if (!applyForm.isValid) return;

  const value = companyForm.value;
  value.append("updateThumbnail", !!thumbnail.value);
  applyCheckModal.handleShow(true);
};

applyCheckModal.onConfirm = () => {
  adjustOverflow();

  apiService
    .makeRequest("/superpass/v2/apply", {
      method: "POST",
      body: applyForm.value,
    })
    .then((data) => {
      applyDoneModal.handleShow(true);
      applyModal.handleShow(false);
    });
};

companyInputs.forEach((input) => {
  input.onInput = (value) => {
    companyForm.isEnabled = !companyInputs.some((input) => !input.isValid);
  };
});

companyForm.onSubmit = () => {
  companyForm.validate();
  if (!companyForm.isValid) return;

  thumbnail.key = "thumbnail";

  const value = companyForm.value;
  value.append("updateThumbnail", !!thumbnail.value);

  apiService
    .makeRequest("/auth/v2/company", {
      method: "PUT",
      headers: { "Content-Type": "undefined" },
      body: value,
    })
    .then((data) => {
      companyModal.handleShow(false);
      applyModal.handleShow(true);
    });
};

const applyButtons = document.querySelectorAll("#applySuperpass");

[...applyButtons].map((element) => {
  element.addEventListener("click", (event) => {
    if (getTabId() === "closedTab") inprogressTab._tab.click();
    thumbnail.key = "thumbnailUrl";
    companyModal.handleShow(true);
  });
});

const params = new URLSearchParams(location.search);
const isApply = params.get("isApply");
if (isApply) {
  thumbnail.key = "thumbnailUrl";
  companyModal.handleShow(true);

  const urlWithoutQuery = location.href.replace(/[?&]isApply=([^&#]*)/g, "");
  history.pushState({}, "", urlWithoutQuery);
}

Webflow.push(() => {
  const param = params.get("tab");
  if (param) {
    if (param === "inprogress") {
      inprogressTab.onSelect();
    } else if (param === "closed") {
      closedTab._tab.click();
    }
    const urlWithoutQuery = location.href.replace(/[?&]tab=([^&#]*)/g, "");
    history.pushState({}, "", urlWithoutQuery);
  } else {
    inprogressTab.onSelect();
    logScreenView({ screenName: "superpass_keep" });
  }
});
