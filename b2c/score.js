// MARK: API
const fileUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return await apiService
    .makeRequest("/util/file-upload", {
      method: "POST",
      headers: { "Content-Type": "undefined" },
      body: formData,
    });
};

// MARK: Mixin
const modalMixin = {
  show() {
    document.body.style.height = "100%"
    document.body.style.overflow = "hidden";

    this.style.display = 'flex';
    this.scrollTo(0, 0);
  },
  hide() {
    document.body.style.height = undefined;
    document.body.style.overflow = "auto";

    this.style.display = 'none';
    this.scrollTo(0, 0);
  }
};

let reviewModel = {};
const initDocumentModal = (modal, type) => {
  Object.assign(modal, modalMixin);

  const documentClose = modal.querySelector(".document-close");
  const documentForm = modal.querySelector(".document-form");

  const fileRadio = documentForm.querySelector("input[id=file]");
  const fileButton = documentForm.querySelector("#file-field .w-form-formradioinput");

  const urlRadio = documentForm.querySelector("input[id=url]");
  const urlButton = documentForm.querySelector("#url-field .w-form-formradioinput");

  const fileContainer = documentForm.querySelector(".file-container");
  const fileInput = fileContainer.querySelector(".file-input");
  const fileName = fileContainer.querySelector(".file-name");

  const urlContainer = documentForm.querySelector(".url-container");
  const urlInput = urlContainer.querySelector("input");
  const urlError = urlContainer.querySelector(".error-text");

  const documentSubmit = documentForm.querySelector(".document-submit");

  modal.reset = () => {
    fileContainer.style.display = "flex";
    fileRadio.checked = false;
    fileButton.classList.remove("w--redirected-checked");

    fileInput.value = "";
    fileInput.dispatchEvent(new Event("change"));

    urlContainer.style.display = "none";
    urlRadio.checked = false;
    urlButton.classList.remove("w--redirected-checked");

    urlInput.value = "";

    fileRadio.checked = true;
    fileButton.classList.add("w--redirected-checked");

    documentForm.dispatchEvent(new Event("change"));

    if (type === "resume") {
      documentSubmit.classList.replace("enabled", "disabled");
    } else if (type === "portfolio") {
      documentSubmit.classList.replace("disabled", "enabled");
    }
  };

  const validateUrl = async (url) => {
    const regex =
        /^((http(s?))\:\/\/)([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/;
    const isValid = regex.test(urlInput.value);

    if (!isValid) {
      urlError.textContent = "* 올바른 URL 주소를 입력해주세요.";
      urlError.style.display = "block";
      return false;
    }

    try {
      await apiService.makeRequest(`/util/resume-check?url=${url}`);
      urlError.style.display = "none";

      return true;
    } catch(error) {
      urlError.textContent = `* ${error.message}`;
      urlError.style.display = "block";

      return false;
    }
  };

  documentClose.addEventListener("click", () => {
    reviewModel = {};
    modal.hide();
    modal.reset();
  });

  fileInput.addEventListener("change", () => {
    if (fileInput.files.length === 0) {
      fileName.textContent = "";
      if (type === "resume") {
        documentSubmit.classList.replace("enabled", "disabled");
      }
      fileName.style.display = "none";
    } else {
      fileName.textContent = fileInput.files[0].name;
      if (type === "resume") {
        documentSubmit.classList.replace("disabled", "enabled");
      }
      fileName.style.display = "block";
    }
  });

  urlInput.addEventListener("input", () => {
    urlInput.style.borderColor = style.getPropertyValue("--disabled")

    if (urlInput.value.length === 0) {
      if (type === "resume") {
        documentSubmit.classList.replace("enabled", "disabled");
      }
    } else {
      if (type === "resume") {
        documentSubmit.classList.replace("disabled", "enabled");
      }
    }
  });

  fileRadio.addEventListener("input", () => {
    fileContainer.style.display = "flex";
    urlContainer.style.display = "none";

    urlInput.value = "";
    if (type === "resume") {
      documentSubmit.classList.replace("enabled", "disabled");
    } 
  });

  urlRadio.addEventListener("input", () => {
    fileContainer.style.display = "none";
    urlContainer.style.display = "flex";

    fileInput.value = "";
    fileInput.dispatchEvent(new Event("change"));

    urlInput.style.borderColor = style.getPropertyValue("--disabled")
    urlError.style.display = "none";
    if (type === "resume") {
      documentSubmit.classList.replace("enabled", "disabled");
    }
  });

  documentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (type === "resume" && !documentSubmit.classList.contains("enabled")) return;

    const radio = documentForm.querySelector("input[name=resume]:checked");
    let documentUrl;
    if (radio.value === "file" && fileInput.files.length !== 0) {
      const response = await fileUpload(fileInput.files[0]);
      documentUrl = response.location;
    } else if (radio.value === "url" && !!urlInput.value) {
      if (!(await validateUrl(urlInput.value))) {
        urlInput.style.borderColor = style.getPropertyValue("--red");
        return;
      }
      documentUrl = urlInput.value;
    }

    modal.hide();
    if (type === "resume") {
      reviewModel.resumeUrl = documentUrl;
      portfolioModal.reset();
      portfolioModal.show();
    } else if (type === "portfolio") {
      reviewModel.portfolioUrl = documentUrl;
      positionModal.reset();
      positionModal.show();
    }
  });
}

// MARK: Resume
const resumeModal = document.querySelector(".resume-modal");
initDocumentModal(resumeModal, "resume");

// MARK: Portfolio
const portfolioModal = document.querySelector(".portfolio-modal");
initDocumentModal(portfolioModal, "portfolio");

// MARK: Position
const positionModal = document.querySelector(".position-select-modal");
Object.assign(positionModal, modalMixin);

const jobGroup = new Dropdown(positionModal.querySelector("#jobGroup"));
jobGroup.isConditioned = true;
const job = new ConditionedDropdown(positionModal.querySelector("#job"), jobGroup);

const positionClose = positionModal.querySelector(".modal-cancel-button");
const positionSubmit = positionModal.querySelector(".submit-button-small");

positionModal.reset = () => {
  jobGroup.value = null;
  job.reset();
}

positionClose.addEventListener("click", () => {
  reviewModel = {};
  positionModal.hide();
  positionModal.reset();
});

apiService
  .makeRequest("/common/v2/jobGroup")
  .then((response) => jobGroup.bind(response.data))
  .catch((error) => console.error(error));

jobGroup.onInput = () => {
  apiService
    .makeRequest(`/common/v2/job?jobGroupId=${jobGroup.value}`)
    .then((response) => {
      job.reset();
      job.bind(response.data);
    })
    .catch((error) => console.error(error));
};

job.onInput = () => {
  if (!!job.value) {
    positionSubmit.classList.replace("disabled", "enabled");
  } else {
    positionSubmit.classList.replace("enabled", "disabled");
  }
}

const positionForm = new Form(positionModal.querySelector("form"), [
  jobGroup,
  job,
]);

const accessToken = localStorage.getItem("accessToken");

positionForm.onSubmit = async () => {
  if (!positionForm.isValid) return;

  reviewModel.jobGroupId = jobGroup.value;
  reviewModel.jobId = job.value;
  positionModal.hide();
  if (accessToken) {
    apiService
      .makeRequest("/superpass/v2/document-review", {
        method: "POST",
        body: JSON.stringify(reviewModel),
      })
      .then(() => {
        location.href = "/score-result";
      })
      .catch(() => {
        alreadyAppliedModal.handleShow(true);
      });
  } else {
    kakaoSigninModal.handleShow(true);
  }
};

// MARK: Kakao
const loginWithKakao = () => {
  localStorage.setItem("reviewData", JSON.stringify(reviewModel));
  localStorage.setItem("loginUrl", location.href);
  Kakao.Auth.authorize({
    redirectUri: `${document.location.origin}/signin`,
  });
};

const $kakaoSigninModal = document.querySelector(".kakao-signin-modal");
const kakaoSigninModal = new Modal($kakaoSigninModal);
$kakaoSigninModal
  .querySelector(".kakao-modal-close")
  .addEventListener("click", () => {
    kakaoSigninModal.handleShow(false);
  });
$kakaoSigninModal
  .querySelector(".kakao-modal-button")
  .addEventListener("click", () => {
    loginWithKakao();
  });


// MARK: View
const login = () => {
  localStorage.setItem("loginUrl", location.href);
  location.href = "/signup"
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  location.reload();
};

const $loginButton = document.getElementById("loginButton");
const $dashboardButton = document.getElementById("dashboardButton");
$loginButton.textContent = accessToken ? "로그아웃" : "로그인 / 가입";
$dashboardButton.style.display = accessToken ? "block" : "none";

$loginButton.addEventListener("click", () => {
  accessToken ? logout() : login();
});
$dashboardButton.addEventListener("click", () => {
  if (accessToken) {
    location.href = "/matches";
  }
});

const alreadyAppliedModal = new AlertModal(
  document.querySelector(".already-applied-modal")
);
alreadyAppliedModal.onCheck = () => {
  location.href = "/score-result";
};

const params = new URLSearchParams(location.search);
const alreadyApplied = params.get("alreadyApplied");

if (alreadyApplied) {
  alreadyAppliedModal.handleShow(true);
}

const uploadButton = document.querySelector(".information-button-copy");
uploadButton.addEventListener("click", () => {
  reviewModel = {};
  resumeModal.reset();
  resumeModal.show();
});
