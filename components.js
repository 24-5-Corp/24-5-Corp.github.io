class CollapsibleButton {
  constructor(element) {}
}

class Input {
  key;
  message;
  onInput;

  inputEvent = new CustomEvent("input");

  constructor(element) {
    this._input = element.querySelector(".input");

    this._input.disabled = this._input.classList.contains("disabled");
    this._input.addEventListener("input", () => {
      this.updateValidity(true);
      if (!!this.onInput) this.onInput(this.value);
    });

    this._error = element.querySelector(".error-text");

    this.message = this._error?.textContent;
  }

  get value() {
    return this._input.value;
  }

  set value(value) {
    this._input.value = value;
    this._input.dispatchEvent(this.inputEvent);
  }

  get isValid() {
    return this._input.required ? !!this.value : true;
  }

  validate() {
    this.updateValidity(this.isValid);
  }

  reset() {
    this._input.value = "";
    this.updateValidity(true);
    this._input.dispatchEvent(this.inputEvent);
  }

  updateValidity(isValid) {
    this._showError(isValid);

    this._input.style.borderColor = isValid
      ? style.getPropertyValue("--disabled")
      : style.getPropertyValue("--red");
  }

  _showError(isValid) {
    this._error.style.display = isValid ? "none" : "block";
  }
}

class RegexInput extends Input {
  regex;
  regexMessage;

  extract = (input, value) => {
    return value;
  };
  replace = (input, value) => {
    input.value = value;
  };

  constructor(element) {
    super(element);

    this._input.addEventListener("input", (event) => {
      this.replace(event.target, event.target.value);
    });
  }

  get value() {
    return this.extract(this._input, this._input.value);
  }

  set value(value) {
    this.replace(this._input, value);
    this._input.dispatchEvent(this.inputEvent);
  }

  get isValid() {
    if (!super.isValid) return false;
    else if (!this.value) return true;
    return this.regex.test(this.value);
  }

  validate() {
    if (!super.isValid) this._error.textContent = this.message;
    else if (!this.isValid) this._error.textContent = this.regexMessage;

    super.validate();
  }
}

class Dropdown extends Input {
  isConditioned = false;

  constructor(element) {
    super(element);

    this._input.readOnly = true;

    this._dropdown = element.querySelector(".dropdown");
    this._toggle = element.querySelector(".dropdown-toggle");
    this._toggle.style.pointerEvents = "";

    this._list = element.querySelector(".dropdown-list");
    this._item = this._list.firstChild;

    this.reset();
  }

  get value() {
    if (!this._input.model) return "";
    return this._input.model.id;
  }

  set value(id) {
    const item = [...this._list.children].find((item) => item.model.id == id);

    if (!item) {
      this._input.model = undefined;
      this._input.value = "";

      return;
    }

    this._input.model = item.model;
    this._input.value = item.model.name;
    this._input.dispatchEvent(this.inputEvent);
  }

  reset() {
    while (this._list.hasChildNodes()) {
      this._list.removeChild(this._list.firstChild);
    }

    this.value = undefined;

    super.reset();
  }

  get isValid() {
    return this._input.required ? this.value !== "" : true;
  }

  bind(models) {
    this.reset();

    for (const model of models) {
      const item = this._item.cloneNode(true);
      item.model = model;
      item.textContent = model.name;

      const close = new Event("w-close");
      item.addEventListener("click", () => {
        this._dropdown.dispatchEvent(close);

        if (this.value === model.id) return;

        this.value = model.id;
      });

      this._list.appendChild(item);
    }
  }
}

class ConditionedDropdown extends Dropdown {
  onReset = () => {};

  constructor(element, target) {
    super(element);

    this._toggle.style.pointerEvents = "none";

    this._target = target;

    this._target._input.addEventListener("input", () => {
      this.reset();
      this.onReset();
    });
  }

  reset() {
    if (this._target) {
      const isTargetValid =
        !this._target.isConditioned ||
        (this._target.isValid && this._input.required);

      isTargetValid
        ? this._input.classList.replace("conditioned", "enabled")
        : this._input.classList.replace("enabled", "conditioned");

      this._toggle.style.pointerEvents = isTargetValid ? "" : "none";
    }

    super.reset();
  }
}

class ImageUpload extends Input {
  _file = "";
  _canUpload = true;

  constructor(element) {
    super(element);

    this._input.type = "file";
    this._input.accept = "image/png, image/jpeg";

    this._input.addEventListener("change", (event) => {
      this._loadImage(event.target.files[0]);
    });

    this._image = element.querySelector(".uploaded-image");

    this._image.onerror = () => {
      this._canUpload = false;
      this._image.src = image.error;
      this._file = "";
    };

    this._upload = element.querySelector(".upload-image");

    this._upload.addEventListener("click", () => {
      this._input.click();
    });

    this._delete = element.querySelector(".delete-image");

    if (!this._delete) return;
    this._delete.addEventListener("click", () => {
      this.reset();
    });
  }

  get value() {
    return !this._canUpload ? "" : this._file;
  }

  set value(src) {
    if (!src) return this.reset();
    this._image.src = src;
    this._image.style.borderStyle = "solid";
    this._input.dispatchEvent(this.inputEvent);
  }

  get isValid() {
    if (!this._canUpload) return false;
    if (!this._input.required) return true;

    return this._image.src !== image.placeholder;
  }

  _loadImage(file) {
    const fileReader = new FileReader();

    this._file = file;
    this._canUpload = true;

    fileReader.onload = () => {
      this.value = fileReader.result;
    };
    fileReader.readAsDataURL(file);
  }

  reset() {
    this._file = "";
    this._canUpload = true;
    this._image.style.borderStyle = "dashed";
    this.value = image["placeholder"];

    super.reset();
    this.updateValidity(true);
  }

  updateValidity(isValid) {
    super._showError(isValid);

    this._image.style.borderColor = isValid
      ? style.getPropertyValue("--silhouette")
      : style.getPropertyValue("--red");
  }
}

class SkillSearch extends Input {
  constructor(element) {
    super(element);

    this.dropdownField = element.querySelector("#skillDropdownField");

    this.dropdown = element.querySelector("#skillDropdown");
    this.dropdownItem = element.querySelector("#skillDropdownItem");
    this.dropdown.removeChild(this.dropdownItem);

    this.list = element.querySelector("#skillList");
    this.listItem = element.querySelector("#skillListItem");
    this.list.removeChild(this.listItem);

    this.input = element.querySelector("#skillInput");
    this.input.addEventListener("input", (event) => {
      this.handleDropdown(event.target.value, "input");
    });
    this.input.addEventListener("click", (event) => {
      this.handleDropdown(event.target.value, "click");
    });

    document.querySelector("body").addEventListener("click", (event) => {
      const isOuter = !this.dropdownField.contains(event.target);

      if (isOuter) this.dropdown.style.display = "none";
    });
  }

  handleDropdown(value, event) {
    if (!value) return (this.dropdown.style.display = "none");

    if (event === "input") this.fetchSkills(value);
    else this.dropdown.style.display = "block";
  }

  removeAllDropdownItem() {
    while (this.dropdown.hasChildNodes()) {
      this.dropdown.removeChild(this.dropdown.firstChild);
    }
  }

  removeAllListItem() {
    while (this.list.hasChildNodes()) {
      this.list.removeChild(this.list.firstChild);
    }
  }

  fetchSkills(query) {
    apiService
      .makeRequest(`/common/v2/skill?query=${query}`)
      .then((response) => {
        this.removeAllDropdownItem();

        for (const skill of response.data) {
          this.appendDropdownItem(skill);
        }
        this.appendDropdownItem({ name: query });

        this.dropdown.style.display = "block";
      })
      .catch((error) => {
        console.error(error);
      });
  }

  appendDropdownItem(skill) {
    const dropdownItem = this.dropdownItem.cloneNode(true);

    dropdownItem.skill = skill;

    dropdownItem.textContent = skill.id
      ? skill.name
      : `항목추가: ${skill.name}`;

    dropdownItem.addEventListener("click", (event) => {
      this.dropdown.style.display = "none";
      this.dropdown.value = "";
      this.input.value = "";
      this.appendListItem(event.target.skill);
    });

    this.dropdown.appendChild(dropdownItem);
  }

  appendListItem(skill) {
    const listItem = this.listItem.cloneNode(true);

    listItem.skill = skill;

    const nameLabel = listItem.querySelector("#skillName");
    const deleteButton = listItem.querySelector("#skillDelete");

    nameLabel.textContent = skill.name;

    deleteButton.addEventListener("click", () => {
      this.list.removeChild(listItem);
      this._input.dispatchEvent(this.inputEvent);
    });

    this.list.appendChild(listItem);
    this._input.dispatchEvent(this.inputEvent);
  }

  get isValid() {
    return this.list.children.length !== 0;
  }

  get value() {
    let data = {
      ids: [],
      newSkills: [],
    };

    for (const listItem of this.list.children) {
      if (listItem.skill.id) {
        data.ids.push(listItem.skill.id);
      } else {
        data.newSkills.push(listItem.skill.name);
      }
    }

    //if (data.ids.length === 0 && data.newSkills.length === 0) return;
    return data;
  }

  reset() {
    this._input.value = "";
    this.removeAllDropdownItem();
    this.removeAllListItem();

    super.reset();
  }

  updateValidity(isValid) {
    this._showError(isValid);

    this.input.style.borderColor = isValid
      ? style.getPropertyValue("--disabled")
      : style.getPropertyValue("--red");
  }
}

class ConfirmInput extends Input {
  constructor(element, target) {
    super(element);

    this._target = target;
  }

  get isValid() {
    return this.value === this._target.value;
  }
}

class Tab {
  onSelect;

  constructor(element) {
    this._tab = element;

    this._tab.addEventListener("click", this.handleSelect.bind(this));
  }

  handleSelect() {
    if (this._tab.classList.contains("w--current")) return;

    this.onSelect();
  }
}

class Form {
  onSubmit;

  constructor(element, components) {
    this._submit = element.querySelector(".submit-form");
    this._submit.addEventListener("click", (event) => {
      this.handleSubmit(event);
    });

    this._components = components;
  }

  reset() {
    this._components.forEach((component) => component.reset());
  }

  get isValid() {
    return !this._components.some((component) => !component.isValid);
  }

  validate() {
    this._components.forEach((component) => component.validate());
  }

  get value() {
    const data = {};
    for (const component of this._components) {
      const isValid = component.key && !component._input.disabled;
      if (isValid) data[component.key] = component.value;
    }

    return JSON.stringify(data);
  }

  set value(model) {
    for (const component of this._components) {
      component.value = model.hasOwnProperty(component.key)
        ? model[component.key]
        : "";
    }
  }

  get isEnabled() {
    this._submit.classList.contains("enabled");
  }

  set isEnabled(isEnable) {
    if (isEnable) this._submit.classList.replace("disabled", "enabled");
    else this._submit.classList.replace("enabled", "disabled");

    this._submit.disabled = this._submit.classList.contains("disabled");
  }

  handleSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    this.onSubmit();
  }
}

class MultipartForm extends Form {
  get value() {
    const formData = new FormData();
    for (const component of this._components) {
      const isValid = component.key && !component._input.disabled;
      if (isValid) formData.append(component.key, component.value);
    }

    return formData;
  }

  set value(model) {
    super.value = model;
  }
}

class Modal {
  onClose = () => {};

  constructor(element) {
    this._modal = element;
    this._title = element.querySelector(".basic-modal-title");
  }

  handleShow(isShow) {
    document.body.style.height = isShow ? "100%" : "";
    // START
    document.body.style.overflow = isShow ? "hidden" : "auto";
    // END

    this._modal.style.display = isShow ? "flex" : "none";
    this._modal.scrollTo(0, 0);
  }

  get title() {
    return this._title.textContent;
  }

  set title(value) {
    this._title.textContent = value;
  }
}

class AlertModal extends Modal {
  onCheck = () => {};

  constructor(element) {
    super(element);

    this._check = element.querySelector("#check");
    this._check.addEventListener("click", () => {
      this.handleShow(false);
      this.onCheck();
    });
  }
}

class ConfirmModal extends Modal {
  onConfirm;

  constructor(element) {
    super(element);

    this._cancel = element.querySelector("#cancel");
    this._cancel.addEventListener("click", () => {
      this.handleShow(false);
      this.onClose();
    });

    this._confirm = element.querySelector("#confirm");
    this._confirm.addEventListener("click", () => {
      this.handleShow(false);
      this.onConfirm();
    });
  }
}

class PromptModal extends Modal {
  onShow = () => {};

  constructor(element, prompt) {
    super(element);

    this._close = element.querySelector("#close");
    this._close.addEventListener("click", () => {
      this.handleShow(false);
      this.onClose();
    });

    this._prompt = prompt;
  }

  handleShow(isShow) {
    if (isShow) this.onShow();
    if (!isShow) this._prompt.reset();
    this._prompt.isEnabled = false;

    super.handleShow(isShow);
  }
}

class Component {
  constructor(element) {
    this.element = element;
    this.event = new CustomEvent("input");
  }
}

class InputComponent extends Component {
  constructor(element) {
    super(element);

    const [, input, error] = element.children;
    this.input = input;
    this.error = error;
  }

  get value() {
    return this.input.value;
  }

  validate() {
    return false;
  }

  changeLayout(reason) {
    this.input.style.borderColor = reason
      ? style.getPropertyValue("--red")
      : style.getPropertyValue("--disabled");
    this.error.style.display = reason ? "block" : "none";
    this.error.textContent = reason;
  }

  reset() {
    this.input.value = "";
  }
}

class RegexInputComponent extends InputComponent {
  regex;
  message;

  get isValid() {
    return this.regex.test(this.value);
  }

  validate() {
    this.changeLayout(this.isValid ? undefined : this.message);
    return this.isValid;
  }
}

class EmailComponent extends RegexInputComponent {
  regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  message = "올바른 이메일 주소를 입력해주세요.";
}

class PasswordComponent extends RegexInputComponent {
  regex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,20}$/;
  message = "올바른 비밀번호를 입력해주세요.";
}

class WebsiteComponent extends RegexInputComponent {
  regex =
    /^((http(s?))\:\/\/)([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/;
  message = "웹사이트 URL을 확인해주세요.";
}

class NameComponent extends RegexInputComponent {
  message = "2~30자 이내로 입력해주세요.";

  get isValid() {
    const length = this.input.value.length;
    return 2 <= length && length <= 30;
  }
}

class ConfirmComponent extends RegexInputComponent {
  message = "비밀번호와 일치하지 않아요.";

  constructor(element, target) {
    super(element);

    this.target = target;
  }

  get isValid() {
    return this.input.value && this.input.value === this.target.input.value;
  }
}

class PhoneNumberComponent extends RegexInputComponent {
  regex = /^01([0|1|6|7|8|9])([0-9]{7,8})$/;
  message = "올바른 전화번호를 입력해주세요.";

  constructor(element) {
    super(element);

    this.input.addEventListener("input", this.replace.bind(this));
  }

  get value() {
    return this.input.value.replace(/-/g, "");
  }

  replace(event) {
    event.target.value = event.target.value
      .replace(/[^0-9]/g, "")
      .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
  }
}

class BusinessNumberComponent extends RegexInputComponent {
  regex = /^[0-9]{10}$/;

  constructor(element) {
    super(element);

    this.input.addEventListener("input", this.replace.bind(this));
  }

  get value() {
    return this.input.value.replace(/-/g, "");
  }

  replace(event) {
    event.target.value = event.target.value
      .replace(/[^0-9]/g, "")
      .substring(0, 10)
      .replace(/^(\d{3})(\d{2})(\d{1,})$/, `$1-$2-$3`);
  }
}

class SubmitComponent extends Component {
  constructor(element) {
    super(element);
    this.validate(true);
  }

  validate(isValid) {
    this.element.disabled = !isValid;
    if (!this.element.disabled) {
      this.element.classList.remove("disabled");
    } else {
      this.element.classList.add("disabled");
    }
  }
}

class CheckFormComponent {
  constructor(allCheckBox, necessaries, optionals, submitComponent) {
    this.allCheckBox = allCheckBox;
    this.necessaries = necessaries;
    this.optionals = optionals;
    this.submitComponent = submitComponent;
    this.checkBoxes = [...necessaries, ...optionals];

    this.allCheckBox.addEventListener("click", this.checkAll.bind(this));
    for (const checkBox of this.checkBoxes) {
      checkBox.addEventListener("click", this.check.bind(this, checkBox));
    }
  }

  get isCheckedAll() {
    for (const checkBox of this.checkBoxes) {
      if (!checkBox.checked) return false;
    }
    return true;
  }

  get isValid() {
    for (const checkBox of this.necessaries) {
      if (!checkBox.checked) return false;
    }
    return true;
  }

  validate() {
    this.allCheckBox.checked = this.isCheckedAll;
    this.submitComponent.validate(this.isValid);
    return this.isValid;
  }

  checkAll() {
    const isChecked = this.allCheckBox.checked;
    for (const checkBox of this.checkBoxes) {
      checkBox.checked = isChecked;
    }
    this.validate();
  }

  check(checkBox) {
    this.isCheckedAll;
    this.validate();
  }
}

class FormMediator {
  constructor(components, submitComponent) {
    this.components = components;
    this.submitComponent = submitComponent;

    this.submitComponent.element.addEventListener(
      "click",
      this.validateForm.bind(this)
    );
  }

  get isValid() {
    let isLeastOneInvalid = false;
    for (const component of this.components) {
      if (!component.validate()) isLeastOneInvalid = true;
    }
    return !isLeastOneInvalid;
  }

  validateForm(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isValid) this.submitForm();
  }

  submitForm() {
    return;
  }
}

class DropdownComponent extends InputComponent {
  constructor(element) {
    super(element);

    this.navElement = element.getElementsByTagName("nav")[0];
    this.toggleElement = element.querySelector(".w-dropdown-toggle");
    this.placeholder = this.toggleElement.children[0];
    this.listElement = this.navElement.children[0];
    this.navElement.innerHTML = "";
  }

  bind(items) {
    this.navElement.innerHTML = "";
    for (const item of items) {
      const colnedElement = this.listElement.cloneNode(true);
      colnedElement.item = item;
      colnedElement.textContent = item.name;
      this.navElement.appendChild(colnedElement);

      colnedElement.addEventListener("click", (event) => {
        const closeEvent = document.createEvent("Event");
        closeEvent.initEvent("w-close", false, true);
        this.input.dispatchEvent(closeEvent);

        if (this.toggleElement.textContent === event.target.textContent) return;

        this.toggleElement.item = event.target.item;
        this.toggleElement.textContent = event.target.textContent;
        this.element.dispatchEvent(this.event);
      });
    }
  }

  get isValid() {
    return this.toggleElement.childElementCount === 0;
  }

  get value() {
    return this.toggleElement.item.id;
  }

  validate() {
    return this.isValid;
  }

  reset() {
    this.toggleElement.style.backgroundColor = "white";
    this.toggleElement.innterHTML = "";
    this.toggleElement.textContent = "";
    this.toggleElement.appendChild(this.placeholder);
  }
}

class CommonFormMediator extends FormMediator {
  fetchedData = {};

  get isValid() {
    for (const component of this.components) {
      if (!component.isValid) return false;
    }
    return true;
  }

  validate() {
    this.submitComponent.validate(this.isValid);
  }

  fetch(type, index, query) {
    let endpoint = `/common/v2/${type}`;
    if (query) endpoint += `${query}`;

    apiService.makeRequest(endpoint, { method: "GET" }).then((response) => {
      this.fetchedData[type] = response["data"];
      this.components[index].bind(this.fetchedData[type]);
    });
  }
}

class List extends Component {
  constructor(element, listItem) {
    super(element);

    this.listItem = listItem;

    this.removeAllListItems();
  }

  addClonedListItem() {
    const clonedListItem = this.listItem.cloneNode(true);
    this.element.appendChild(clonedListItem);
    return clonedListItem;
  }

  removeListItem(listItem) {
    this.element.removeChild(listItem);
  }

  removeAllListItems() {
    while (this.element.firstChild) {
      this.removeListItem(this.element.firstChild);
    }
  }
}

class SuperpassListView {
  onClick = () => {};
  onCancel = () => {};

  constructor(list, emptyElement, countElement) {
    this.list = list;
    this.emptyElement = emptyElement;
    this.countElement = countElement;
  }

  bind(model) {
    this.list.element.style.display = model.totalCount ? "flex" : "none";
    this.emptyElement.style.display = !model.totalCount ? "flex" : "none";

    if (this.countElement) this.countElement.textContent = model.totalCount;

    this.list.removeAllListItems();

    for (const item of model.data) {
      const clonedElement = this.list.addClonedListItem();
      const listItem = new SuperpassListItem(clonedElement);
      listItem.onClick = this.onClick;
      listItem.onCancel = this.onCancel;

      listItem.bind(item);
    }
  }
}

class SuperpassListItem extends Component {
  onClick = () => {};
  onCancel = () => {};

  url = "https://uploads-ssl.webflow.com/63c8d327fd47ec5c98895dc4";
  statusColors = ["", "--yellow20", "--red20", "--green20", "--divider"];
  images = [
    "",
    this.url + "/63f32669ca4bd86144f0d827_ic_job_marketing.svg",
    this.url + "/63f32668eb2bb28c110bdbb8_ic_job_dev.svg",
    this.url + "/63f3266849b46c8685ccd014_ic_job_plan.svg",
    this.url + "/63f326692e8890a53cd7285e_ic_job_design.svg",
  ];

  constructor(element) {
    super(element);

    this.newBadge = this.element.querySelector("#newBadge");
    this.jobGroupIcon = this.element.querySelector("#jobGroupIcon");
    this.jobGroup = this.element.querySelector("#jobGroupBadge");
    this.position = this.element.querySelector("#position");

    this.startDate = this.element.querySelector("#startDate");
    this.dateDivider = this.element.querySelector("#dateDivider");
    this.endDate = this.element.querySelector("#endDate");

    this.documentCount = this.element.querySelector("#documentCount");
    this.interviewCount = this.element.querySelector("#interviewCount");

    this.currentStatus = this.element.querySelector("#currentStatus");
    this.moreButton = this.element.querySelector("#moreButton");
    this.cancelButton = this.element.querySelector("#cancelButton");
    this.cancelButton.style.display = "none";

    this.moreButton.addEventListener("click", () => {
      const isHidden = this.cancelButton.style.display === "none";
      this.cancelButton.style.display = isHidden ? "flex" : "none";
    });

    document.querySelector("body").addEventListener("click", (event) => {
      const isOuter =
        !this.cancelButton.contains(event.target) &&
        !this.moreButton.contains(event.target);

      if (isOuter) this.cancelButton.style.display = "none";
    });
  }

  bind(item) {
    this.id = item.id;

    this.newBadge.style.display = item.isNew ? "block" : "none";
    this.jobGroupIcon.src = this.images[item.jobGroup.id];
    this.jobGroup.textContent = item.jobGroup.name;
    this.position.textContent = item.job.name;

    this.startDate.textContent = makeDate(item.createdAt, "신청");
    if (item.status.id === 3) {
      this.endDate.textContent = makeDate(item.updatedAt, "완료");
    } else if (item.status.id === 4 || item.status.id === 100) {
      this.endDate.textContent = makeDate(item.updatedAt, "취소");
    } else {
      this.dateDivider.style.display = "none";
      this.endDate.style.display = "none";
    }

    const isClosed =
      item.status.id === 3 || item.status.id === 4 || item.status.id === 100;
    this.element.querySelector(".div-block-40").style.display = isClosed
      ? "none"
      : "flex";
    this.documentCount.textContent = item.stage.documentStage;
    this.interviewCount.textContent = item.stage.interviewStage;

    this.currentStatus.textContent = item.status.name;
    this.currentStatus.style.background = style.getPropertyValue(
      this.statusColors[item.status.id]
    );

    this.moreButton.style.display = item.status.id < 3 ? "block" : "none";

    this.cancelButton.addEventListener("click", () => {
      this.onCancel(item);
    });

    this.element.addEventListener("click", (event) => {
      if (
        this.moreButton.contains(event.target) ||
        this.cancelButton.contains(event.target)
      )
        return;

      this.onClick(item);
    });
  }
}

class Checkbox extends Input {
  constructor(element) {
    super(element);

    this._label = element.querySelector("span");
    this._check = element.querySelector("input");
    this._check.addEventListener("input", () => {
      this._input.dispatchEvent(this.inputEvent);
    });
  }

  get value() {
    return this._check.checked;
  }

  set value(checked) {
    this._check.checked = checked;
    if (!checked) {
      this._input.classList.remove("w--redirected-checked");
    }
    this._input.dispatchEvent(this.inputEvent);
  }

  get isValid() {
    return this._check.checked;
  }

  reset() {
    this.value = false;

    super.reset();
  }

  bind(label) {
    this._label.textContent = label;
  }

  updateValidity(isValid) {
    this._showError(isValid);
  }
}

class CheckboxGroup extends Input {
  maxCount;

  constructor(element) {
    super(element);

    this.element = element;
    this._checkbox = element.querySelector(".checkbox");
    this._error = element.querySelector(".error-text");

    removeAllChildren(this._input);
  }

  reset() {
    [...this._input.children].forEach((child) => new Checkbox(child).reset());
  }

  bind(models) {
    removeAllChildren(this._input);
    this.reset();

    for (const model of models) {
      const cloned = this._checkbox.cloneNode(true);
      cloned.key = model.id;

      const checkbox = new Checkbox(cloned);
      checkbox.bind(model.name);
      checkbox._check.addEventListener("input", (event) => {
        const children = [...this._input.children];

        if (this.maxCount) {
          if (this.maxCount === this.count && checkbox.value) {
            children.forEach((child) => {
              const input = child.querySelector("input");
              if (!input.checked) input.disabled = true;
            });
          } else {
            children.forEach((child) => {
              child.querySelector("input").disabled = false;
            });
            this._input.dispatchEvent(this.inputEvent);
          }
        } else {
          this._input.dispatchEvent(this.inputEvent);
        }
      });

      this._input.appendChild(cloned);
    }
  }

  get value() {
    let data = {};
    data[this.key] = [];

    for (const checkbox of this._input.children) {
      if (checkbox.querySelector("input").checked) {
        data[this.key].push(checkbox.key);
      }
    }

    return data;
  }

  get isValid() {
    return this.value[this.key].length !== 0;
  }

  get count() {
    const checked = [...this._input.children].filter(
      (checkbox) => checkbox.querySelector("input").checked
    );
    return checked.length;
  }
}
