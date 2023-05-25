const accessToken = localStorage.getItem("accessToken");
if (!accessToken) redirectMain();

fetchLNB();

logScreenView({ screenName: "superpass_end_detail" });
addLogButtonEventListener();

document.querySelector("#applySuperpass").addEventListener("click", () => {
  location.href = "/home?isApply=true";
});

const params = new URLSearchParams(location.search);
const applicationId = params.get("applicationId");

const makeDateText = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = formattedNumber(date.getMonth() + 1, 2);
  const day = formattedNumber(date.getDate(), 2);
  return `${year}. ${month}. ${day}`;
};

class HiredList {
  constructor(container, element, listItem) {
    this.container = container;
    this.element = element;
    this.listItem = listItem;
  }

  addClonedListItem() {
    const clonedListItem = this.listItem.cloneNode(true);
    this.element.appendChild(clonedListItem);
    return clonedListItem;
  }

  removeAllListItems() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
  }
}

class HiredListItem {
  constructor(element) {
    this.name = element.querySelector("#hiredName");
    this.matchDate = element.querySelector("#hiredMatchDate");
    this.date = element.querySelector("#hiredDate");
  }

  bind(item) {
    this.name.textContent = item.name;
    this.matchDate.textContent = makeDateText(item.matchedAt);
    this.date.textContent = makeDateText(item.hiredAt);
  }
}

class MatchedList {
  constructor(container, element, listItem) {
    this.container = container;
    this.element = element;
    this.listItem = listItem;
  }

  addClonedListItem() {
    const clonedListItem = this.listItem.cloneNode(true);
    this.element.appendChild(clonedListItem);
    return clonedListItem;
  }

  removeAllListItems() {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }
  }
}

class MatchedListItem {
  constructor(element) {
    this.name = element.querySelector("#matchedName");
    this.matchDate = element.querySelector("#matchedDate");
    this.status = element.querySelector("#currentStatus");
  }

  bind(item) {
    this.name.textContent = item.name;
    this.matchDate.textContent = makeDateText(item.matchedAt);
    this.status.textContent = item.status.name;
    this.status.style.background = style.getPropertyValue("--divider");
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 3:
      return "--green20";
    case 4:
      return "--divider";
  }
};

const getEndDateLabel = (status) => {
  switch (status) {
    case 3:
      return "채용 성사일";
    case 4:
      return "취소일";
  }
};

class SuperpassClosedBoardView {
  constructor(
    infoElement,
    analyticsElement,
    historyElement,
    hiredList,
    matchedList
  ) {
    this.position = infoElement.querySelector("#position");
    this.currentStatus = infoElement.querySelector("#currentStatus");
    this.matchUpCount = analyticsElement.querySelector("#matchUpCount");
    this.interviewProcessCount = analyticsElement.querySelector(
      "#interviewProcessCount"
    );
    this.documentPassRate = analyticsElement.querySelector("#documentPassRate");
    this.finalPassRate = analyticsElement.querySelector("#finalPassRate");
    this.proceedDays = analyticsElement.querySelector("#proceedDays");
    this.applicatedAt = analyticsElement.querySelector("#applicatedAt");
    this.endDateLabel = analyticsElement.querySelector("#endDateLabel");
    this.hiredAt = analyticsElement.querySelector("#hiredAt");
    this.hiredList = hiredList;
    this.matchedList = matchedList;
    this.historyElement = historyElement;
  }

  bind(data) {
    this.position.textContent = data.job.name;
    this.currentStatus.textContent = data.status.name;
    this.currentStatus.style.background = style.getPropertyValue(
      getStatusColor(data.status.id)
    );
    this.matchUpCount.textContent = data.analytics.matchupCount + "명";
    this.interviewProcessCount.textContent =
      data.analytics.interviewProcessCount + "명";
    this.documentPassRate.textContent = data.analytics.documentPassRate + "%";
    this.finalPassRate.textContent = data.analytics.finalPassRate + "%";
    this.applicatedAt.textContent = makeDateText(data.analytics.applicatedAt);
    this.endDateLabel.textContent = getEndDateLabel(data.status.id);
    this.hiredAt.textContent = makeDateText(data.analytics.hiredAt);
    if (data.analytics.proceedDays > 0) {
      this.proceedDays.textContent = data.analytics.proceedDays + "일";
      this.proceedDays.style.color = style.getPropertyValue("--ssgsag-blue");
    } else {
      this.proceedDays.textContent = "-";
      this.proceedDays.style.color = style.getPropertyValue("--primary");
    }

    const hiredItems = data.history.hiredApplicant;
    const matchItems = data.history.matchedApplicants;
    this.historyElement.style.display =
      hiredItems == null && !matchItems.length ? "none" : "block";

    if (hiredItems != null) {
      hiredList.removeAllListItems();
      const clonedListItem = this.hiredList.addClonedListItem();
      const listItem = new HiredListItem(clonedListItem);
      listItem.bind(data.history.hiredApplicant);
    } else {
      hiredList.container.style.display = "none";
    }

    matchedList.removeAllListItems();

    for (const item of matchItems) {
      const clonedListItem = this.matchedList.addClonedListItem();
      const listItem = new MatchedListItem(clonedListItem);
      listItem.bind(item);
    }

    if (!matchItems.length) {
      matchedList.container.style.display = "none";
    }
  }
}

const hiredList = new HiredList(
  document.getElementById("hiredElement"),
  document.getElementById("hiredTable"),
  document.getElementById("hiredTableRow")
);

const matchedList = new MatchedList(
  document.getElementById("matchedElement"),
  document.getElementById("matchedTable"),
  document.getElementById("matchedTableRow")
);

const closedBoardView = new SuperpassClosedBoardView(
  document.getElementById("infoElement"),
  document.getElementById("analytics"),
  document.getElementById("historyElement"),
  hiredList,
  matchedList
);

const fetchCloasedSuperpassDetail = (applicationId) => {
  apiService
    .makeRequest(`/superpass/v2/applications/${applicationId}/statistics`)
    .then((response) => {
      closedBoardView.bind(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
};

fetchCloasedSuperpassDetail(applicationId);
Webflow.push(() => {
  document.querySelector("#navigationSuperpass").classList.add("w--current");
});
