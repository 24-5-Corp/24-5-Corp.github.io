const upload = "https://uploads-ssl.webflow.com/64abb259c07028189d10bc82";

const bindDocument = (documents) => {
  const list = document.querySelector(".application-document-list");
  const item = document.querySelector(".application-document-item");

  documents.forEach((document) => {
    const icon = document.documentUrl.endsWith(".pdf")
      ? `${upload}/64abb259c07028189d10bcd6_ic_resume.svg`
      : `${upload}/64abb259c07028189d10bcd5_ic_link.svg`;
    const title = document.type === 0 ? "이력서" : "포트폴리오";

    const clonedItem = item.cloneNode(true);

    clonedItem.querySelector(".document-item-icon").src = icon;
    clonedItem.querySelector(".document-item-title").textContent = title;
    clonedItem.addEventListener("click", () => {
      window.open(document.documentUrl);
    });

    list.appendChild(clonedCV);
  });
};

const mapper = (dto) => {
};
