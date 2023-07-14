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

const $loginButton = document.getElementById("loginButton");
$loginButton.addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  location.href = "/";
});

Webflow.push(() => {
  document.querySelector("#account").classList.add("current");
});
