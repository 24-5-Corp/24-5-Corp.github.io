const params = new URLSearchParams(location.search);
const code = params.get("code");

const div = document.createElement("div");

apiService
  .makeRequest(`/auth/b2c/authrization?code=${code}`)
  .then((response) => {
    const { accessToken, refreshToken } = response;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    const applyData = localStorage.getItem("applyData");
    if (applyData) {
      apiService
        .makeRequest("/superpass/v2/apply-seeker", {
          method: "POST",
          body: applyData,
        })
        .then((_) => {
          fbq("track", "SubmitApplication");
          logScreenView({ screenName: "superpass_apply_popup_submit" });
          localStorage.removeItem(applyData);
          location.href = "/matches";
        })
        .catch((error) => {
          console.error(error);
          div.textContent += `${error}\n`;
        });
    } else {
      const loginUrl = localStorage.getItem("loginUrl");

      apiService
        .makeRequest("/superpass/v2/apply-seeker", {
          method: "GET",
        })
        .then((response) => {
          if (response.data === null) {
            location.href = `${loginUrl}?isSigned=true`;
          } else {
            location.href = "/matches";
          }
        })
        .catch((error) => {
          console.error(error);
          div.textContent += `${error}\n`;
        });
    }
  })
  .catch((error) => {
    console.error(error);
    div.textContent += `${error}\n`;
  });
