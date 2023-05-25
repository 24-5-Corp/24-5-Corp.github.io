const accessToken = localStorage.getItem("accessToken");
if (!accessToken) redirectMain();

fetchLNB();

addLogButtonEventListener();
document.querySelector("#applySuperpass").addEventListener("click", () => {
  location.href = "/home?isApply=true";
});

const modal = new AlertModal(document.querySelector("#modal"));

const bizNo = new RegexInput(document.querySelector("#bizNo"));
bizNo.key = "bizNo";

bizNo.regex = /^[0-9]{10}$/;

bizNo.extract = (input, value) => {
  return value.replace(/\-/g, "");
};
bizNo.replace = (input, value) => {
  input.value = value
    .replace(/[^0-9]/g, "")
    .substring(0, 10)
    .replace(/^(\d{3})(\d{2})(\d{1,})$/, `$1-$2-$3`);
};

const companyName = new Input(document.querySelector("#companyName"));
companyName.key = "name";

const establish = new RegexInput(document.querySelector("#establish"));
establish.key = "establish";

establish.regex = regex.date;
establish.regexMessage = "2019.09.22 와 같은 형식으로 입력해주세요.";

establish.extract = (input, value) => {
  return value.replace(/\./g, "");
};
establish.replace = (input, value) => {
  input.value = value
    .replace(/[^0-9]/g, "")
    .substring(0, 8)
    .replace(/^(\d{4})(\d{2})(\d{1,})$/, `$1.$2.$3`);
};

const address = new Input(document.querySelector("#address"));
address.key = "address";

const category = new Input(document.querySelector("#category"));
category.key = "category";

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
websiteUrl.regexMessage = "웹사이트 URL을 확인해주세요.";

const promises = [industry, earn, employee, workRegion].map((dropdown) => {
  return apiService
    .makeRequest(`/common/v2/${dropdown.endpoint}`)
    .then((response) => dropdown.bind(response.data))
    .catch((error) => console.error(error));
});

const companyForm = new MultipartForm(document.querySelector("#companyForm"), [
  bizNo,
  companyName,
  establish,
  address,
  category,
  thumbnail,
  industry,
  earn,
  employee,
  workRegion,
  websiteUrl,
]);

companyForm.onSubmit = () => {
  companyForm.validate();
  if (!companyForm.isValid) return;

  thumbnail.key = "thumbnail";

  const value = companyForm.value;
  value.append(
    "updateThumbnail",
    !!thumbnail.value ||
      thumbnail._image.src ===
        "https://uploads-ssl.webflow.com/63c8d327fd47ec5c98895dc4/63e3705d8bcb22255f776c78_img_upload_default.svg"
  );

  apiService
    .makeRequest("/auth/v2/company", {
      method: "PUT",
      headers: { "Content-Type": "undefined" },
      body: value,
    })
    .then((data) => {
      modal.handleShow(true);
      fetchLNB();
    })
    .catch((error) => console.error(error));
};

const email = new Input(document.querySelector("#email"));
email.key = "email";

const userName = new RegexInput(document.querySelector("#userName"));
userName.key = "name";

userName.regex = /^.{2,30}$/;
userName.regexMessage = "2~30자 이내로 입력해주세요.";

const contact = new RegexInput(document.querySelector("#contact"));
contact.key = "contact";

contact.regex = regex.phoneNumber;
contact.regexMessage = "올바른 전화번호를 입력해주세요.";

contact.extract = (input, value) => {
  return value.replace(/-/g, "");
};
contact.replace = (input, value) => {
  input.value = value
    .replace(/[^0-9]/g, "")
    .substring(0, 11)
    .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
};

const password = new Input(document.querySelector("#password"));
password.key = "password";

const newPassword = new RegexInput(document.querySelector("#newPassword"));
newPassword.key = "newPassword";

newPassword.regex = regex.password;
newPassword.regexMessage =
  "영문, 숫자, 특수문자(!@#$%^&*)를 포함한 8~20글자로 설정해주세요.";

const confirmPassword = new ConfirmInput(
  document.querySelector("#confirmPassword"),
  newPassword
);

const profileForm = new Form(document.querySelector("#profileForm"), [
  email,
  userName,
  contact,
]);

profileForm.onSubmit = () => {
  profileForm.validate();

  let value = JSON.parse(profileForm.value);

  password._input.required = !!newPassword.value || !!confirmPassword.value;
  newPassword._input.required = !!confirmPassword.value;

  if (!!password.value) value.password = password.value;

  let isPasswordValid = true;
  [password, newPassword, confirmPassword].forEach((password) => {
    if (!password.isValid) isPasswordValid = false;
    password.validate();
  });

  if (!profileForm.isValid || !isPasswordValid) return;

  apiService
    .makeRequest("/auth/v2/me", { method: "PUT", body: JSON.stringify(value) })
    .then((data) => {
      modal.handleShow(true);
      fetchLNB();
    })
    .catch((error) => password.updateValidity(false));
};

const companyTab = new Tab(document.querySelector("#companyTab"));
companyTab.onSelect = () => {
  logScreenView({ screenName: "setting_biz" });
  scrollTo(0, 0);
  thumbnail.key = "thumbnailUrl";

  apiService
    .makeRequest("/auth/v2/company")
    .then((response) => {
      companyForm.value = response.data;
    })
    .catch((error) => console.error(error));
};

const profileTab = new Tab(document.querySelector("#profileTab"));
profileTab.onSelect = () => {
  logScreenView({ screenName: "setting_account" });
  scrollTo(0, 0);
  apiService
    .makeRequest("/auth/v2/me")
    .then((response) => {
      profileForm.value = response.data;
    })
    .catch((error) => console.error(error));
};

Webflow.push(() =>
  Promise.all(promises).then(() => {
    const params = new URLSearchParams(location.search);
    const param = params.get("tab");
    if (param) {
      if (param === "company") {
        companyTab.onSelect();
      } else if (param === "profile") {
        profileTab._tab.click();
      }
      const urlWithoutQuery = location.href.replace(/[?&]tab=([^&#]*)/g, "");
      history.pushState({}, "", urlWithoutQuery);
    } else {
      companyTab.onSelect();
    }
  })
);
