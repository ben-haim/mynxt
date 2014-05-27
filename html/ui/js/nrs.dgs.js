var NRS = (function(NRS, $, undefined) {
	NRS.pages.newest_dgs = function() {
		NRS.pageLoading();

		var content = "";

		NRS.sendRequest("getDGSGoods+", {
			"firstIndex": 0,
			"lastIndex": 100
		}, function(response) {
			if (response.goods && response.goods.length) {
				for (var i = 0; i < response.goods.length; i++) {
					var good = response.goods[i];

					content += NRS.getMarketplaceItemHTML(good);
				}

				$("#dgs_page_contents").empty().append(content);
				NRS.dataLoadFinished($("#dgs_page_contents"));

				NRS.pageLoaded();
			} else {
				$("#dgs_page_contents").empty();
				NRS.dataLoadFinished($("#dgs_page_contents"));

				NRS.pageLoaded();
			}
		});
	}

	NRS.getMarketplaceItemHTML = function(good) {
		return "<div style='float:right;color: #999999;background:white;padding:5px;border:1px solid #ccc;border-radius:3px'>" +
			"<strong>Account</strong>: <span><a href='#' data-user='" + NRS.getAccountFormatted(good, "seller") + "' class='user_info'>" + NRS.getAccountTitle(good, "seller") + "</a></span><br>" +
			"<strong>Marketplace Id</strong>: &nbsp;<a href='#''>" + String(good.goods).escapeHTML() + "</a>" +
			"</div>" +
			"<h3 class='title'><a href='#' data-goods='" + String(good.goods).escapeHTML() + "' data-toggle='modal' data-target='#dgs_purchase_modal'>" + String(good.name).escapeHTML() + "</a></h3>" +
			"<span class='price'><strong>" + NRS.formatAmount(good.priceNQT) + " NXT</strong></span>" +
			"<div class='description'>" + String(good.description).escapeHTML().nl2br() + "</div>" +
			"<span class='tags'><strong>Tags</strong>: " + String(good.tags).escapeHTML() + "</span><hr />";
	}

	NRS.pages.purchased_dgs = function() {
		NRS.pageLoading();

		var goods = {};

		NRS.sendRequest("getDGSPurchases", {
			"buyer": NRS.account,
			"timestamp": 0
		}, function(response) {
			if (response.purchases && response.purchases.length) {
				var nr_goods = 0;

				for (var i = 0; i < response.purchases.length; i++) {
					NRS.sendRequest("getDGSGood", {
						"goods": response.purchases[i].goods
					}, function(good) {
						goods[good.goods] = good;
						nr_goods++;

						if (nr_goods == response.purchases.length) {
							NRS.pageLoaded();
						}
					});
				}
			} else {
				NRS.pageLoaded();
			}
		});
	}

	NRS.pages.pending_purchases_dgs = function() {
		NRS.pageLoading();

		NRS.sendRequest("getDGSPendingPurchases", {
			"seller": NRS.account
		}, function(response) {
			if (response.errorCode) {

			} else {

			}
		});
	}

	NRS.pages.my_dgs_listings = function() {
		NRS.pageLoading();

		var rows = "";

		if (NRS.unconfirmedTransactions.length) {
			for (var j = 0; j < NRS.unconfirmedTransactions.length; j++) {
				var unconfirmedTransaction = NRS.unconfirmedTransactions[j];

				if (unconfirmedTransaction.type != 3 || unconfirmedTransaction.subtype != 0) {
					continue;
				}

				rows += "<tr class='tentative' data-goods='" + String(unconfirmedTransaction.goods).escapeHTML() + "'><td><a href='#' data-toggle='modal' data-target='#dgs_listing_modal' data-goods='" + String(unconfirmedTransaction.goods).escapeHTML() + "'>" + String(unconfirmedTransaction.name).escapeHTML() + "</a></td><td class='quantity'>" + NRS.format(unconfirmedTransaction.quantity) + "</td><td class='price'>" + NRS.formatAmount(unconfirmedTransaction.priceNQT) + " NXT</td><td style='white-space:nowrap'><a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_price_change_modal' data-goods='" + String(unconfirmedTransaction.goods).escapeHTML() + "'>Change Price</a> <a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_quantity_change_modal' data-goods='" + String(unconfirmedTransaction.goods).escapeHTML() + "'>Change QTY</a> <a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_delisting_modal' data-goods='" + String(unconfirmedTransaction.goods).escapeHTML() + "'>Delete</a></td></tr>";
			}
		}

		NRS.sendRequest("getDGSGoods+", {
			"seller": NRS.account,
			"firstIndex": 0,
			"lastIndex": 0
		}, function(response) {
			if (response.goods && response.goods.length) {
				for (var i = 0; i < response.goods.length; i++) {
					var good = response.goods[i];

					var deleted = false;
					var tentative = false;
					var quantityFormatted = false;

					if (NRS.unconfirmedTransactions.length) {
						for (var j = 0; j < NRS.unconfirmedTransactions.length; j++) {
							var unconfirmedTransaction = NRS.unconfirmedTransactions[j];

							if (unconfirmedTransaction.type == 3 && unconfirmedTransaction.goods == good.goods) {
								if (unconfirmedTransaction.subtype == 1) { //delisting
									deleted = tentative = true;
								} else if (unconfirmedTransaction.subtype == 2) { //price change
									good.priceNQT = unconfirmedTransaction.priceNQT;
									tentative = true;
								} else if (unconfirmedTransaction.subtype == 3) { //quantity change
									good.quantity = NRS.format(good.quantity) + " " + NRS.format(unconfirmedTransaction.deltaQuantity);
									tentative = true;
									quantityFormatted = true;
								}
							}
						}
					}

					rows += "<tr class='" + (tentative ? "tentative" : "") + (deleted ? " tentative-crossed" : "") + "' data-goods='" + String(good.goods).escapeHTML() + "'><td><a href='#' data-toggle='modal' data-target='#dgs_listing_modal' data-goods='" + String(good.goods).escapeHTML() + "'>" + String(good.name).escapeHTML() + "</a></td><td class='quantity'>" + (quantityFormatted ? good.quantity : NRS.format(good.quantity)) + "</td><td class='price'>" + NRS.formatAmount(good.priceNQT) + " NXT</td><td style='white-space:nowrap'><a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_price_change_modal' data-goods='" + String(good.goods).escapeHTML() + "'>Change Price</a> <a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_quantity_change_modal' data-goods='" + String(good.goods).escapeHTML() + "'>Change QTY</a> <a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_delisting_modal' data-goods='" + String(good.goods).escapeHTML() + "'>Delete</a></td></tr>";
				}

				$("#my_dgs_listings_table tbody").empty().append(rows);
				NRS.dataLoadFinished($("#my_dgs_listings_table"));

				NRS.pageLoaded();
			} else {
				$("#my_dgs_listings_table tbody").empty();
				NRS.dataLoadFinished($("#my_dgs_listings_table"));

				NRS.pageLoaded();
			}
		});
	}

	NRS.incoming.my_dgs_listings = function(transactions) {
		if (transactions || NRS.unconfirmedTransactionsChange || NRS.state.isScanning) {
			NRS.pages.my_dgs_listings();
		}
	}

	NRS.forms.dgsListing = function($modal) {
		var data = NRS.getFormData($modal.find("form:first"));

		if (!data.description) {
			return {
				"error": "Description is a required field."
			};
		}

		$.each(data, function(key, value) {
			data[key] = $.trim(value);
		});

		if (!data.description) {
			return {
				"error": "Description is a required field."
			};
		}

		if (data.tags) {
			data.tags = data.tags.toLowerCase();

			var tags = data.tags.split(",");

			if (tags.length > 3) {
				return {
					"error": "A maximum of 3 tags is allowed."
				};
			} else {
				var clean_tags = [];

				for (var i = 0; i < tags.length; i++) {
					var tag = $.trim(tags[i]);

					if (tag.length < 3 || tag.length > 20) {
						return {
							"error": "Incorrect \"tag\" (length must be in [3..20] range)"
						};
					} else if (!tag.match(/^[a-z]+$/i)) {
						return {
							"error": "Incorrect \"tag\" (must contain only alphabetic characters)"
						};
					} else if (clean_tags.indexOf(tag) > -1) {
						return {
							"error": "The same tag was inserted multiple times."
						};
					} else {
						clean_tags.push(tag);
					}
				}

				data.tags = clean_tags.join(",")
			}
		}

		return {
			"data": data
		};
	}

	NRS.forms.dgsListingComplete = function(response, data) {
		if (response.alreadyProcessed) {
			return;
		}

		if (NRS.currentPage == "my_dgs_listings") {
			var $table = $("#my_dgs_listings_table tbody");

			var rowToAdd = "<tr class='tentative' data-goods='" + String(response.transaction).escapeHTML() + "'><td><a href='#' data-toggle='modal' data-target='#dgs_listing_modal' data-goods='" + String(response.transaction).escapeHTML() + "'>" + String(data.name).escapeHTML() + "</a></td><td>" + String(data.tags).escapeHTML() + "</td><td class='quantity'>" + NRS.format(data.quantity) + "</td><td class='price'>" + NRS.formatAmount(data.priceNQT) + " NXT</td><td style='white-space:nowrap'><a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_price_change_modal' data-goods='" + String(response.transaction).escapeHTML() + "'>Change Price</a> <a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_quantity_change_modal' data-goods='" + String(response.transaction).escapeHTML() + "'>Change QTY</a> <a class='btn btn-xs btn-default' href='#' data-toggle='modal' data-target='#dgs_delisting_modal' data-goods='" + String(response.transaction).escapeHTML() + "'>Delete</a></td></tr>";

			$table.prepend(rowToAdd);

			if ($("#my_dgs_listings_table").parent().hasClass("data-empty")) {
				$("#my_dgs_listings_table").parent().removeClass("data-empty");
			}
		}
	}

	NRS.forms.dgsDelistingComplete = function(response, data) {
		if (response.alreadyProcessed) {
			return;
		}
		$("#my_dgs_listings_table tr[data-goods=" + String(data.goods).escapeHTML() + "]").addClass("tentative tentative-crossed");
	}

	/*
	NRS.forms.dgsFeedback = function($modal) {
		var data = NRS.getFormData($modal.find("form:first"));

		if (data.note) {
			var encrypted = nxtCrypto.encryptData(data.note);

			data.encryptedNoteNonce = encrypted.nonce;
			data.encryptedNote = encrypted.data;

			delete data.note;
		}

		return {
			"data": data
		};
	}

	NRS.forms.dgsPurchase = function($modal) {
		var data = NRS.getFormData($modal.find("form:first"));

		if (data.note) {
			var encrypted = nxtCrypto.encryptData(data.note);

			data.encryptedNoteNonce = encrypted.nonce;
			data.encryptedNote = encrypted.data;

			delete data.note;
		}

		return {
			"data": data
		};
	}

	NRS.forms.dgsRefund = function($modal) {
		var data = NRS.getFormData($modal.find("form:first"));

		if (data.note) {
			var encrypted = nxtCrypto.encryptData(data.note);

			data.encryptedNoteNonce = encrypted.nonce;
			data.encryptedNote = encrypted.data;

			delete data.note;
		}

		return {
			"data": data
		};
	}

	NRS.forms.dgsDelivery = function($modal) {
		var data = NRS.getFormData($modal.find("form:first"));

		var toEncrypt = (data.goodsData ? data.goodsData : (data.goodsText ? data.goodsText : null));

		if (toEncrypt) {
			var encrypted = nxtCrypto.encryptData(toEncrypt);

			data.encryptedGoodsData = encrypted.nonce;
			data.encryptedGoodsNonce = encrypted.data;

			delete data.note;
		}

		delete data.goodsData;
		delete data.goodsText;

		return {
			"data": data
		};
	}*/

	NRS.forms.dgsPurchase = function($modal) {
		var data = NRS.getFormData($modal.find("form:first"));

		data.deliveryDeadlineTimestamp = Math.floor(new Date().getTime() / 1000) + 60 * 60 * data.deliveryDeadlineTimestamp;

		return {
			"data": data
		};
	}

	NRS.forms.dgsQuantityChange = function($modal) {
		var data = NRS.getFormData($modal.find("form:first"));

		NRS.sendRequest("getDGSGood", {
			"goods": data.goods
		}, function(response) {
			if (response.errorCode) {
				return {
					"error": "Could not fetch good."
				};
			} else {
				if (data.quantity == response.quantity) {
					data.deltaQuantity = "0";
				} else if (data.quantity > response.quantity) {
					data.deltaQuantity = "+" + (data.quantity - response.quantity);
				} else {
					data.deltaQuantity = "-" + (response.quantity - data.quantity);
				}
			}
		}, false);

		if (data.deltaQuantity == "0") {
			return {
				"error": "No change in quantity."
			};
		}

		delete data.quantity;

		return {
			"data": data
		};
	}

	NRS.forms.dgsQuantityChangeComplete = function(response, data) {
		if (response.alreadyProcessed) {
			return;
		}

		var quantityField = $("#my_dgs_listings_table tr[data-goods=" + String(data.goods).escapeHTML() + "]").addClass("tentative").find(".quantity");

		quantityField.html(quantityField.html() + " " + String(data.deltaQuantity).escapeHTML());
	}

	NRS.forms.dgsPriceChangeComplete = function(response, data) {
		if (response.alreadyProcessed) {
			return;
		}

		$("#my_dgs_listings_table tr[data-goods=" + String(data.goods).escapeHTML() + "]").addClass("tentative").find(".price").html(NRS.formatAmount(data.priceNQT) + " NXT");
	}

	$("#dgs_delisting_modal, #dgs_quantity_change_modal, #dgs_price_change_modal, #dgs_purchase_modal").on("show.bs.modal", function(e) {
		var $modal = $(this);
		var $invoker = $(e.relatedTarget);

		var type = $modal.attr("id");

		var goods = $invoker.data("goods");

		$modal.find("input[name=goods]").val(goods);

		NRS.sendRequest("getDGSGood", {
			"goods": goods
		}, function(response) {
			if (response.errorCode) {
				e.preventDefault();
				$.growl("Error fetching good info.", {
					"type": "danger"
				});
			} else {
				var output = "<strong>Item Name</strong>: " + String(response.name).escapeHTML();
				if (type == "dgs_purchase_modal") {
					output += "<br /><div style='max-height:250px;overflow:auto;'>" + String(response.description).escapeHTML().nl2br() + "</div>";
				}
			}

			$modal.find(".goods_info").html(output);

			if (type == "dgs_quantity_change_modal") {
				$("#dgs_quantity_change_current_quantity, #dgs_quantity_change_quantity").val(String(response.quantity).escapeHTML());
			} else if (type == "dgs_price_change_modal") {
				$("#dgs_price_change_current_price, #dgs_price_change_price").val(NRS.convertToNXT(response.priceNQT).escapeHTML());
			} else if (type == "dgs_purchase_modal") {
				$("#dgs_purchase_price").val(NRS.convertToNXT(response.priceNQT).escapeHTML());
			}
		}, false);
	}).on("hidden.bs.modal", function(e) {
		$(this).find(".goods_info").html("Loading...");
		$("#dgs_quantity_change_current_quantity, #dgs_price_change_current_price, #dgs_quantity_change_quantity, #dgs_price_change_price").val("0");
	});

	return NRS;
}(NRS || {}, jQuery));