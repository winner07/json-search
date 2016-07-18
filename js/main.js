/*
 * Search objects in JSON file by search request
 * 
 * @param {string} jsonurl
 */
function jsonSearch(jsonurl){
	var jsonObjects;

	return {
		search : function(value, callback){
			// Expect words for search
			var expectWords = value.replace(/"/g, "").split(/\s+/);
			// Except words not for search
			var exceptWords = expectWords.filter(function(el, i){
				var passTest = /\-\w+/.test(el);
				
				if(passTest){
					expectWords.splice(i, 1);
				}
				
				return passTest;
			}).map(function(el, i){
				return el.replace("-", "");
			});
			var expectRegexp = new RegExp(expectWords.join("|"), "gi");
			var exceptRegexp = exceptWords.length ? new RegExp(exceptWords.join(""), "i") : null;
			var result = [];
			
			// Get result array from json object
			function getResults(){
				$.each(jsonObjects, function(i, object){
					var specificity = 0;
					var currentValue;
					var currentMatch;
					var isExcept = 0;
		
					for(var prop in object){
						currentValue = String(object[prop]);
						if(exceptRegexp){
							isExcept += exceptRegexp.test(currentValue) ? 1 : 0;
						}
						currentMatch = currentValue.match(expectRegexp);
						specificity += currentMatch ? currentMatch.length : 0;
					}

					if(!isExcept && specificity == expectWords.length){
						result.push({
							object : object,
							specificity : specificity
						});
					}
				});
				
				// Sort result
				result = result.sort(function(a, b){
					return b.specificity - a.specificity;
				}).map(function(el, i){
					return el.object;
				});
				
				if(callback){
					callback.call(this, result);
				};
			}
			
			// Get JSON data if they yet not retrieved else just get results
			if(!jsonObjects){
				$.getJSON(jsonurl, function(data){
					jsonObjects = data;
					
					getResults();
				});
			} else {
				getResults();
			}
		}
	}
}

$(document).ready(function(){
	var players = jsonSearch("js/players.json");
	
	// Get players on change or submit events
	$(".search").on("change submit", function(e){
		players.search($(this).find(".t-input").val(), function(data){
			var $searchRes = $(".search-results");
			$searchRes.empty();
			
			$.each(data, function(i, object){
				var itemRes = '<article class="item">' +
						'<header>' + object.name + ', ' + object.nationality + '</header>' +
						'<ul>' +
							'<li><b>position:</b> ' + object.position + '</li>' +
							'<li><b>jerseyNumber:</b> ' + object.jerseyNumber + '</li>' +
							'<li><b>dateOfBirth:</b> ' + object.dateOfBirth + '</li>' +
							'<li><b>contractUntil:</b> ' + object.contractUntil + '</li>' +
							'<li><b>marketValue:</b> ' + object.marketValue + '</li>' +
						'</ul>' +
					'</article>';
				$searchRes.append(itemRes);
			});
		});

		e.preventDefault();
	});
});