/* 
	Package: LMG Quiz
	Requires: jQuery
	Version:  1.0
	By: Bill Condo
	
		
	DEFAULT SETTINGS
	
	container 	         = #quiz
	start		         = #start
	form		         = #quiz_form
	questions	         = #questions
	question	         = .question
	results		         = #results
	prev		         = #prev
	next		         = #next
	submit	 	         = #submit
	process_url	         = <blank>
	answers_are_required = false
	
	DEFAULT HTML STRUCTURE
	
	<div id="quiz">
		<form id="quiz_form">
			<div id="start">
				<a id="start">Start The Quiz</a>
			</div>
			<ul id="questions">
				<li class="question">
					<label>Question 1</label>
					<input type="radio" name="question_1" value="A" />
					<input type="radio" name="question_1" value="B" />
				</li>
				<li class="question	">
					<label>Question 2</label>
					<input type="checkbox" name="question_2[]" value="A" />
					<input type="checkbox" name="question_2[]" value="B" />
				</li>
			</ul>
			<div id="results"></div>
		</form>
	</div>
	<a id="prev">Prev</a>
	<a id="next">Next</a>
	<a id="submit">Submit</a>

*/
if (!LMG) { var LMG = {}; }

LMG.quiz = {
	
    config: {
	  container:		    '#quiz',
	  start: 			    '#start_quiz',
	  form: 			    '#quiz_form',
	  questions: 		    '#questions',
	  question: 		    '.question',	  
	  results: 			    '#results',	  
	  prev: 			    '#prev',	  
	  next: 			    '#next',
	  submit: 			    '#submit',
	  process_url: 		    '',
	  on_prev:			    function(id) {},
	  on_next:			    function(id) {},
	  on_start:			    function() {},
	  on_submit:		    function() {},
	  answers_are_required: false
    },
	
	init:function(config) {
		this.set_config(config);
		this.set_events();
	},
	
	set_config:function(config) {
		$.each(config, function($key,$value) {
			if (LMG.quiz.config.hasOwnProperty($key)) {
				LMG.quiz.config[$key] = $value;	
			}
		});		
	},
	
	set_events:function() {
		// Start Button
		if(this.config.start.length) {	
			$(this.config.start).click(function(e) { e.preventDefault(); LMG.quiz.start(); });
		}
		// Previous Button
		if(this.config.prev.length) {	
			$(this.config.prev).click(function(e) { e.preventDefault(); LMG.quiz.prev(); });
		}
		// Next Button
		if(this.config.next.length) {	
			$(this.config.next).click(function(e) { e.preventDefault(); LMG.quiz.next(); });
		}
		// Submit Button
		if(this.config.submit.length) {	
			$(this.config.submit).click(function(e) { e.preventDefault(); LMG.quiz.show_results(); });
		}				
	},

	start:function() {
		this.load_question(1);
		if(typeof this.config.on_start === 'function') {
			this.config.on_start();
			this.update_navigation();
		}	
	},
	
	question_is_answered:function() {
        
        var question_id = this.this_question_id();
        if(question_id>0) {
            var question = this.current_question();
            var checked = question.find('input:checked');
            if(checked.length>0) {
                return true;
            }  
        }      
        return false; 
	},
		
	prev:function() {
		if(this.can_go_prev()) {
			this.load_question(this.this_question_id()-1);
			this.update_navigation();
			$(this.config.questions).show();
			if(typeof this.config.on_prev === 'function') {
				this.config.on_prev(this.this_question_id());
			}
		}
	},
	
	can_go_prev:function() {
		var current = this.this_question_id();
		if(current>1) {	
			return true;
		}		
		return false;
	},
	
	next:function() {
		if(this.can_go_next()) {
		    if(!this.config.answers_are_required || this.question_is_answered()) {
    			this.load_question(this.this_question_id()+1);
    			this.update_navigation();
    			if(typeof this.config.on_next === 'function') {
    				this.config.on_next(this.this_question_id());
    			}
			}
		} else if(this.can_submit()) {
			if(this.config.process_url.length) {
			    this.get_show_results();
			}
			if(typeof this.config.on_submit === 'function') {
				this.config.on_submit();
			}
		}
	},

	can_go_next:function() {
		var current = this.this_question_id();
		var question = $(this.config.questions+' '+this.config.question+'.q_'+(parseInt(current)+1));
		if(question.length>0) {
			return true;
		}
		return false;
	},
	
	can_submit:function() {
		if(!this.can_go_next() && !this.results_showing()) {
			return true;	
		}
		return false;
	},
	
	update_navigation:function() {
		if(this.can_go_prev()) {
			$(this.config.prev).removeClass('disabled');
		} else {
			$(this.config.prev).addClass('disabled');			
		}
		if(this.can_go_next() || this.can_submit()) {
			$(this.config.next).removeClass('disabled');
		} else {
			$(this.config.next).addClass('disabled');			
		}	
	},
	
	load_question:function(id) {        
        $(this.config.questions+' '+this.config.question).removeClass('active');   
        $(this.config.questions+' '+this.config.question+'.q_'+id).addClass('active');        		  		
	},
	
	this_question_id:function() {
		var selector = this.config.questions+" "+this.config.question+".active";
		return parseInt( $(selector).data('id') );
	},
	
	current_question:function() {
		return $(this.config.questions+' '+this.config.question+'.q_'+this.this_question_id());
	},
	
	results_showing:function() {
		var is_visible = $(this.config.results+":visible").length;
		if(is_visible) {	
			return true;
		}
		return false;
	},
	
	hide_results:function() {
		$(this.config.results).hide();
	},
	
	show_questions:function() {
		$(this.config.questions).show();
		this.update_navigation();			
	},
	
	get_show_results:function() {
		var form_data = $(this.config.form).serialize();
	    $.ajax({
		  async: false,
		  url: this.config.process_url+"?"+form_data,
		  success: function(data) {
			$(LMG.quiz.config.results).html(data).show();					
			LMG.quiz.update_navigation();
		  },
		  error: function(data) {
			return false;	  
		  }
		});
	},

	debug:function(contents) {
		try {window.console.log(contents)} catch (err) {}
	}

};