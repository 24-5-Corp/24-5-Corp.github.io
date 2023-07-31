const accessToken = localStorage.getItem("accessToken");
if (accessToken) {
  location.href = "/";
}

const $kakaoModalButton = document.querySelector(".kakao-modal-button");
$kakaoModalButton.addEventListener("click", () => {
  Kakao.Auth.authorize({
    redirectUri: `${document.location.origin}/signin`,
  });
});
