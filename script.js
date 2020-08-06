var allRequests = [],
urlFilter = ""
typeFilters = {
	'main_frame': true,
	'sub_frame': true,
	'stylesheet': false,
	'script': false,
	'image': false,
	'font': true,
	'object': true,
	'xmlhttprequest': true,
	'ping': true,
	'csp_report': true,
	'media': true,
	'websocket': true,
	'other': true
}, methodFilters = {
	'GET': true,
	'HEAD': true,
	'POST': false,
	'PUT': false,
	'DELETE': false,
	'CONNECT': false,
	'OPTIONS': false,
	'TRACE': false,
	'PATCH': false,
}, addRequest = (details) => {
	allRequests.push(details);

	if (checkFilters(details)) {
		$('main > aside > table > tbody').append(viewRequest(details));
	};
}, viewRequest = (details) => {
	var item = $('<tr><td class="mdl-data-table__cell--non-numeric">' + details.type +
		'</th><td class="mdl-data-table__cell--non-numeric">' + details.method +
		'</th><td class="mdl-data-table__cell--non-numeric">' + details.url + '</th></tr>');
	item.click(() => {
		$('#content-table #frameId > div').text(details.frameId);
		$('#content-table #initiator > div').text(details.initiator);
		$('#content-table #method > div').text(details.method);
		$('#content-table #parentFrameId > div').text(details.parentFrameId);
		$('#content-table #requestBody > div').text(JSON.stringify(details.requestBody, null, 4));
		$('#content-table #requestId > div').text(details.requestId);
		$('#content-table #tabId > div').text(details.tabId);
		$('#content-table #timeStamp > div').text(details.timeStamp);
		$('#content-table #type > div').text(details.type);
		$('#content-table #url > div').text(details.url);
		if (details.initiator == undefined) {
			$('#content-table #initiator').hide();
			$('#content-table #initiatorName').hide();
		} else {
			$('#content-table #initiator').show();
			$('#content-table #initiatorName').show();
		};
		if (details.requestBody == undefined) {
			$('#content-table #requestBody').hide();
			$('#content-table #requestBodyName').hide();
		} else {
			$('#content-table #requestBody').show();
			$('#content-table #requestBodyName').show();
			$('#content-table #requestBodyName').height($('#content-table #requestBody').height())
		};

		$('#runContainer').hide();

		$('#closeButton').click(() => {
			$('#runContainer').hide();
		});

		if (details.method == "GET" || details.method == "POST") {
			$('content > div > *').show();
			$('#runButton').click(() => {
				var formData = {};
				if (details.requestBody != undefined) {
					formData = details.requestBody.formData;
				};
				$.ajax({
					type: details.method,
					url: details.url,
					data: formData,
					dataType: "html"
				}).done((data, textStatus, jqXHR) => {
					$('#runContainer').show();
					$('#runContainer').text(data);
				}).fail((jqXHR, textStatus, errorThrown) => {
					$('#runContainer').show();
					$('#runContainer').text(textStatus + ' - ' + errorThrown);
				});
			});
		} else {
			$('content > div > *').hide();
			$('#content-table').show();
		};
	});
	return item;
}, clearAllRequest = () => {
	allRequests = [];
	$('main > aside > table > tbody').empty();
}, recordChange = (newRecord) => {
	if (newRecord) {
		$('#recordButton').addClass('mdl-button--colored');
		$('#recordButton').text(chrome.i18n.getMessage('stop'));
	} else {
		$('#recordButton').removeClass('mdl-button--colored');
		$('#recordButton').text(chrome.i18n.getMessage('start'));
	};
}, checkFilters = (details) => {
	if (details.url.match(urlFilter) == null) return false;
	if (typeFilters[details.type] == false) return false;
	if (methodFilters[details.method] == false) return false;

	return true;
}, applyFilters = () => {
	var filtredRequests = [];
	allRequests.forEach((details) => {
		if (checkFilters(details)) {
			filtredRequests.push(details);
		};
	});
	$('main > aside > table > tbody').empty();
	filtredRequests.forEach((details) => {
		$('main > aside > table > tbody').append(viewRequest(details));
	});
};

$(document).ready(() => {
	var elements = document.querySelectorAll('[data-translate]');
	[].forEach.call(elements, (element) => {
		element.textContent = chrome.i18n.getMessage(element.dataset.translate);
	});

	chrome.extension.getBackgroundPage().allRequests.forEach(addRequest);
	chrome.extension.getBackgroundPage().onAddRequest.addListener(addRequest);

	chrome.extension.getBackgroundPage().onClearAllRequest.addListener(clearAllRequest);

	recordChange(chrome.extension.getBackgroundPage().record);
	chrome.extension.getBackgroundPage().onRecordChange.addListener(recordChange);

	$('#urlFilter').change(() => {
		urlFilter = $('#urlFilter').val();
		applyFilters();
	})

	$('header > div > label.mdl-checkbox > input').eq(0).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(0).prop('checked')) {
			typeFilters["main_frame"] = true;
			typeFilters["sub_frame"] = true;
		} else {
			typeFilters["main_frame"] = false;
			typeFilters["sub_frame"] = false;
		};
		applyFilters();
	});

	$('header > div > label.mdl-checkbox > input').eq(1).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(1).prop('checked')) {
			typeFilters["xmlhttprequest"] = true;
		} else {
			typeFilters["xmlhttprequest"] = false;
		};
		applyFilters();
	});

	$('header > div > label.mdl-checkbox > input').eq(2).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(2).prop('checked')) {
			typeFilters["script"] = true;
		} else {
			typeFilters["script"] = false;
		};
		applyFilters();
	});

	$('header > div > label.mdl-checkbox > input').eq(3).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(3).prop('checked')) {
			typeFilters["stylesheet"] = true;
		} else {
			typeFilters["stylesheet"] = false;
		};
		applyFilters();
	});

	$('header > div > label.mdl-checkbox > input').eq(4).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(4).prop('checked')) {
			typeFilters["image"] = true;
		} else {
			typeFilters["image"] = false;
		};
		applyFilters();
	});

	$('header > div > label.mdl-checkbox > input').eq(5).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(5).prop('checked')) {
			typeFilters["font"] = true;
			typeFilters["ping"] = true;
			typeFilters["csp_report"] = true;
			typeFilters["media"] = true;
			typeFilters["websocket"] = true;
			typeFilters["object"] = true;
			typeFilters["other"] = true;
		} else {
			typeFilters["font"] = false;
			typeFilters["ping"] = false;
			typeFilters["csp_report"] = false;
			typeFilters["media"] = false;
			typeFilters["websocket"] = false;
			typeFilters["other"] = false;
		};
		applyFilters();
	});

	$('header > div > label.mdl-checkbox > input').eq(6).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(6).prop('checked')) {
			methodFilters["GET"] = true;
		} else {
			methodFilters["GET"] = false;
		};
		applyFilters();
	});

	$('header > div > label.mdl-checkbox > input').eq(7).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(7).prop('checked')) {
			methodFilters["POST"] = true;
		} else {
			methodFilters["POST"] = false;
		};
		applyFilters();
	});

	$('header > div > label.mdl-checkbox > input').eq(8).change(() => {
		if ($('header > div > label.mdl-checkbox > input').eq(8).prop('checked')) {
			methodFilters["HEAD"] = true;
			methodFilters["PUT"] = true;
			methodFilters["DELETE"] = true;
			methodFilters["TRACE"] = true;
			methodFilters["OPTIONS"] = true;
			methodFilters["CONNECT"] = true;
			methodFilters["PATCH"] = true;
		} else {
			methodFilters["HEAD"] = false;
			methodFilters["PUT"] = false;
			methodFilters["DELETE"] = false;
			methodFilters["TRACE"] = false;
			methodFilters["OPTIONS"] = false;
			methodFilters["CONNECT"] = false;
			methodFilters["PATCH"] = false;
		};
		applyFilters();
	});

	$('#clearButton').click(() => {
		chrome.extension.getBackgroundPage().clearAllRequest();
	});

	$('#recordButton').click(() => {
		chrome.extension.getBackgroundPage().switchRecord();
	});
});

$(document).on('unload', () => {
	chrome.extension.getBackgroundPage().onAddRequest.removeListener(addRequest);
	chrome.extension.getBackgroundPage().onClearAllRequest.removeListener(clearAllRequest);
	chrome.extension.getBackgroundPage().onRecordChange.removeListener(recordChange);
});