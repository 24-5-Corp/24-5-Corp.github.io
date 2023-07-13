logScreenView({ screenName: "superpass_landing" });
addLogButtonEventListener();

const fbqElements = document.getElementsByClassName("fbq-event");
for (const element of fbqElements) {
  element.addEventListener("click", () => {
    fbq("track", "StartTrial");
    gtag("event", "conversion", {
      send_to: "AW-759394218/8-vECLCkrZQYEKrfjeoC",
      value: 1000.0,
      currency: "KRW",
    });
  });
}

class Popup {
  onLeftClick = () => {};
  onRightClick = () => {};

  constructor(element) {
    this._popup = element;

    this._left = this._popup.querySelector(".left");
    this._left.addEventListener("click", () => this.onLeftClick());

    this._right = this._popup.querySelector(".right");
    this._right.addEventListener("click", () => this.onRightClick());
  }

  handleShow(isShow) {
    document.body.style.height = isShow ? "100%" : "";
    document.body.style.overflow = isShow ? "hidden" : "auto";

    this._popup.style.display = isShow ? "flex" : "none";
    this._popup.scrollTo(0, 0);
  }
}

Webflow.push(() => {
  const popup = new Popup(document.querySelector(".popup"));
  popup.onLeftClick = () => popup.handleShow(false);
  popup.onRightClick = () => (location.href = "/apply-superpasss");

  const loginWithKakao = () => {
    localStorage.setItem("loginUrl", location.href);
    Kakao.Auth.authorize({
      redirectUri: "https://superpass-web-1-0-0.webflow.io/signin",
    });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    location.reload();
  };

  const $loginButton = document.getElementById("loginButton");
  const accessToken = localStorage.getItem("accessToken");
  $loginButton.textContent = accessToken ? "로그아웃" : "로그인 / 가입";

  $loginButton.addEventListener("click", () => {
    accessToken ? logout() : loginWithKakao();
  });

  const getApplication = async () => {
    return await apiService.makeRequest("/superpass/v2/apply-seeker", {
      method: "GET",
    });
  };

  const notAppliedModal = new AlertModal(
    document.querySelector(".not-applied-modal")
  );
  notAppliedModal.onCheck = () => {
    location.href = "/apply-superpasss";
  };

  const alreadyAppliedModal = new AlertModal(
    document.querySelector(".already-applied-modal")
  );
  alreadyAppliedModal.onCheck = () => {
    location.href = "/matches";
  };

  const params = new URLSearchParams(location.search);
  const isSigned = params.get("isSigned");

  if (isSigned) {
    getApplication().then((response) => {
      if (response.data === null) {
        notAppliedModal.handleShow(true);
      } else {
        location.href = "/matches";
      }
    });
  }

  const $applyButton = document.querySelector(".title-start-button");
  $applyButton.addEventListener("click", () => {
    if (!accessToken) location.href = "/apply-superpasss";

    getApplication().then((response) => {
      if (response.data === null) {
        location.href = "/apply-superpasss";
      } else {
        alreadyAppliedModal.handleShow(true);
      }
    });
  });
});
