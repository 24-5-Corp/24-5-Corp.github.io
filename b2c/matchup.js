class RadioGroup extends RegexInput {
  constructor(element) {
    super(element);

    this._input.disabled = true;

    this._buttons = element.querySelectorAll("label div");
    this._radios = element.querySelectorAll("label input");
    this._input.reasonIds = [];

    for (const radio of this._radios) {
      radio.addEventListener("input", (event) => {
        const reasonId = parseInt(event.target.id);
        this._input.reasonIds = [reasonId];

        this._input.dispatchEvent(this.inputEvent);
      });
    }
  }

  get isValid() {
    return this._input.reasonIds.length !== 0;
  }

  reset() {
    for (const button of this._buttons) {
      button.classList.remove("w--redirected-checked");
    }
    for (const radio of this._radios) {
      radio.checked = false;
    }
  }
}

// NOTE: const
const applyStatusTypes = {
  prepare: 0,
  apply: 1,
  registeredPool: 2,
  complated: 3,
  cancelled: 4,
  reject: 5,
};

const filterTypes = {
  all: 0,
  success: 1,
  history: 2,
};

const recruitmentTypes = {
  newcomer: 0,
  experimental: 1,
  transitional: 2,
};

const matchupStatusTypes = {
  suggestionTalent: 10,
  reviewDocument: 10,
  refuseDocument: 11,
  timeoutReviewDocument: 12,

  passDocument: 20,
  requestInterview: 20,
  refuseInterview: 21,
  timeoutRequestInterview: 22,

  acceptInterview: 30,
  inprogressInterview: 30,
  failInterview: 31,

  passInterview: 40,
  requestJoin: 40,
  refuseJoin: 41,

  acceptRequestJoin: 50,
  recruitComplete: 50,
  cancelled: 100,
};

// NOTE: api
class MockApiService {
  applyStatusDto = {
    applyStatus: 0,
  };

  matchupDto = {
    totalCount: 0,
    data: [],
  };

  makeRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
  };

  makeRequest = async (endpoint, options = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Method: ${options.method}`);

    if (endpoint.includes("apply")) {
      return this.applyStatusDto;
    } else if (endpoint.includes("filter")) {
      return this.matchupDto;
    } else if (endpoint.includes("agree")) {
      const matchupId = endpoint.match(/\d+/)?.[0];
      console.log(`MatchupId: ${matchupId}`);

      const agreesMatchup = JSON.parse(options.body).agree;
      console.log(`AgreesMatchup: ${agreesMatchup}`);

      this.matchupDto.data[matchupId].status = agreesMatchup
        ? matchupStatusTypes.acceptInterview
        : matchupStatusTypes.refuseInterview;
    }
  };

  changeApplyStatus = async (applyStatus) => {
    this.applyStatusDto.applyStatus = applyStatus;
    await fetchMatchup();
  };

  appendMatchup = async (status) => {
    const recrutimentId = this.makeRandomNumber(0, 3);
    const periodId = this.makeRandomNumber(0, 3);

    const matchup = {
      id: this.matchupDto.totalCount,
      status: status,
      company: {
        thumbnailUrl:
          "https://oopy.lazyrockets.com/api/rest/cdn/image/62ee1584-df8b-4b6c-a0bc-b3f074356f89.png",
        name: "주식회사 이십사점오",
        workRegion: {
          name: "서울",
        },
        proposalUrl: "https://ssgsag.kr",
      },
      jobpost: {
        title: "소프트웨어 엔지니어",
        recruitmentType: {
          id: recrutimentId,
          name:
            recrutimentId === 0
              ? "신입"
              : recrutimentId === 1
              ? "인턴십 (체험형)"
              : "인턴십 (전환형)",
        },
        workPeriod:
          recrutimentId === 0
            ? null
            : periodId === 0
            ? 3
            : periodId === 1
            ? 6
            : 12,
      },
      responseExpirationAt: "2023-07-28T00:00:00",
    };

    this.matchupDto.data.push(matchup);
    this.matchupDto.totalCount += 1;

    await fetchMatchup();
  };
}
const mockApiService = new MockApiService();

const getApplyStatus = async () => {
  return await mockApiService.makeRequest("/superpass/user-apply-status", {
    method: "GET",
  });
};

const getMatchups = async (filterType) => {
  return await mockApiService.makeRequest(
    `/superpass/matches?filterType=${filterType}`,
    {
      method: "GET",
    }
  );
};

const postMatchupReply = async (matchupId, agreesMatchup) => {
  console.log("하하", matchupId);
  return await mockApiService.makeRequest(
    `/superpass/matches/${matchupId}/agree`,
    {
      method: "POST",
      body: JSON.stringify({
        agree: agreesMatchup,
      }),
    }
  );
};

const mapToMatchup = (matchupDto) => {
  return {
    id: matchupDto.id,
    status: matchupDto.status,
    thumbnailUrl: matchupDto.company.thumbnail,
    company: matchupDto.company.name,
    position: matchupDto.jobpost.title,
    condition: () => {
      const recruitmentType = matchupDto.jobpost.recruitmentType;
      const workPeriod = matchupDto.jobpost.workPeriod;
      const region = matchupDto.company.workRegion.name; // TODO

      if (recruitmentType.id === recruitmentTypes.newcomer) {
        return `${recruitmentType.name} / ${region}`;
      } else {
        return `${recruitmentType.name} / ${workPeriod}개월 / ${region}`;
      }
    },
    proposalUrl: matchupDto.company.proposalUrl, // TODO
    expiration: () => {
      const date = makeDate(matchupDto.responseExpirationAt, "까지", true);
      return `응답 기한 : ${date}`;
    },
  };
};

// NOTE: webflow
const $matchupList = document.querySelector(".matchup-list");
const $matchupItem = document.querySelector(".matchup-item");
const $count = document.querySelector(".matchup-count");
const $information = document.querySelector(".information");
const $empty = document.querySelector(".matchup-empty");

const matchupCheckModal = new ConfirmModal(
  document.querySelector(".match-check-modal")
);

const radioGroup = new RadioGroup(document.querySelector("#cancelRadio"));
radioGroup.extract = (input, _) => {
  return { reasonIds: input.reasonIds };
};

const cancelForm = new Form(document.querySelector("#cancelForm"), [
  radioGroup,
]);

radioGroup.onInput = () => {
  cancelForm.isEnabled = radioGroup.isValid;
};

const matchupCancelModal = new PromptModal(
  document.querySelector(".match-cancel-modal"),
  cancelForm
);

const bindApplyStatus = (applyStatus) => {
  const $title = $information.querySelector(".information-title");
  const $subtitle = $information.querySelector(".information-subtitle");
  const $button = $information.querySelector(".information-button");

  switch (applyStatus) {
    case applyStatusTypes.prepare:
    case applyStatusTypes.complated:
    case applyStatusTypes.cancelled:
    case applyStatusTypes.reject:
      $information.style.display = "flex";
      $title.textContent = "제안을 받을 수 없어요.";
      $subtitle.textContent = "슈퍼패스 신청하고 면접 제안을 받아보세요!";
      $button.textContent = "슈퍼패스 신청하기";
      $button.style.display = "flex";
      $empty.style.display = "none";
      break;
    case applyStatusTypes.apply:
      $information.style.display = "flex";
      $title.textContent = "지원서를 검토하고 있어요.";
      $subtitle.textContent = "검토는 보통 7일 이내에 완료되어요.";
      $button.textContent = "";
      $button.style.display = "none";
      $empty.style.display = "none";
      break;
    case applyStatusTypes.registeredPool:
      $information.style.display = "none";
      $title.textContent = "";
      $subtitle.textContent = "";
      $button.textContent = "";
      $button.style.display = "none";
      $empty.style.display = "flex";
      break;
    default:
      throw new Error("Invalid apply status");
  }
};

const bindTotalCount = (totalCount) => {
  $count.textContent = `받은 제안 ${totalCount}개`;
  if (totalCount !== 0) {
    $empty.style.display = "none";
  }
};

const bindMatchups = (list, item, matchup) => {
  const $status = item.querySelector(".matchup-status");
  const $thumbnail = item.querySelector(".matchup-thumbnail");
  const $company = item.querySelector(".matchup-company");
  const $position = item.querySelector(".matchup-position");
  const $condition = item.querySelector(".matchup-condition");
  const $proposal = item.querySelector(".matchup-proposal");
  const $interaction = item.querySelector(".matchup-interaction");
  const $expiration = item.querySelector(".matchup-expiration");
  const $acceptance = item.querySelector(".matchup-acceptance");
  const $rejection = item.querySelector(".matchup-rejection");

  const showProposal = () => {
    window.open(matchup.proposalUrl);
  };
  const accept = async () => {
    matchupCheckModal.handleShow(true);
    matchupCheckModal.onConfirm = async () => {
      await postMatchupReply(matchup.id, true);
      await fetchMatchup();
    };
  };
  const reject = async () => {
    matchupCancelModal.handleShow(true);
    cancelForm.onSubmit = async () => {
      await postMatchupReply(matchup.id, false);
      await fetchMatchup();
      matchupCancelModal.handleShow(false);
    };
  };

  $status.style.color = style.getPropertyValue("--secondary");
  $status.style.background = style.getPropertyValue("--silhouette");

  $thumbnail.src = matchup.thumbnailUrl;
  $company.textContent = matchup.company;
  $position.textContent = matchup.position;
  $condition.textContent = matchup.condition();

  $proposal.src = matchup.proposalUrl;
  $proposal.removeEventListener("click", showProposal);
  $proposal.addEventListener("click", showProposal);

  $interaction.style.display = "none";
  $expiration.textContent = matchup.expiration();
  $acceptance.removeEventListener("click", accept);
  $rejection.removeEventListener("click", reject);

  switch (matchup.status) {
    case matchupStatusTypes.passDocument:
    case matchupStatusTypes.requestInterview:
      $status.textContent = "응답 대기";
      $status.style.color = style.getPropertyValue("--red-sub");
      $status.style.background = style.getPropertyValue("--red-20");

      $interaction.style.display = "flex";
      $acceptance.addEventListener("click", accept);
      $rejection.addEventListener("click", reject);
      break;
    case matchupStatusTypes.refuseInterview:
    case matchupStatusTypes.refuseJoin: // NOTE: deprecated
      $status.textContent = "거절";
      break;
    case matchupStatusTypes.timeoutRequestInterview:
      $status.textContent = "만료";
      break;
    case matchupStatusTypes.acceptInterview:
    case matchupStatusTypes.inprogressInterview:
      $status.textContent = "면접 진행 중";
      $status.style.color = style.getPropertyValue("--green-sub");
      $status.style.background = style.getPropertyValue("--green-20");
      break;
    case matchupStatusTypes.failInterview:
      $status.textContent = "불합격";
      break;
    case matchupStatusTypes.passInterview:
    case matchupStatusTypes.requestJoin: // NOTE: deprecated
    case matchupStatusTypes.acceptRequestJoin: // NOTE: deprecated
    case matchupStatusTypes.recruitComplete:
      $status.textContent = "최종 합격";
      $status.style.color = style.getPropertyValue("--blue-sub");
      $status.style.background = style.getPropertyValue("--blue-20");
      break;
    case matchupStatusTypes.cancelled:
      $status.textContent = "취소";
      break;
    default:
      break;
  }

  list.appendChild(item);
};

const fetchMatchup = async () => {
  return getApplyStatus()
    .then((applyStatusDto) => {
      const applyStatus = applyStatusDto.applyStatus;

      bindApplyStatus(applyStatus);
      return getMatchups(filterTypes.all);
    })
    .then((matchupDto) => {
      bindTotalCount(matchupDto.totalCount);

      $matchupList.style.display =
        matchupDto.data.length === 0 ? "none" : "flex";
      removeAllChildren($matchupList);

      matchupDto.data.forEach((datum) => {
        const clonedItem = $matchupItem.cloneNode(true);
        const matchup = mapToMatchup(datum);

        bindMatchups($matchupList, clonedItem, matchup);
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

fetchMatchup();
