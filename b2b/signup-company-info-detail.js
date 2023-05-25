logScreenView({ screenName: "signup_biz_info" });

const accessToken = localStorage.getItem("accessToken");
const params = new URLSearchParams(location.search);
const bizNo = params.get("bizno");

if (!accessToken || !bizNo) redirectMain();

class SignupCompanyFormMediator extends FormMediator {
  constructor(components, submitComponent, bizNo) {
    super(components, submitComponent);

    this.bizNo = bizNo;
    this.fetchInformation();
  }

  get data() {
    return JSON.stringify({
      bizNo: bizNo,
    });
  }

  validateForm() {
    event.preventDefault();
    event.stopPropagation();

    if (!this.information) return;

    this.submitForm();
  }

  fetchInformation() {
    apiService
      .makeRequest(`/auth/v2/company-verify?bizno=${this.bizNo}`, {
        method: "GET",
      })
      .then((data) => {
        this.information = data;

        this.components[0].element.textContent = String(
          this.information.bizno
        ).replace(/^(\d{3})(\d{2})(\d{5})$/, `$1-$2-$3`);
        this.components[1].element.textContent = this.information.name;
        this.components[2].element.textContent = String(
          this.information.estblishYYYYMMDD
        ).replace(/^(\d{4})(\d{2})(\d{2})$/, `$1.$2.$3`);
        this.components[3].element.textContent = this.information.address;
        this.components[4].element.textContent = this.information.bizCategory;
      })
      .catch((error) => {
        redirectMain();
      });
  }

  submitForm() {
    apiService
      .makeRequest(`/auth/v2/company-verify?bizno=${this.bizNo}`, {
        method: "POST",
        body: this.data,
      })
      .then((data) => {
        location.href = "/home";
      })
      .catch((error) => {
        redirectMain();
      });
  }
}

const businessNumberComponent = new Component(
  document.getElementById("businessNumber")
);

const nameComponent = new Component(document.getElementById("name"));

const establishedDateComponent = new Component(
  document.getElementById("establishedDate")
);

const addressComponent = new Component(document.getElementById("address"));

const businessCategoryComponent = new Component(
  document.getElementById("industry")
);

const submitComponent = new SubmitComponent(
  document.getElementById("submitButton")
);

const signupCompanyForm = new SignupCompanyFormMediator(
  [
    businessNumberComponent,
    nameComponent,
    establishedDateComponent,
    addressComponent,
    businessCategoryComponent,
    submitComponent,
  ],
  submitComponent,
  bizNo
);
