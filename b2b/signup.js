const accessToken = localStorage.getItem("accessToken");

if (accessToken) redirectMain();

logScreenView({ screenName: "signup" });
addLogButtonEventListener();

class EmailFormMediator extends FormMediator {
  get data() {
    const [emailComponent] = this.components;
    this.emailComponent = emailComponent;

    return JSON.stringify({
      email: this.emailComponent.value,
    });
  }

  submitForm() {
    apiService
      .makeRequest("/auth/v2/email-verify", {
        method: "POST",
        body: this.data,
      })
      .then((data) => {
        location.href = `/send-email?email=${data.email}&type=signup`;
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

const emailForm = new EmailFormMediator([emailComponent], submitComponent);
