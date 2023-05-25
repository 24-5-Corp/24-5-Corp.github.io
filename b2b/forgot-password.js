const accessToken = localStorage.getItem("accessToken");

if (accessToken) redirectMain();

logScreenView({ screenName: "rest-password_email_write" });
addLogButtonEventListener();

class ForgotFormMediator extends FormMediator {
  get data() {
    const [emailComponent] = this.components;
    this.emailComponent = emailComponent;

    return JSON.stringify({
      email: this.emailComponent.value,
    });
  }

  submitForm() {
    apiService
      .makeRequest("/auth/v2/reset-password", {
        method: "POST",
        body: this.data,
      })
      .then((data) => {
        location.href = `/send-email?email=${data.email}&type=password`;
      })
      .catch((error) => {
        this.emailComponent.changeLayout(error.message);
      });
  }
}

const emailComponent = new EmailComponent(
  document.getElementById("emailElement")
);

const submitComponent = new SubmitComponent(
  document.getElementById("submitButton")
);

const forgotForm = new ForgotFormMediator([emailComponent], submitComponent);
