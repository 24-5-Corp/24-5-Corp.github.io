const logScreenView = (value) => {
  gtag("event", "screen_view", {
    screen_name: value.screenName,
    status: value.status,
  });
};

const removeAllChildren = (node) => {
  while (node.hasChildNodes()) {
    node.removeChild(node.firstChild);
  }
};

const logButtonClick = (element) => {
  gtag("event", "button_click", {
    button_name: element.getAttribute("event-button-name"),
    where: element.getAttribute("event-where"),
  });
};

const addLogButtonEventListener = () => {
  const buttonElements = document.getElementsByClassName("ga-event");
  for (const element of buttonElements) {
    element.addEventListener("click", () => {
      logButtonClick(element);
    });
  }
};

const resource = "https://uploads-ssl.webflow.com/63c8d327fd47ec5c98895dc4/";

const image = {
  placeholder: resource + "63e3705d8bcb22255f776c78_img_upload_default.svg",
  error: resource + "6406e35cf93ac3dca03b1ad6_img_upload_error.svg",
};

const regex = {
  password: /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,20}$/,
  phoneNumber: /^01([0|1|6|7|8|9])([0-9]{7,8})$/,
  website:
    /^((http(s?))\:\/\/)([0-9a-zA-Z\-]+\.)+[a-zA-Z]{2,6}(\:[0-9]+)?(\/\S*)?$/,
  date: /^\d{4}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])$/,
  email:
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
};

const redirectMain = (href) => {
  alert("비정상적인 접근입니다.");
  if (!href) location.href = "/";
  else location.href = href;
};

const formattedNumber = (number, count) => {
  return ([...Array(count).keys()].map(() => "0") + number.toString()).slice(
    -count
  );
};

const makeDate = (dateString, postfix, includesTimes = false) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = formattedNumber(date.getMonth() + 1, 2);
  const day = formattedNumber(date.getDate(), 2);
  if (includesTimes) {
    const hours = formattedNumber(date.getHours(), 2);
    const minutes = formattedNumber(date.getMinutes(), 2);

    return `${year}.${month}.${day} ${hours}:${minutes}${postfix}`;
  } else {
    return `${year}.${month}.${day} ${postfix}`;
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const adjustOverflow = () => {
  document.body.style.height = "100%";
  document.body.style.overflow = "hidden";
};

const fetchLNB = () => {
  apiService.makeRequest("/auth/v2/company").then((response) => {
    document.querySelector(".site-name").textContent = response.data.name;
    if (!!response.data.thumbnailUrl)
      document.querySelector(".image-6").src = response.data.thumbnailUrl;
  });

  apiService.makeRequest("/auth/v2/me").then((response) => {
    document.querySelector(".setting-modal-name").textContent =
      response.data.name;
    document.querySelector(".text-block-21").textContent = response.data.email;
  });
};

// Component
const style = getComputedStyle(document.documentElement);

const initCollapsibleButton = () => {
  var coll = document.querySelector(".collapsiblebutton");
  var i;
  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }
};
