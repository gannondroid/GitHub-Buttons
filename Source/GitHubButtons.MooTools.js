/*
---
name: GitHub-Buttons
description: Unofficial GitHub Buttons inspired by https://github.com/mdo/github-buttons

license: Dual-Licensed under "The MIT License (X11)" and "Apache 2.0 License"

authors:
  - Andi Dittrich
  
requires:
  - Core/1.4.5
  - More/Number.Format
  - More/Request.JSONP

provides: [GitHubButton]
...
 */
var GitHubButton = new Class({
	Implements: Options,
	
	// contains the required html structure
	buttonContainer: null,

	options: {
		// large or small button ?
		large: false,
		
		// GitHub username
		owner: null,
		
		// GitHub repository name
		repo: null,
		
		// Button type (star, fork, watch, follow)
		type: 'star',
		
		// custom button text
		text: null,
		
		// enabled/disable counter - manual set the value
		count: true
	},	
	
	initialize: function(options){
		this.setOptions(options);

		// jsonp rest service url
		var url = 'https://api.github.com';
		
		// create repo url
		var repoUrl = 'https://github.com/' + this.options.owner + '/' + this.options.repo + '/';
		var actionUrl = 'https://github.com/' + this.options.owner + '/';
		
		// text to display
		var text = '-';
		
		// star, fork, follow, watch are supported
		switch (this.options.type){
			case 'star':
				url += '/repos/' + this.options.owner + '/' + this.options.repo + '/stargazers';
				text = 'Star';
				actionUrl = repoUrl + 'stargazers';
				break;
				
			case 'fork':
				url += '/repos/' + this.options.owner + '/' + this.options.repo + '/forks';
				text = 'Fork';
				actionUrl = repoUrl + 'network';
				break;
				
			case 'watch':
				url += '/repos/' + this.options.owner + '/' + this.options.repo + '/subscribers';
				actionUrl += this.options.repo + '/watchers';
				text = 'Watchers';
				break;
				
			case 'follow':
				url += '/users/' + this.options.owner + '/followers';
				text = 'Follow @' + this.options.owner;
				repoUrl = actionUrl;
				actionUrl += 'followers';
				break;
		}
		
		// create html structure
		// @see https://github.com/mdo/github-buttons/blob/master/github-btn.source.html
		// <span class="github-btn" id="github-btn">
		//  <a class="gh-btn" id="gh-btn" href="#" target="_blank">
		//    <span class="gh-ico"></span>
		//    <span class="gh-text" id="gh-text"></span>
		//  </a>
		//  <a class="gh-count" id="gh-count" href="#" target="_blank"></a>
		// </span>
		
		// create elements
		this.buttonContainer = new Element('div', {
			'class': 'github-btn ' + (this.options.large ? 'github-btn-large' : '')
		});
		var count = new Element('a', {
			'class': 'gh-count',
			href: actionUrl,
			target: '_blank'
		});
		var ico = new Element('span', {
			'class': 'gh-ico'
		});
		var txt = new Element('span', {
			'class': 'gh-text',
			text: (this.options.text ? this.options.text : text)
		});
		var button = new Element('a', {
			'class': 'gh-btn',
			href: repoUrl,
			target: '_blank'
		});
		
		// create structure
		button.grab(ico).grab(txt);
		this.buttonContainer.grab(button).grab(count);
			
		// which "count"-mode should be used ?
		if (typeof this.options.count == 'boolean'){
			// show count and request the data via JSONP ?
			if (this.options.count){
				// request data
				new Request.JSONP({
					// the rest service url
				    url: url,
				    
				    // jsonp callback get parameter
				    // @see https://developer.github.com/v3/#json-p-callbacks
				    callbackKey: 'callback',
				    
				    // request complete handler
				    onComplete: function(response){
				    	// valid reponse ? request limit not exceeeded ?
				    	if (response.data.length){
							count.set('text', response.data.length.format({group: '.'}));
				    	}
				    }.bind(this)
				}).send();
			}else{
				// hide counter
				count.setStyle('display', 'none');
			}
			
		}else{
			// manually set the value
			count.set('text', this.options.count.format({group: '.'}));
		}		
	},
	
	toElement: function(){
		return this.buttonContainer;
	}
});

// Native Element extension - jQuery like usage
(function(){
	Element.implement({
		GitHubButton: function(options){
			this.grab(new GitHubButton(options));
		}
	});
})();