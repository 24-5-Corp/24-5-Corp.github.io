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
    const reviewData = localStorage.getItem("reviewData");

    localStorage.removeItem("applyData");
    localStorage.removeItem("reviewData");
    localStorage.removeItem("loginUrl");

    if (applyData) {
      apiService
        .makeRequest("/superpass/v2/apply-seeker", {
          method: "POST",
          body: applyData,
        })
        .then(() => {
          location.href = "/matches";
        })
        .catch(() => {
          location.href = `${loginUrl}?alreadyApplied=true`;
        });
    } else if (reviewData) {
      apiService
        .makeRequest("/superpass/v2/document-review", {
          method: "POST",
          body: reviewData,
        })
        .then(() => {
          location.href = "/score-result";
        })
        .catch(() => {
          location.href = `${loginUrl}?alreadyApplied=true`;
        });
    } else {
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
    }
  })
  .catch((error) => console.error(error));
