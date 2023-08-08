logScreenView({ screenName: "superpass_account-settings" });
addLogButtonEventListener();
const $emailText = document.querySelector(".email-text");
const $withdrawalButton = document.querySelector(".withdrawal-button");

apiService
  .makeRequest("/auth/b2c/me")
  .then((response) => {
    $emailText.textContent = response.data.email;
  })
  .catch((error) => {
    console.error(error);
  });

const leaveCheckModal = new ConfirmModal(
  document.querySelector(".leave-check-modal")
);
const leaveDoneModal = new AlertModal(
  document.querySelector(".leave-done-modal")
);

$withdrawalButton.addEventListener("click", () => {
  leaveCheckModal.handleShow(true);
});

leaveCheckModal.onConfirm = () => {
  apiService
    .makeRequest("/auth/b2c/withdrawal", {
      method: "DELETE",
    })
    .then(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      leaveDoneModal.handleShow(true);
    })
    .catch((error) => {
      console.error(error);
    });
};

leaveDoneModal.onCheck = () => {
  location.href = "/";
};

const login = () => {
  localStorage.setItem("loginUrl", location.href);
  location.href = "/signup"
};

const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  location.reload();
};

const $loginButton = document.getElementById("loginButton");
const accessToken = localStorage.getItem("accessToken");
$loginButton.textContent = accessToken ? "로그아웃" : "로그인";

$loginButton.addEventListener("click", () => {
  accessToken ? logout() : login();
});

const $profileImage = document.querySelector(".profile-image");
const $mobileMenu = document.querySelector(".navigation-mobile-menu");
const $logoutMenu = document.querySelector(".logout-menu");

const adaptMedia = (isMobile) => {
  $loginButton.style.display = isMobile || !accessToken ? "block" : "none";
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

$logoutMenu.addEventListener("click", () => {
  if (accessToken) {
    logout();
  }
});

Webflow.push(() => {
  document.querySelector("#account").classList.add("current");
});
