const params = new URLSearchParams(location.search);
const code = params.get("code");

apiService
  .makeRequest(`/auth/b2c/authrization?code=${code}`)
  .then((response) => {
    const { accessToken, refreshToken } = response;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    const loginUrl = localStorage.getItem("loginUrl");

    const applyData = localStorage.getItem("applyData");
    if (applyData) {
      apiService
        .makeRequest("/superpass/v2/apply-seeker", {
          method: "POST",
          body: applyData,
        })
        .then(() => {
<<<<<<< Updated upstream
          localStorage.removeItem(applyData);
=======
          fbq("track", "SubmitApplication");
          logScreenView({ screenName: "superpass_apply_popup_submit" });
          localStorage.removeItem("applyData");
          localStorage.removeItem("loginUrl");

>>>>>>> Stashed changes
          location.href = "/matches";
        })
        .catch(() => {
          localStorage.removeItem("loginUrl");
          location.href = `${loginUrl}?isSigned=true`;
        });
    } else {
      apiService
        .makeRequest("/superpass/v2/apply-seeker", {
          method: "GET",
        })
        .then((response) => {
          if (response.data === null) {
            localStorage.removeItem("loginUrl");
            location.href = `${loginUrl}?isSigned=true`;
          } else {
            location.href = "/matches";
          }
        })
        .catch((error) => console.error(error));
    }
  })
  .catch((error) => console.error(error));
