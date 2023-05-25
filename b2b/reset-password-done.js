const accessToken = localStorage.getItem("accessToken");

if (accessToken) redirectMain();

logScreenView({ screenName: "rest-password_done" });
addLogButtonEventListener();
