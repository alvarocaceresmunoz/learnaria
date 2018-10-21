$(document).ready(function() {
				
		$("#country").ik_suggest({ 
			min_length: 1,
			source: countries 
		});
				
});
;(function ( $, window, document, undefined ) {
 
var pluginName = "ik_suggest",
	defaults = {
  'instructions': "As you start typing the application might suggest similar search terms. Use up and down arrow keys to select a suggested search string.",
		'minLength': 2,
		'maxResults': 10,
		'source': []
		
	};
	
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {string} options.instructions - Custom instructions for screen reader users.
	 * @param {number} options.minLength - Mininmum string length before sugestions start showing.
	 * @param {number} options.maxResults - Maximum number of shown suggestions.
	 */
	function Plugin( element, options ) { 
		
		this.element = $(element);
		this.options = $.extend( {}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		
		this.init();
	}
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var $elem, plugin;
		
		plugin = this;
		
		plugin.notify = $('<div/>') // add hidden live region to be used by screen readers
			.addClass('ik_readersonly')
          .attr({
        'role': 'region',
        'aria-live': 'polite'
    });
		
		$elem = plugin.element
			.attr({
				'autocomplete': 'off'
			})
			.wrap('<span class="ik_suggest"></span>') 
			.on('focus', {'plugin': plugin}, plugin.onFocus)
			.on('keydown', {'plugin': plugin}, plugin.onKeyDown) // add keydown event
			.on('keyup', {'plugin': plugin}, plugin.onKeyUp) // add keyup event
			.on('focusout', {'plugin': plugin}, plugin.onFocusOut);  // add focusout event
		
		plugin.list = $('<ul/>').addClass('suggestions');
		
		$elem.after(plugin.notify, plugin.list);
				
	};
	
	/** 
	 * Handles focus event on text field.
	 * 
	 * @param {object} event - Keyboard event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onFocus = function (event) {
		
		var plugin;
		
		plugin = event.data.plugin;
    plugin.notify.text(plugin.options.instructions);

	};
	
	/** 
	 * Handles kedown event on text field.
	 * 
	 * @param {object} event - Keyboard event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onKeyDown = function (event) {
		
		var plugin, selected;
		
		plugin = event.data.plugin;
		
		switch (event.keyCode) {
			
			case ik_utils.keys.tab:
			case ik_utils.keys.esc:
								
				plugin.list.empty().hide(); // empty list and hide suggestion box
					
				break;
			
			case ik_utils.keys.enter:
				
				selected = plugin.list.find('.selected');
				plugin.element.val( selected.text() ); // set text field value to the selected option
				plugin.list.empty().hide(); // empty list and hide suggestion box
				
				break;
				
		}
		
	};
	
	/** 
	 * Handles keyup event on text field.
	 * 
	 * @param {object} event - Keyboard event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onKeyUp = function (event) {
		
		var plugin, $me, suggestions, selected, msg;
		
		plugin = event.data.plugin;
		$me = $(event.currentTarget);
    
    switch (event.keyCode) {
    case ik_utils.keys.down: // select next suggestion from list   
                selected = plugin.list.find('.selected');  
                if(selected.length) {
                    msg = selected.removeClass('selected').next().addClass('selected').text();
                } else {
                    msg = plugin.list.find('li:first').addClass('selected').text();
                }
                plugin.notify.text(msg); // add suggestion text to live region to be read by screen reader
                break;
            case ik_utils.keys.up: // select previous suggestion from list
                selected = plugin.list.find('.selected');
                if(selected.length) {
                    msg = selected.removeClass('selected').prev().addClass('selected').text();
                }
                plugin.notify.text(msg);  // add suggestion text to live region to be read by screen reader    
                break;
           
            default: // get suggestions based on user input
				plugin.list.empty();
				
				suggestions = plugin.getSuggestions(plugin.options.source, $me.val());
				
				if (suggestions.length > 1) {
					for(var i = 0, l = suggestions.length; i < l; i++) {
						$('<li/>').html(suggestions[i])
						.on('click', {'plugin': plugin}, plugin.onOptionClick) // add click event handler
						.appendTo(plugin.list);
					}
					plugin.list.show();
				} else {
					plugin.list.hide();
				}
				        break;
    }
	};
	
	/** 
	 * Handles fosucout event on text field.
	 * 
	 * @param {object} event - Focus event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onFocusOut = function (event) {
		
		var plugin = event.data.plugin;
		
		setTimeout(function() { plugin.list.empty().hide(); }, 200);
		
	};
	
	/** 
	 * Handles click event on suggestion box list item.
	 * 
	 * @param {object} event - Keyboard event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.onOptionClick = function (event) {
		
		var plugin, $option;
		
		event.preventDefault();
		event.stopPropagation();
		
		plugin = event.data.plugin;
		$option = $(event.currentTarget);
		plugin.element.val( $option.text() );
		plugin.list.empty().hide();
		
	};
	
	/** 
	 * Gets a list of suggestions.
	 * 
	 * @param {array} arr - Source array.
	 * @param {string} str - Search string.
	 */
	Plugin.prototype.getSuggestions = function (arr, str) {
		
		var r, pattern, regex, len, limit;
		
		r = [];
		pattern = '(\\b' + str + ')';
		regex = new RegExp(pattern, 'gi');
		len = this.options.minLength;
		limit = this.options.maxResults;
			
		if (str.length >= len) {
			for (var i = 0, l = arr.length; i < l ; i++) {
				if (r.length > limit ) {
					break;
				}
				if ( regex.test(arr[i]) ) {
					r.push(arr[i].replace(regex, '<span>$1</span>'));
				}
			}
		}
    
    if (r.length > 1) { // add instructions to hidden live area
        this.notify.text('Suggestions are available for this field. Use up and down arrows to select a suggestion and enter key to use it.');
    }
    
		return r;
		
	};

	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
 
})( jQuery, window, document );
var ik_utils = ik_utils || {};

ik_utils.keys =  {
	'tab': 9,
	'enter': 13,
	'esc': 27,
	'space': 32,
	'end': 35,
	'home': 36,
	'left': 37,
	'up': 38,
	'right': 39,
	'down':  40
}
ik_utils.getTransitionEventName = function(){
	var $elem, events, t, name;
	
	$elem = $('<div/>');
	events = {
		'transition': 'transitionend',
		'OTransition': 'oTransitionEnd',
		'MozTransition': 'transitionend',
		'WebkitTransition': 'webkitTransitionEnd'
	};
	
	for (t in events){
		if ($elem.css(t) !== undefined){
			name = events[t];
		}
	}
	
	return name;
}

var countries = [
	'Afganistan', 
	'Albania', 
	'Algeria', 
	'American Samoa', 
	'Andorra', 
	'Angola', 
	'Anguilla', 
	'Antarctica', 
	'Antigua and Barbuda', 
	'Argentina', 
	'Armenia', 
	'Aruba', 
	'Australia', 
	'Austria', 
	'Azerbaijan', 
	'Bahamas', 
	'Bahrain', 
	'Bangladesh', 
	'Barbados', 
	'Belarus', 
	'Belgium', 
	'Belize', 
	'Benin', 
	'Bermuda', 
	'Bhutan', 
	'Bolivia', 
	'Bosnia and Herzegowina', 
	'Botswana', 
	'Bouvet Island', 
	'Brazil', 
	'British Indian Ocean Territory', 
	'Brunei Darussalam', 
	'Bulgaria', 
	'Burkina Faso', 
	'Burundi', 
	'Cambodia', 
	'Cameroon', 
	'Canada', 
	'Cape Verde', 
	'Cayman Islands', 
	'Central African Republic', 
	'Chad', 
	'Chile', 
	'China', 
	'Christmas Island', 
	'Cocos Keeling Islands', 
	'Colombia', 
	'Comoros', 
	'Congo', 
	'Congo, Democratic Republic of the', 
	'Cook Islands', 
	'Costa Rica', 
	'Cote d\'Ivoire', 
	'Croatia Hrvatska', 
	'Cuba', 
	'Cyprus', 
	'Czech Republic', 
	'Denmark', 
	'Djibouti', 
	'Dominica', 
	'Dominican Republic', 
	'East Timor', 
	'Ecuador', 
	'Egypt', 
	'El Salvador', 
	'Equatorial Guinea', 
	'Eritrea', 
	'Estonia', 
	'Ethiopia', 
	'Falkland Islands Malvinas', 
	'Faroe Islands', 
	'Fiji', 
	'Finland', 
	'France', 
	'France, Metropolitan', 
	'French Guiana', 
	'French Polynesia', 
	'French Southern Territories', 
	'Gabon', 
	'Gambia', 
	'Georgia', 
	'Germany', 
	'Ghana', 
	'Gibraltar', 
	'Greece', 
	'Greenland', 
	'Grenada', 
	'Guadeloupe', 
	'Guam', 
	'Guatemala', 
	'Guinea', 
	'Guinea-Bissau', 
	'Guyana', 
	'Haiti', 
	'Heard and Mc Donald Islands', 
	'Holy See (Vatican City State)', 
	'Honduras', 
	'Hong Kong', 
	'Hungary', 
	'Iceland', 
	'India', 
	'Indonesia', 
	'Iran, Islamic Republic of', 
	'Iraq', 
	'Ireland', 
	'Israel', 
	'Italy', 
	'Jamaica', 
	'Japan', 
	'Jordan', 
	'Kazakhstan', 
	'Kenya', 
	'Kiribati', 
	'Korea, Democratic People\'s Republic of', 
	'Korea, Republic of', 
	'Kuwait', 
	'Kyrgyzstan', 
	'Lao People\'s Democratic Republic', 
	'Latvia', 
	'Lebanon', 
	'Lesotho', 
	'Liberia', 
	'Libyan Arab Jamahiriya', 
	'Liechtenstein', 
	'Lithuania', 
	'Luxembourg', 
	'Macau', 
	'Macedonia, The Former Yugoslav Republic of', 
	'Madagascar', 
	'Malawi', 
	'Malaysia', 
	'Maldives', 
	'Mali', 
	'Malta', 
	'Marshall Islands', 
	'Martinique', 
	'Mauritania', 
	'Mauritius', 
	'Mayotte', 
	'Mexico', 
	'Micronesia, Federated States of', 
	'Moldova, Republic of', 
	'Monaco', 
	'Mongolia', 
	'Montserrat', 
	'Morocco', 
	'Mozambique', 
	'Myanmar', 
	'Namibia', 
	'Nauru', 
	'Nepal', 
	'Netherlands', 
	'Netherlands Antilles', 
	'New Caledonia', 
	'New Zealand', 
	'Nicaragua', 
	'Niger', 
	'Nigeria', 
	'Niue', 
	'Norfolk Island', 
	'Northern Mariana Islands', 
	'Norway', 
	'Oman', 
	'Pakistan', 
	'Palau', 
	'Panama', 
	'Papua New Guinea', 
	'Paraguay', 
	'Peru', 
	'Philippines', 
	'Pitcairn', 
	'Poland', 
	'Portugal', 
	'Puerto Rico', 
	'Qatar', 
	'Reunion', 
	'Romania', 
	'Russian Federation', 
	'Rwanda', 
	'Saint Kitts and Nevis', 
	'Saint Lucia', 
	'Saint Vincent and the Grenadines', 
	'Samoa', 
	'San Marino', 
	'Sao Tome and Principe', 
	'Saudi Arabia', 
	'Senegal', 
	'Seychelles', 
	'Sierra Leone', 
	'Singapore', 
	'Slovakia (Slovak Republic)', 
	'Slovenia', 
	'Solomon Islands', 
	'Somalia', 
	'South Africa', 
	'South Georgia and the South Sandwich Islands', 
	'Spain', 
	'Sri Lanka', 
	'St. Helena', 
	'St. Pierre and Miquelon', 
	'Sudan', 
	'Suriname', 
	'Svalbard and Jan Mayen Islands', 
	'Swaziland', 
	'Sweden', 
	'Switzerland', 
	'Syrian Arab Republic', 
	'Taiwan, Province of China', 
	'Tajikistan', 
	'Tanzania, United Republic of', 
	'Thailand', 
	'Togo', 
	'Tokelau', 
	'Tonga', 
	'Trinidad and Tobago', 
	'Tunisia', 
	'Turkey', 
	'Turkmenistan', 
	'Turks and Caicos Islands', 
	'Tuvalu', 
	'Uganda', 
	'Ukraine', 
	'United Arab Emirates', 
	'United Kingdom', 
	'United States', 
	'United States Minor Outlying Islands', 
	'Uruguay', 
	'Uzbekistan', 
	'Vanuatu', 
	'Venezuela', 
	'Viet Nam', 
	'Virgin Islands (British)', 
	'Virgin Islands (U.S.)', 
	'Wallis and Futuna Islands', 
	'Western Sahara', 
	'Yemen', 
	'Yugoslavia', 
	'Zambia', 
	'Zimbabwe'
];