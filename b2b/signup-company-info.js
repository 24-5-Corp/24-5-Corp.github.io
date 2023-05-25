const accessToken = localStorage.getItem("accessToken");

if (!accessToken) redirectMain();

logScreenView({ screenName: "signup_biz_number" });
addLogButtonEventListener();

class BusinessFormMediator extends FormMediator {
  constructor(components, submitComponent) {
    super(components, submitComponent);

    const [businessNumberComponent] = this.components;
    this.businessNumberComponent = businessNumberComponent;
    this.businessNumberComponent.element.addEventListener(
      "input",
      this.validate.bind(this)
    );
  }

  get data() {
    const [businessNumberComponent] = this.components;
    this.bizNo = businessNumberComponent.value;

    return this.bizNo;
  }

  validate() {
    const isValid = this.businessNumberComponent.isValid;
    this.submitComponent.validate(isValid);
  }

  submitForm() {
    apiService
      .makeRequest(`/auth/v2/company-verify?bizno=${this.data}`, {
        method: "GET",
      })
      .then((data) => {
        location.href = `sign-up-company-info-detail?bizno=${this.data}`;
      })
      .catch((error) => {
        if (error.code === 201) {
          location.href = "/already-join-account";
        } else if (error.code === 202) {
          this.businessNumberComponent.changeLayout(error.message);
        } else {
          console.log(error);
        }
      });
  }
}

const businessNumberComponenet = new BusinessNumberComponent(
  document.getElementById("businessNumberElement")
);

const submitComponent = new SubmitComponent(
  document.getElementById("submitButton")
);
Webflow.push(() => submitComponent.validate(false));

const businessForm = new BusinessFormMediator(
  [businessNumberComponenet],
  submitComponent
);
