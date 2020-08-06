'use strict';

function onAddRequest() {
	this.listeners = [];
	this.addListener = (callback) => {
		if (typeof callback !== 'function') {
			console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
		} else {
			this.listeners.push(callback);
		};
	};
	this.removeListener = (callback) => {
		this.listeners = this.listeners.filter(listener => {
			return listener != callback
		});
	};
	this.dispatch = (details) => {
		this.listeners.forEach((listener) => {
			listener(details);
		});
	};
};

function onClearAllRequest() {
	this.listeners = [];
	this.addListener = (callback) => {
		if (typeof callback !== 'function') {
			console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
		} else {
			this.listeners.push(callback);
		};
	};
	this.removeListener = (callback) => {
		this.listeners = this.listeners.filter(listener => {
			return listener != callback
		});
	};
	this.dispatch = () => {
		this.listeners.forEach((listener) => {
			listener();
		});
	};
};

function onRecordChange() {
	this.listeners = [];
	this.addListener = (callback) => {
		if (typeof callback !== 'function') {
			console.error(`The listener callback must be a function, the given type is ${typeof callback}`);
		} else {
			this.listeners.push(callback);
		};
	};
	this.removeListener = (callback) => {
		this.listeners = this.listeners.filter(listener => {
			return listener != callback
		});
	};
	this.dispatch = (newRecord) => {
		this.listeners.forEach((listener) => {
			listener(newRecord);
		});
	};
};

var onAddRequest = new onAddRequest(),
	onClearAllRequest = new onClearAllRequest(),
	onRecordChange = new onRecordChange(),
	allRequests = [],
	record = false;

function clearAllRequest() {
	allRequests = [];
	onClearAllRequest.dispatch();
};

function switchRecord() {
	if (record) {
		record = false;
	} else {
		record = true;
	};
	onRecordChange.dispatch(record);
};

chrome.webRequest.onBeforeRequest.addListener((details) => {
	if (!record) {
		return;
	};

	if (details.initiator != undefined) {
		if (details.initiator.substr(0, 19) == "chrome-extension://") return;
	} else {
		if (details.url.substr(0, 19) == "chrome-extension://") return;
	};

	allRequests.push(details);

	if (allRequests.length > 2000) {
		allRequests = allRequests.slice(0, 2000);
	};

	onAddRequest.dispatch(details);
}, {urls: ["<all_urls>"]}, ["requestBody"]);

chrome.browserAction.onClicked.addListener(() => {
	chrome.tabs.create ({
		active: true, url: chrome.extension.getURL("requests_dashboard.html")
	});
});