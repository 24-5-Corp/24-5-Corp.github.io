const accessToken = localStorage.getItem("accessToken");
const params = new URLSearchParams(location.search);
const email = params.get("email");
const hash = params.get("hash");

if (accessToken || !email || !hash) redirectMain();

logScreenView({ screenName: "signup_account" });
addLogButtonEventListener();

class SignupFormMediator extends FormMediator {
  constructor(components, submitComponent, modal) {
    super(components, submitComponent);

    this.modal = modal;
  }

  get data() {
    const [
      nameComponent,
      phoneNumberComponent,
      passwordComponent,
      confirmPasswordComponent,
      checkFormComponent,
    ] = this.components;

    this.nameComponent = nameComponent;
    this.phoneNumberComponent = phoneNumberComponent;
    this.passwordComponent = passwordComponent;
    this.confirmPasswordComponent = confirmPasswordComponent;
    this.checkFormComponent = checkFormComponent;

    return JSON.stringify({
      email: email,
      name: this.nameComponent.value,
      contact: this.phoneNumberComponent.value,
      password: this.passwordComponent.value,
      confirm: this.checkFormComponent.optionals[0].checked,
      hash: hash,
    });
  }

  submitForm() {
    apiService
      .makeRequest("/auth/v2/signup", {
        method: "POST",
        body: this.data,
      })
      .then((data) => {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.accessToken);

        this.handleModal();
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleModal() {
    this.modal.style.display = "flex";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";
  }
}

const nameComponent = new NameComponent(document.getElementById("nameElement"));

const phoneNumberComponent = new PhoneNumberComponent(
  document.getElementById("phoneNumberElement")
);

const passwordComponent = new PasswordComponent(
  document.getElementById("passwordElement")
);
passwordComponent.message =
  "영문, 숫자, 특수문자(!@#$%^&*)를 포함한 8~20글자로 입력해주세요.";

const confirmPasswordComponent = new ConfirmComponent(
  document.getElementById("confirmPasswordElement"),
  passwordComponent
);

const submitComponent = new SubmitComponent(
  document.getElementById("submitButton")
);
Webflow.push(() => submitComponent.validate(false));

const checkFormComponent = new CheckFormComponent(
  document.getElementById("allCheckBox"),
  [
    document.getElementById("termsCheckBox"),
    document.getElementById("privacyCheckBox"),
  ],
  [document.getElementById("promotionCheckBox")],
  submitComponent
);

const signupForm = new SignupFormMediator(
  [
    nameComponent,
    phoneNumberComponent,
    passwordComponent,
    confirmPasswordComponent,
    checkFormComponent,
  ],
  submitComponent,
  document.getElementById("signupModal")
);
