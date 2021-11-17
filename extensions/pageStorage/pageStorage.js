/**
 * Support for session-/localStorage injection.
 */
"use strict";

module.exports = function (phantomas) {

    const 
        SESSION_STORAGE = "sessionStorage",
        LOCAL_STORAGE = "localStorage";

    phantomas.on("init", async (page) => {
        const sessionStorage = phantomas.getParam(SESSION_STORAGE);
        const localStorage = phantomas.getParam(LOCAL_STORAGE);

        if (sessionStorage) {
            phantomas.log("Injecting sessionStorage: %j", JSON.stringify(sessionStorage));
            await injectStorage(page, sessionStorage, SESSION_STORAGE);
        }
        if (localStorage) {
            phantomas.log("Injecting localStorag: %j", JSON.stringify(localStorage));
            await injectStorage(page, localStorage, LOCAL_STORAGE);
        }
    });

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

        await page.evaluateOnNewDocument((storage, storageType, SESSION_STORAGE, LOCAL_STORAGE) => {
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
        }, storage, storageType, SESSION_STORAGE, LOCAL_STORAGE);
    }
};
