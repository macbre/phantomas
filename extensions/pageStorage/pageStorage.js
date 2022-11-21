/**
 * Support for session-/localStorage injection.
 */
"use strict";

module.exports = function (phantomas) {
  const SESSION_STORAGE = "session-storage",
    LOCAL_STORAGE = "local-storage";

  phantomas.on("init", async (page) => {
    let sessionStorage = phantomas.getParam(SESSION_STORAGE, false);
    let localStorage = phantomas.getParam(LOCAL_STORAGE, false);

    // Mapping given "storage-string" to json object if string has been given
    if (typeof sessionStorage == "string" || sessionStorage instanceof String) {
      sessionStorage = parseStorage(sessionStorage);
    }

    if (typeof localStorage == "string" || localStorage instanceof String) {
      localStorage = parseStorage(localStorage);
    }

    if (sessionStorage) {
      phantomas.log(
        "Injecting sessionStorage: %j",
        JSON.stringify(sessionStorage)
      );
      await injectStorage(page, sessionStorage, SESSION_STORAGE);
    }
    if (localStorage) {
      phantomas.log("Injecting localStorag: %j", JSON.stringify(localStorage));
      await injectStorage(page, localStorage, LOCAL_STORAGE);
    }
  });

  function parseStorage(storageString) {
    // --sessionStorage='bar=foo;domain=url'
    // --localStorage='bar=fooLocal;domain=urlLocal'
    var storageMap = {};
    storageString.split(";").forEach(function (singleEntry) {
      var entryKeyValue = singleEntry.split("=");
      storageMap[entryKeyValue[0]] = entryKeyValue[1];
    });
    return storageMap;
  }

  /**
   * Inject the given storage into the specified page storage.
   * Either localStorage or sessionStorage
   *
   * @param {Page} page in which page the storage should be injected
   * @param {Object} storage the JSON object consisting of the storage keys and values
   * @param {string} storageType either localStorage or sessionStorage
   */
  async function injectStorage(page, storage, storageType) {
    if (!page || !storage || !storageType) {
      return;
    }

    /* istanbul ignore next */
    await page.evaluateOnNewDocument(
      (storage, storageType, SESSION_STORAGE, LOCAL_STORAGE) => {
        const keys = Object.keys(storage);
        const values = Object.values(storage);
        if (storageType === SESSION_STORAGE) {
          for (let i = 0; i < keys.length; i++) {
            sessionStorage.setItem(keys[i], values[i]);
          }
        }
        if (storageType === LOCAL_STORAGE) {
          for (let i = 0; i < keys.length; i++) {
            localStorage.setItem(keys[i], values[i]);
          }
        }
      },
      storage,
      storageType,
      SESSION_STORAGE,
      LOCAL_STORAGE
    );
  }
};
