
ACC.compareproducts = {
		category:"",
		ajaxURL:"",
		searchString:"",
		diffrenceActive:false,
		bindCompareproductsLink: function() {
			
			var urlSplitted = window.location.pathname.split("/");
			var urlCategory = urlSplitted[urlSplitted.length - 1];
			
			if($("body").hasClass("page-search"))
			{
				ACC.compareproducts.category = "search";
				ACC.compareproducts.searchString = $("#search_string_container").attr("data-search-string");
			}
			else
			{
				ACC.compareproducts.category = urlCategory;
				ACC.compareproducts.searchString = "";
			}	
			
			
			var productCodesStoredJsonload = ACC.compareproducts.getCookieJson();
			
			$('.compareProducts input[type="checkbox"]').removeAttr("checked");
			
			if($(".totalResults").attr("data-total-products") < 2)
			{
				$('.compareProducts input[type="checkbox"]').attr("disabled", "disabled");
				$('.compare-products').addClass("comparison_disabled");
			}	
			
			if(productCodesStoredJsonload.products.length > 0)
			{
				if((productCodesStoredJsonload.category != ACC.compareproducts.category) ||(productCodesStoredJsonload.search != ACC.compareproducts.searchString))
				{
					var newCatData = '{"products":[], "category":"'+ACC.compareproducts.category+'", "search":"'+ACC.compareproducts.searchString+'"}';
					ACC.common.setCookie("prCmp",escape(newCatData),1,"/");
				}
				
				ACC.compareproducts.updateSelections();
			}
			
			
			$('.compare-products').click(function(e) {
				e.preventDefault();
				
				if($(this).hasClass("comparison_disabled"))
				{
				return false;
				}
				ACC.compareproducts.updateSelections();
				
				ACC.compareproducts.ajaxURL = $(this).attr("href");
				
				var prQueryString = ACC.compareproducts.formatURL();
				var productCodesStoredJson = ACC.compareproducts.getCookieJson().products;
				if(productCodesStoredJson.length < 2)
				{
				
					$.colorbox({
						html: '<div class="color_box_alert">Please select at least two items for comparison</div>',
						width:400,	
						height:'auto'
					});
				}
				else if(productCodesStoredJson.length > 4)
				{
					$.colorbox({
						html: '<div class="color_box_alert">Product comparison is allowed for only up to 4 items.</div>',
						width:400,	
						height:'auto'
					});
				}
				else
				{	
					$.colorbox({
						href: $(this).attr("href") + prQueryString,
						width:1000,
						height:700,
						onComplete: function ()
						{
							$('#colorbox').addClass('product_compare_colobox');
							ACC.product.bindToAddToCartForm();
						},
						onClosed: function()
						{
							ACC.compareproducts.diffrenceActive = false;
						}
					});
				}	
			});
			
			$('.compareProducts input[type="checkbox"]').change(function()
			{
				var pid = $(this).parents(".compareProducts").attr("data-pid");
				var cookieJson = ACC.compareproducts.getCookieJson().products;
				
				
				if ($(this).is(':checked')) 
				{
					cookieJson.push(pid);
					var json_str = JSON.stringify(cookieJson);
					cookieJsonData = '{"products":'+json_str+', "category":"'+ACC.compareproducts.category+'", "search":"'+ACC.compareproducts.searchString+'"}';
					ACC.common.setCookie("prCmp",escape(cookieJsonData),1,"/");
					
				}	
				else 
				{
					ACC.compareproducts.deleteCookie(pid);
				}
				
				if(cookieJson.length > 4)
				{
					$.colorbox({
						html: '<div class="color_box_alert">Product comparison is allowed for only up to 4 items.</div>',
						width:400,	
						height:'auto'
					});
					
					ACC.compareproducts.deleteCookie(pid);
					ACC.compareproducts.updateSelections();
				}
				
			})
			
			$("body").on("change", "#diff_checkbox", function()
			{
				if ($(this).is(':checked')) 
				{
					$(".highlight_diff").parent("tr").addClass("highlight_diff_row");
					ACC.compareproducts.diffrenceActive = true;
				}
				else
				{
					$(".highlight_diff").parent("tr").removeClass("highlight_diff_row");
					ACC.compareproducts.diffrenceActive = false;
				}	
			})
			
			$("body").on("click", ".remove_product_cmp", function()
			{
				
				var r = confirm("Are you sure you want to remove Selected item?");
			    if (r == true) 
			    {
					var pid = $(this).attr("data-pid");
					ACC.compareproducts.deleteCookie(pid);
					ACC.compareproducts.updateSelections();
					var deletedQueryString = ACC.compareproducts.formatURL();
					
					var cookieJsonproducts = ACC.compareproducts.getCookieJson().products;
					
					if(cookieJsonproducts.length < 2)
					{
						$.colorbox.close();
					}
					else
					{	
					    $.colorbox({
					    	width:1000,
					    	href: ACC.compareproducts.ajaxURL + deletedQueryString,
					    	height:700,
					    	onComplete: function ()
							{
								$('#colorbox').addClass('product_compare_colobox');
								ACC.product.bindToAddToCartForm();
								
								if(ACC.compareproducts.diffrenceActive)
								{
									$(".highlight_diff").parent("tr").addClass("highlight_diff_row");
									$("#diff_checkbox").attr("checked","checked");
								}
							},
							onClosed: function()
							{
								ACC.compareproducts.diffrenceActive = false;
							}
					    });
					}  
			     }	
			})		
			
			
		},
		deleteCookie : function(PidDel)
		{
			
			var cookieJsonDlete = ACC.compareproducts.getCookieJson().products;
			$(cookieJsonDlete).each(function(index)
			{
				if(cookieJsonDlete[index] == PidDel)
				{
					cookieJsonDlete.splice(index, 1);
					var json_str_spliced = '{"products":'+JSON.stringify(cookieJsonDlete)+', "category":"'+ACC.compareproducts.category+'", "search":"'+ACC.compareproducts.searchString+'"}';				
					ACC.common.setCookie("prCmp",escape(json_str_spliced),1,"/");
				}
			});		
		},
		getCookieJson : function()
		{
			var cookieJson = [];
			var cookieStr = ACC.common.getCookie("prCmp");
			cookieStr = unescape(cookieStr);
			
			if(cookieStr != "")
			{
				cookieJson = JSON.parse(cookieStr);
				return cookieJson;
			}
			var emptyJson = '{"products":[], "category":"'+ACC.compareproducts.category+'", "search":"'+ACC.compareproducts.searchString+'"}';
				emptyJson = unescape(emptyJson);
				emptyJson = JSON.parse(emptyJson)
				return emptyJson;
		},
		formatURL : function()
		{
			var productCodesFormatted = "";
			var productCodesStoredJson = ACC.compareproducts.getCookieJson().products;
			$(productCodesStoredJson).each(function(index)
			{
				productCodesFormatted += productCodesStoredJson[index] + "|";
			})
			return productCodesFormatted;
		},
		updateSelections : function()
		{
			var productCodesStoredJsonload = ACC.compareproducts.getCookieJson();
			
			$('.compareProducts input[type="checkbox"]').removeAttr("checked");
			$(productCodesStoredJsonload.products).each(function(index)
			{
				$('.compareProducts[data-pid="'+productCodesStoredJsonload.products[index]+'"]')
				.find('input[type="checkbox"]').attr("checked","checked");
			})
			
		}
	};

	$(document).ready(function(){
		with(ACC.compareproducts) {
			bindCompareproductsLink();
		}
	});
