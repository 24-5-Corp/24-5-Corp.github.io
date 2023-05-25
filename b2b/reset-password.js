const accessToken = localStorage.getItem("accessToken");
const params = new URLSearchParams(location.search);
const email = params.get("email");
const hash = params.get("hash");

if (accessToken || !email || !hash) redirectMain();

logScreenView({ screenName: "rest-password_change" });
addLogButtonEventListener();

class ResetPasswordFormMediator extends FormMediator {
  get data() {
    const [newPasswordComponent] = this.components;

    return JSON.stringify({
      email: email,
      newPassword: newPasswordComponent.value,
      hash: hash,
    });
  }

  submitForm() {
    apiService
      .makeRequest("/auth/v2/reset-password", {
        method: "PUT",
        body: this.data,
      })
      .then(() => {
        location.href = "/reset-password-done";
      })
      .catch((error) => {
        alert(error.message);
      });
  }
}

const newPasswordComponent = new PasswordComponent(
  document.getElementById("newPasswordElement")
);
newPasswordComponent.message =
  "영문, 숫자, 특수문자를 포함한 8~20글자로 입력해주세요.";

const comfirmPasswordComponent = new ConfirmComponent(
  document.getElementById("confirmPasswordElement"),
  newPasswordComponent
);
comfirmPasswordComponent.message = "새 비밀번호와 일치하지 않아요.";

const submitComponent = new SubmitComponent(
  document.getElementById("submitButton")
);

const resetPasswordForm = new ResetPasswordFormMediator(
  [newPasswordComponent, comfirmPasswordComponent],
  submitComponent
);
