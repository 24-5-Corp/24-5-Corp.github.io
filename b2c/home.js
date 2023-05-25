logScreenView({ screenName: "superpass_landing" });
addLogButtonEventListener();

const fbqElements = document.getElementsByClassName("fbq-event");
for (const element of fbqElements) {
  element.addEventListener("click", () => {
    fbq("track", "StartTrial");
    gtag("event", "conversion", {
      send_to: "AW-759394218/8-vECLCkrZQYEKrfjeoC",
      value: 1000.0,
      currency: "KRW",
    });
  });
}
