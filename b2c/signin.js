const params = new URLSearchParams(location.search);
const code = params.get("code");

const accessToken = localStorage.getItem("accessToken");
if (accessToken) {
  location.href = "/matches";
}

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
          localStorage.removeItem("applyData");
          localStorage.removeItem("loginUrl");
          location.href = "/matches";
        })
        .catch(() => {
          localStorage.removeItem("loginUrl");
          location.href = `${loginUrl}?alreadyApplied=true`;
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
