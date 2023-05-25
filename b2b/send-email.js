const accessToken = localStorage.getItem("accessToken");
const params = new URLSearchParams(location.search);
const email = params.get("email");
const type = params.get("type");

if (accessToken || !email || !type) redirectMain();

let endpoint;
let notification;

if (type === "signup") {
  endpoint = "/auth/v2/email-verify";
  notification = "회원가입을 위해 이메일 수신함을 확인해 주세요.";
  logScreenView({ screenName: "signup_email_done" });
} else if (type === "password") {
  endpoint = "/auth/v2/reset-password";
  notification = "비밀번호 재설정을 위해 이메일 수신함을 확인해 주세요.";
  logScreenView({ screenName: "rest-password_email_done" });
}

document.getElementById("notificationLabel").innerHTML =
  "입력하신 주소로 인증 메일 전송이 완료되었습니다.<br />" + notification;

const sendEmail = () => {
  if (type === "signup") {
    logButtonClick({ buttonName: "signup_email_again" });
  } else if (type === "password") {
    logButtonClick({ buttonName: "rest-password_email_again" });
  }

  const data = JSON.stringify({
    email: email,
  });

  apiService
    .makeRequest(endpoint, {
      method: "POST",
      body: data,
    })
    .then(() => {
      alert("인증 메일이 재발송되었습니다.\n" + notification);
    })
    .catch((error) => {
      console.log(error);
    });
};

document.getElementById("emailLabel").textContent = email;
document
  .getElementById("resendEmailButton")
  .addEventListener("click", sendEmail);
