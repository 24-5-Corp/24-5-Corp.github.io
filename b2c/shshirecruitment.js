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
