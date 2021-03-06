/*
 *  User actions
 */
function followUser(loginToFollow) {
	$.ajax({
		type: HTTP_GET,
		url: replaceIdInURL(FRIEND_ADD_REST,loginToFollow),
		dataType: JSON_DATA,
        success: function(data) {

			setTimeout(function()
			{
	            $("#userSearchInput").val("");
	            updateUserCounters();
	            followMessage(loginToFollow,true);
	            refreshUserSuggestions();
	            refreshFriendsline(login);
			},300);

        },
    	error: followError()
	});

	return false;
}

function removeFriend(loginToForget) {
	
	$.ajax({
		type: HTTP_GET,
		url: replaceIdInURL(FRIEND_REMOVE_REST,loginToForget),
		dataType: JSON_DATA,
        success: function(data) {

			setTimeout(function()
			{
	        	updateUserCounters();
	        	followMessage(loginToForget,false);	
	        	refreshUserSuggestions();
	        	refreshFriendsline(login);
			},300);

        },
    	error: followError()
	});
}

function updateProfile() {
	
	$('#userProfileErrorPanel').hide();
	
	$.ajax({
		type: HTTP_POST,
		url: USER_UPDATE_REST,
		contentType: JSON_CONTENT,
		data: JSON.stringify($("#updateUserForm").serializeObject()),
		dataType: JSON_DATA,
		success: function(data) {
			$('#defaultTab').tab('show');
			setTimeout(function()
			{
				loadHome();
				updateUserCounters();
			},300);		
		},
		error: errorHandler($('#userProfileErrorPanel'))
	});
	return false;
}


function tweet() {
	$('#tweetErrorPanel').hide();
	$.ajax({
        type: HTTP_POST,
        url: TWEET_POST_REST,
        contentType: JSON_CONTENT,
        data:  JSON.stringify({content: $.trim($("#tweetContent").val())}),
        dataType: JSON_DATA,
        success: function(data) {
			setTimeout(function()
			{
				$("#tweetContent").slideUp().val("").slideDown('fast');
				updateUserCounters();
				refreshTimeline();
				refreshUserSuggestions();
			},300);	
        },
        error: errorHandler($('#tweetErrorPanel'))
    });
	return false;
}


function updateUserCounters()
{
	$.ajax({
		type: HTTP_GET,
		url: replaceIdInURL(USER_STATS_REST,login),
		dataType: JSON_DATA,
		success: function(data) {
			$("#tweetCount").text(data.tweetCount);
			$("#friendsCount").text(data.friendsCount);
			$("#followersCount").text(data.followersCount);
			
		}
	});
}

function showUserProfile(userLogin)
{
	$.ajax({
		type: HTTP_GET,
		url: replaceIdInURL(USER_SHOW_REST,userLogin),
		dataType: JSON_DATA,
		success: function(data) {
			
			updateUserProfileModal(data);
			$('#userProfileModal').modal('show');
		}
	});
}

function quoteUser(userToQuote)
{
	$('#defaultTab').tab('show');
	$('#tweetContent').empty().trigger('focus').html('@'+userToQuote);
}

function updateUserProfileModal(user)
{
	$('#userProfileModal')
	.find('#userProfileLogin').html('@'+user.login).end()
	.find('#userProfileGravatar .tweetGravatar').attr('src','http://www.gravatar.com/avatar/'+user.gravatar+'?s=128').end()
	.find('#userProfileName').html(user.firstName+'&nbsp;'+user.lastName).end()
	.find('#userProfileLocation span:nth-child(2)').html(user.location).end()
	.find('#userProfileWebsite a').html(user.website).attr('href',user.website).end()
	.find('#userProfileBio').html(user.biography).end()
	.find('#userProfileTweetsCount').attr('data-user',user.login).html(user.tweetCount).end()
	.find('#userProfileFriendsCount').attr('data-friends',user.login).html(user.friendsCount).end()
	.find('#userProfileFollowersCount').attr('data-followers',user.login).html(user.followersCount).end()
	.find('.btn').hide();
	
	if(user.login != login)
	{
		$('#userProfileModal')
		.find('#userProfileDoQuote').attr('data-quote',user.login).show().end()
		.find(user.directMessage ? '#userProfileDoWrite':'#userProfileDoQuote').attr('data-direct-message',user.login).show().end()
		.find(user.follow ? '#userProfileDoFollow':'#userProfileDoForget').attr(user.follow ? 'data-follow':'data-unfollow',user.login).show().end()
		.find('#userProfileDoBlock').attr('data-block',user.login).show();
		
	}
}

/*
 *  Lines activation
 */
function loadHome()
{
	$('#homeTabContent').empty();
	$('#homeTabContent').load('fragments/user.html #homeContent',
	function()
	{
		bindListeners($('#homeTabContent'));	
	});
}

function loadProfile()
{
	$('#profileTab').empty();
	$('#profileTab').load('fragments/profile.html #profileContent',function()
	{
		bindListeners($('#profileTab'));
	});
	
}

/*
 *  Lines refresh
 */
function refreshUserSuggestions()
{
	$.ajax({
		type: HTTP_GET,
		url: USER_SUGGESTIONS_REST,
		dataType: JSON_DATA,
        success: function(data)
        {
    		var $tableBody = $('#userSuggestions');
    		$tableBody.empty();
    		if((data || []).length>0)
    		{
	        	$.each(data,function(index, user)
	        	{        		
	        		$tableBody.append(fillUserTemplate(user,"suggestions"));
	        	});
	        	
    		}
        	else
        	{
        		$newUserLine = $('#emptyUserTemplate').clone().attr('id','').appendTo($tableBody);
        	}	
        	registerUserDetailsPopOver($('#userSuggestions'));
        }
    });	
}

function refreshFriendsline(user)
{
	$('#friendsLine footer').attr('data-userFetch-key',user);
	if(user != login)
	{
		$('#friendsLine h2').html("Friends of "+user).addClass('red');
	}
	else
	{
		$('#friendsLine h2').html("My friends").removeClass('red');
	}
	
	if($('#friendsLine').hasClass('active'))
	{
		refreshCurrentUserLine();
	}	
	else
	{
		directContatTabClick = false;
		$('#friendsTab').tab('show');
		directContatTabClick = true;
	}	
}

function refreshFollowersline(user)
{
	$('#followersLine footer').attr('data-userFetch-key',user);
	if(user != login)
	{
		$('#followersLine h2').html("Followers of "+user).addClass('red');
	}
	else
	{
		$('#followersLine h2').html("My followers").removeClass('red');
	}
	
	if($('#followersLine').hasClass('active'))
	{
		
		refreshCurrentUserLine();
	}	
	else
	{
		directContatTabClick = false;
		$('#followersTab').tab('show');
		directContatTabClick = true;
	}
}


function refreshCurrentUserLine()
{
	var usersNb = $('#userDetailsPanel div.tab-pane.active tbody tr.data').size();
	var targetLine = $('#userDetailsPanel div.tab-pane.active.userLine').attr('id');
	if(targetLine != null)
	{
		refreshUserLine(targetLine,null,usersNb,true);
	}
		

	return false;
}	

function refreshUserLine(targetLine,startUser,count,clearAll)
{	
	var data_userFetch_url = $('#'+targetLine+' footer').attr('data-userFetch-url');
	var data_userFetch_type = $('#'+targetLine+' footer').attr('data-userFetch-type');
	var data_userFetch_key = $('#'+targetLine+' footer').attr('data-userFetch-key');
	var $tableBody = $('#'+targetLine+' .userLineContent');
	
	var userFetchRangeObject = buildUserFetchRange(startUser,count,data_userFetch_key);
	 
	$.ajax({
		type: HTTP_POST,
		url: data_userFetch_url,
		contentType: JSON_CONTENT,
        data:  JSON.stringify(userFetchRangeObject),
		dataType: JSON_DATA,
        success: function(data)
        {
        	if((data || []).length>0)
    		{
        		if(clearAll)
        		{
        			$tableBody.empty();
            		$('#userPaddingTemplate tr').clone().appendTo($tableBody);
            		$('#userPaddingTemplate tr').clone().appendTo($tableBody);
        		}
        		else
        		{
        			$tableBody.find('tr:last-child').remove();
        		}
        		
	        	$.each(data,function(index, user)
	        	{        		
	        		$tableBody.append(fillUserTemplate(user,data_userFetch_type));
	        	});
	        	
	        	$('#userPaddingTemplate tr').clone().appendTo($tableBody).show();
    		}
        	else if(clearAll)
    		{
        		$tableBody.empty();
    		}
        }
    });	
}


function buildUserFetchRange(startUser,count,functionalKey)
{
	return {
		startUser: startUser,
		count: count,
		functionalKey: functionalKey
	};
}


/*
 * Handlers registration
 */

function registerRefreshUserLineListeners()
{
	$('.refreshUserLineIcon').click(refreshCurrentUserLine);
}

function registerUserProfileModalListeners()
{
	bindListeners($('#userProfileStats'));
	bindListeners($('#userProfileAction'));
};

function registerFetchUserHandlers()
{
	$('.pageSelector')
	.find('option:eq(0)').html(FIRST_FETCH_SIZE).end()
	.find('option:eq(1)').html(SECOND_FETCH_SIZE).end()
	.find('option:eq(2)').html(THIRD_FETCH_SIZE);
	
	$('.userPagingButton').click(function(event)
	{
		var $target = $(event.target);
		var userNb = $target.closest('footer').find('.pageSelector option').filter(':selected').val(); 
		var targetLine =  $target.closest('div.tab-pane.active').attr('id');
		var startUser = $target.closest('footer').closest('div').find('.userLineContent tr.data').last().find('.tweetGravatar').attr('data-user');
		refreshUserLine(targetLine,startUser,parseInt(userNb),false);
				
		return false;
	});
}


function registerUserSearchListener()
{
	$('#userSearchForm button').click(function()
	{
		$('#searchErrorPanel').hide();
		$.ajax({
			type: HTTP_POST,
			url: USER_SEARCH_REST,
	        contentType: "application/json;  charset=UTF-8",
	        data:  JSON.stringify({searchString: $.trim($("#userSearchInput").val())}),			
			dataType: JSON_DATA,
			success: function(data) {
				
				var $tableBody = $('#userSearchList');
	    		$tableBody.empty();
	    		if((data || []).length>0)
	    		{
		        	$.each(data,function(index, user)
		        	{        		
		        		$tableBody.append(fillUserTemplate(user,"search"));
		        	});
		        	
	    		}
	        	else
	        	{
	        		$newUserLine = $('#emptyUserSearchTemplate').clone().attr('id','').appendTo($tableBody);
	        	}
				$('#userSearchModal').modal('show');
			},
			error: errorHandler($('#searchErrorPanel'))
		});
		
		return false;
	});
}

function registerUserDetailsPopOver($target)
{
	$target.find('.tweetGravatar').mouseenter(function()
	{
		if($(this).data('popover') == null)
		{
			var data_user= $(this).attr('data-user');
			$(this).popover({
				animation: false,
				placement: 'right',
				trigger: 'manual',
				title: 'User details',
				html : true,
				template: $('#popoverTemplate').clone().attr('id','').attr('z-index',2000).find('div.popover').attr('data-user',data_user).end().html()
			});
		}
		$(this).popover('show');
		$(this).data('popover').tip().css({'z-index': 2000});
		
		$.ajax({
			type: HTTP_GET,
			url: replaceIdInURL(USER_PREVIEW_REST,$('.popover.in').attr('data-user')),
			dataType: JSON_DATA,
	        success: function(data)
	        {
	        	$('.popover.in .userDetailsTitle').empty()
	        	.append('<img class="userDetailsGravatar" src="http://www.gravatar.com/avatar/'+data.gravatar+'?s=24"></img>')
	        	.append('<span>@'+data.login+'</span>');
	        	
	        	$('.popover.in .userDetailsContent').empty();
	        	$('#userDetailsTemplate .row-fluid').clone()
	        	.find('.userDetailsName').html(data.firstName+'&nbsp;'+data.lastName).end()
	        	.find('.userDetailsTweetsCount').html(data.tweetCount).end()
	        	.find('.userDetailsFriendsCount').html(data.friendsCount).end()
	        	.find('.userDetailsFollowersCount').html(data.followersCount).end()
	        	.appendTo('.popover.in .userDetailsContent');
	        	
	        }
	    });
		
	});
	
	$target.find('.tweetGravatar').mouseleave(function()
	{
		$(this).popover('hide');
	});
}

/*
 *  User template handling
 */

function fillUserTemplate(user,data_userFetch_type)
{
	$newUserLine = $('#fullUserTemplate').clone().attr('id','');
	
	$newUserLine
	.find('.tweetGravatar').attr('data-user',user.login).attr('src','http://www.gravatar.com/avatar/'+user.gravatar+'?s=32').attr('data-modal-highlight','#userProfileModal').end()
	.find('.userLink').attr('data-user',user.login).attr('title','Show '+user.login+' tweets').end()
	.find('em').html('@'+user.login).end()
	.find('.userDetailsName').html(user.firstName+' '+user.lastName).end()
	.find('.badge').html(user.tweetCount).attr('data-user',user.login);
	
	if(data_userFetch_type == "suggestions")
	{
			$newUserLine.find('.userAction a').attr('data-follow',user.login)
			.attr('title','Follow '+user.login).attr('data-modal-hide','#userSearchModal')
			.find('i').addClass('icon-eye-open');	
	}
	else if(data_userFetch_type == "search" || data_userFetch_type == "followers")
	{
		// No action if user == currentUser
		if(login != user.login)
		{
			if(user.follow)
			{
				$newUserLine.find('.userAction a').attr('data-follow',user.login)
				.attr('title','Follow '+user.login).attr('data-modal-hide','.modal')
				.find('i').addClass('icon-eye-open');
			}
			else
			{
				$newUserLine.find('.userAction a').attr('data-unfollow',user.login)
				.attr('title','Stop following '+user.login).attr('data-modal-hide','.modal')
				.find('i').addClass('icon-eye-close');
			}	
		}
	}
	else if(data_userFetch_type == "friends")
	{
		// No action if user == currentUser
		if(login != user.login)
		{
			$newUserLine.find('.userAction a').attr('data-unfollow',user.login)
			.attr('title','Stop following '+user.login)
			.find('i').addClass('icon-eye-close');
		}	
	}
		
	
	
	bindListeners($newUserLine);
	
	return $newUserLine;
}

/*
 *  Error messages
 */

function followMessage(targetLogin,follow)
{
	if(follow)
	{	
		$('#followSuccess').find('span').remove();
		$('#followSuccess').fadeIn("fast").append('<span>You are now following '+targetLogin+'</span>');
		$('#followSuccess').delay(500).fadeOut(1000);
	}
	else
	{
		$('#followSuccess').find('span').remove();
		$('#followSuccess').fadeIn("fast").append('<span>You no longer follow '+targetLogin+'</span>');
	    $('#followSuccess').delay(500).fadeOut(1000);		
	}	
}


function followError()
{
	return function(xhr, ajaxOptions, thrownError)
	{
		if(thrownError != 901)
		{
			$('#followError').find('span').remove();
			$('#followError').fadeIn("fast").append('<span>'+xhr.responseText+'</span>');
	        $('#followError').delay(2000).fadeOut(5000);
		}
				
	};
}