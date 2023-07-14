const params = new URLSearchParams(location.search);
const code = params.get("code");

const fetchApplication = () => {
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
    .catch((error) => console.error(error));
};

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
        .then(() => {
          fbq("track", "SubmitApplication");
          logScreenView({ screenName: "superpass_apply_popup_submit" });
          localStorage.removeItem(applyData);
          location.href = "/matches";
        })
        .catch(() => {
          fetchApplication();
        });
    } else {
      fetchApplication();
    }
  })
  .catch((error) => console.error(error));
