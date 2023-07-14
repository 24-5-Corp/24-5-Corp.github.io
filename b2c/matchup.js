class RadioGroup extends RegexInput {
  constructor(element) {
    super(element);

    this._input.disabled = true;

    this._buttons = element.querySelectorAll("label div");
    this._radios = element.querySelectorAll("label input");

    for (const radio of this._radios) {
      radio.addEventListener("input", (event) => {
        const reasonId = parseInt(event.target.id);
        this._input.reasonId = reasonId;

        this._input.dispatchEvent(this.inputEvent);
      });
    }
  }

  get isValid() {
    return !!this._input.reasonId;
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

const recruitmentTypes = {
  experimental: 1,
  transitional: 2,
  newcomer: 3,
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
const getApplyStatus = async () => {
  return await apiService.makeRequest("/superpass/v2/apply-status", {
    method: "GET",
  });
};

const getMatchups = async () => {
  return await apiService.makeRequest("/superpass/v2/seeker/matchup", {
    method: "GET",
  });
};

const putMatchupReply = async (matchupId, agreesMatchup, reason = null) => {
  return await apiService.makeRequest(
    `/superpass/v2/seeker/matchup/${matchupId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        agree: agreesMatchup,
        reason: reason,
      }),
    }
  );
};

const mapToMatchup = (matchupDto) => {
  return {
    id: matchupDto.id,
    status: matchupDto.status,
    thumbnailUrl: matchupDto.company.thumbnailUrl,
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
radioGroup.extract = (input, _) => input.reasonId;

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
  $button.addEventListener("click", () => {
    location.href = "/apply-superpasss";
  });

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
      await putMatchupReply(matchup.id, true);
      await fetchMatchup();
    };
  };
  const reject = async () => {
    matchupCancelModal.handleShow(true);
    cancelForm.onSubmit = async () => {
      await putMatchupReply(matchup.id, false, radioGroup.value);
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
      return getMatchups();
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

const $loginButton = document.getElementById("loginButton");
$loginButton.addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  location.href = "/";
});

fetchMatchup();

Webflow.push(() => {
  document.querySelector("#matches").classList.add("current");
});
