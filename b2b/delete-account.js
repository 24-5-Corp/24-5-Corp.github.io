const accessToken = localStorage.getItem("accessToken");
if (!accessToken) redirectMain();

fetchLNB();

logScreenView({ screenName: "setting_account_leave" });
addLogButtonEventListener();
document.querySelector("#applySuperpass").addEventListener("click", () => {
  location.href = "/home?isApply=true";
});

apiService
  .makeRequest("/auth/v2/me")
  .then((response) => {
    document.querySelector(
      "#email"
    ).textContent = `• 사용하고 계신 아이디(${response.data.email})는 탈퇴할 경우, 30일 이내로 재사용이 불가능합니다.`;
  })
  .catch((error) => console.error(error));

const checkModal = new ConfirmModal(
  document.querySelector("#deleteCheckModal")
);
const doneModal = new AlertModal(document.querySelector("#deleteDoneModal"));
checkModal.onConfirm = () => {
  adjustOverflow();

  apiService
    .makeRequest("/auth/v2/withdrawal", {
      method: "DELETE",
      body: withdrawalForm.value,
    })
    .then((data) => {
      doneModal.handleShow(true);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    })
    .catch((error) => password.updateValidity(false));
};
doneModal.onCheck = () => {
  location.href = "/";
};

const password = new Input(document.querySelector("#password"));
password.key = "password";

const withdrawalForm = new Form(document.querySelector("#withdrawalForm"), [
  password,
]);
Webflow.push(() => (withdrawalForm._submit.disabled = true));

password._input.addEventListener("input", (event) => {
  const isEmpty = !event.target.value;

  withdrawalForm._submit.style.background = isEmpty
    ? style.getPropertyValue("--default")
    : "white";
  withdrawalForm._submit.style.color = isEmpty
    ? style.getPropertyValue("--disabled")
    : style.getPropertyValue("--primary");
  withdrawalForm._submit.disabled = isEmpty;
});

withdrawalForm.onSubmit = () => {
  checkModal.handleShow(true);
};
Webflow.push(() => {
  document.querySelector("#navigationSettings").classList.add("w--current");
});
