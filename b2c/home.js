logScreenView({ screenName: "superpass_landing" });
addLogButtonEventListener();

const fbqElements = document.getElementsByClassName("fbq-event");
for (const element of fbqElements) {
  element.addEventListener("click", () => {
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

  const login = () => {
    localStorage.setItem("loginUrl", location.href);
    location.href = "/signup";
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    location.reload();
  };

  const $loginButton = document.getElementById("loginButton");
  const $dashboardButton = document.getElementById("dashboardButton");
  const accessToken = localStorage.getItem("accessToken");
  $loginButton.textContent = accessToken ? "로그아웃" : "로그인";
  $dashboardButton.style.display = accessToken ? "block" : "none";

  $loginButton.addEventListener("click", () => {
    accessToken ? logout() : login();
  });
  $dashboardButton.addEventListener("click", () => {
    if (accessToken) {
      location.href = "/matches";
    }
  });

  const $profileImage = document.querySelector(".profile-image");
  const $mobileMenu = document.querySelector(".navigation-mobile-menu");
  const $dashboardMenu = document.querySelector(".dashboard-menu");
  const $logoutMenu = document.querySelector(".logout-menu");

  const adaptMedia = (isMobile) => {
    $loginButton.style.display = isMobile || !accessToken ? "block" : "none";
    $dashboardButton.style.display = isMobile && accessToken ? "block" : "none";
    $profileImage.style.display = !isMobile && accessToken ? "block" : "none";
    if (isMobile) {
      $mobileMenu.style.display = "none";
    }
  };

  const media = matchMedia("screen and (min-width: 768px)");

  adaptMedia(media.matches);

  media.addListener((event) => {
    adaptMedia(event.matches);
  });

  $dashboardMenu.addEventListener("click", () => {
    if (accessToken) {
      location.href = "/matches";
    }
  });
  $logoutMenu.addEventListener("click", () => {
    if (accessToken) {
      logout();
    }
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
    fbq("track", "Contact");

    if (!accessToken) {
      location.href = "/apply-superpasss";
      return;
    }

    getApplication().then((response) => {
      if (response.data === null) {
        location.href = "/apply-superpasss";
      } else {
        alreadyAppliedModal.handleShow(true);
      }
    });
  });

  const $bottomButton = document.querySelector(".bottom-start-button");
  $bottomButton.addEventListener("click", () => {
    fbq("track", "Contact");
  });

});
