const accessToken = localStorage.getItem("accessToken");

if (accessToken) redirectMain();

logScreenView({ screenName: "login" });
addLogButtonEventListener();

class LoginFormMediator extends FormMediator {
  get data() {
    const [emailComponent, passwordComponent] = this.components;
    this.emailComponent = emailComponent;
    this.passwordComponent = passwordComponent;

    return JSON.stringify({
      email: this.emailComponent.input.value,
      password: this.passwordComponent.input.value,
    });
  }

  submitForm() {
    apiService
      .makeRequest("/auth/v2/signin", {
        method: "POST",
        body: this.data,
      })
      .then((data) => {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        if (data.isOnboarding) {
          location.href = "/sign-up-company-info";
        } else {
          location.href = "/home";
        }
      })
      .catch((error) => {
        if (error.code === 301 || error.code === 303) {
          this.emailComponent.changeLayout(error.message);
        } else if (error.code === 302) {
          this.passwordComponent.changeLayout(error.message);
        } else {
          this.emailComponent.changeLayout(error.message);
          this.passwordComponent.changeLayout(error.message);
        }
      });
  }
}

const emailComponent = new EmailComponent(
  document.getElementById("emailElement")
);

const passwordCompoenet = new PasswordComponent(
  document.getElementById("passwordElement")
);

const submitComponent = new SubmitComponent(
  document.getElementById("submitButton")
);

const loginForm = new LoginFormMediator(
  [emailComponent, passwordCompoenet],
  submitComponent
);
