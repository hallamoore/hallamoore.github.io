let session;
const URL =
  "https://script.google.com/macros/s/AKfycbwss-g3ov3Om7UcOqXRIEqWcsudrI27YqGBt0Jm0REz_EmEjbY/exec";

$(document).ready(function () {
  session = getCookie();
  if (!session) {
    loadLogin();
  } else {
    loadHome();
  }
});

let dataByType = {};

const ITEM_TYPES = {
  Bug: "bug",
  Fish: "fish",
};

function wrapWithErrorCheck(successCallback) {
  function wrapped(data, textStatus, jqXHR) {
    if (data.error) {
      if (data.error === "Error: Unauthorized") {
        alert("You have been logged out from somewhere else");
        logout(false);
        loadLogin();
        return;
      }
      return this.error(jqXHR, "server-side script error", data.error);
    }

    return successCallback(data, textStatus, jqXHR);
  }

  return wrapped;
}

let alreadyLoadedUserData = {};

function loadItems(
  itemType,
  onCachedDataReady = () => {},
  onFetchedDataReady = () => {}
) {
  // TODO: pass in appends as part of callbacks instead of always called in fetchUserData
  if (!alreadyLoadedUserData[itemType]) {
    let storedUserData = window.localStorage.getItem(
      localStorageUserDataKey(itemType)
    );
    if (storedUserData) {
      mergeUserDataWithFullData(itemType, JSON.parse(storedUserData), true);
      onCachedDataReady();
      // The stored data could be stale, refetch in the background and update
      // the existing html instead of appending new html
      fetchUserData(itemType, false, onFetchedDataReady);
    } else {
      fetchUserData(itemType, true, onFetchedDataReady);
    }
    alreadyLoadedUserData[itemType] = true;
  } else {
    appendExistingItems(itemType);
    // The stored data could be stale, refetch in the background and update
    // the existing html instead of appending new html
    fetchUserData(itemType, false, onFetchedDataReady);
  }
}

function switchTab(e, tabName) {
  if ($(e.target).hasClass("active-tab")) {
    return;
  }

  const itemTypeByTabName = {
    bugs: ITEM_TYPES.Bug,
    fish: ITEM_TYPES.Fish,
  };

  $("#page").html("");
  $(".active-tab").removeClass("active-tab");
  $(e.target).addClass("active-tab");
  loadItems(itemTypeByTabName[tabName]);
}

function localStorageUserDataKey(itemType) {
  return `${itemType}UserData`;
}

function fetchUserData(itemType, appendHTML = true, onSuccess = () => {}) {
  $.ajax({
    method: "POST",
    url: URL,
    dataType: "json",
    data: JSON.stringify({
      session,
      action: "getUserData",
      actionArgs: [itemType],
    }),
    success: wrapWithErrorCheck(function (data, textStatus, jqXHR) {
      let localStorage = window.localStorage;
      localStorage.setItem(
        localStorageUserDataKey(itemType),
        JSON.stringify(data)
      );

      mergeUserDataWithFullData(itemType, data, appendHTML);
      onSuccess();
    }),
    error: function (jqXHR, textStatus, errorString) {
      console.log(textStatus, errorString);
      alert("Couldn't fetch user data");
    },
  });
}

function mergeUserDataWithFullData(itemType, userData, appendHTML = false) {
  const appendFnByItemType = {
    fish: appendFish,
    bug: appendBug,
  };

  for (let itemId in userData) {
    let userDataItem = userData[itemId];
    let fullDataItem = dataByType[itemType][itemId];
    Object.assign(fullDataItem, userDataItem);
    if (appendHTML) {
      appendFnByItemType[itemType](itemId, fullDataItem);
    } else {
      updateHTML(userDataItem, itemType, itemId);
    }
  }
}

function updateHTML(userDataItem, itemType, itemId) {
  for (attrName in userDataItem) {
    if (attrName === "name") {
      continue;
    }
    let attrValue = userDataItem[attrName];
    let checkedValue = $(`#${itemType}-${itemId}-${attrName}`).prop("checked");
    if (attrValue != checkedValue) {
      $(`#${itemType}-${itemId}-${attrName}`).prop("checked", attrValue);
    }
  }
}

function switchMainContent(e, contentName) {
  let target = e.target;
  if (target.tagName !== "DIV") {
    target = target.parentElement;
  }
  if ($(target).hasClass("active-tab")) {
    return;
  }

  const loadContentByContentName = {
    home: loadHome,
    critters: loadCritters,
  };

  $("#main-content").html("");
  $(".active-menu-item").removeClass("active-menu-item");
  $(target).addClass("active-menu-item");
  loadContentByContentName[contentName]();
}
