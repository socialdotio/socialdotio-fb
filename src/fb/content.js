//Created by Aran Khanna All Rights Reserved

// Global Variables

// Facebooks message data endpoint
    var endpoint_url = "https://www.facebook.com/ajax/mercury/thread_info.php";

// User Data Variables
    // Counter for total number of async rest calls made
    var async_reqs = 0;
    var data = [];
    var current_profile = [];

// The Logic
    // On every request from the background script get the rest messages
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            getRestMessages(request.bodyText, function() {
                sendResponse();
            });
        }
    );

    // When the document is pull cached big pipe data out of it and add the map html
    $( document ).ready(function() {
        // Set up map
        setupMap(document);

        //Check for URL change (react simply diffs and rerenders page so we want to remove map overlay if the URL changes)
        var storedHash = document.URL;
        window.setInterval(function () {
            if (document.URL != storedHash) {
                storedHash = document.URL;
                if(storedHash.indexOf('facebook.com/messages') > -1){
                    $('#map-tab').css("display", "inline");
                }else{
                    $('#map-tab').css("display", "none");
                }
            }

            current_profile['name'] = $('#wmMasterViewThreadlist ._kv .accessible_elem').text();
            current_profile['photo'] = $('#wmMasterViewThreadlist ._kv img').attr('src');
            $('#map').empty();
            $('#map').append('<li style="list-style-type: none;" class="_k- _kv" role="listitem"><div class="clearfix"><div class="clearfix pvs"><div class="MercuryThreadImage mrm lfloat _ohe"><div class="_55lt" size="50" style="width:50px;height:50px;" data-reactid=".2u"><img src="' + current_profile['photo'] + '" width="50" height="50" alt="" class="img" data-reactid=".2u.0"></div></div><div class="_l4"><span class="accessible_elem">' + current_profile['name'] + '</span><div class="_l2"><span aria-hidden="true" class="_l1">' + current_profile['name'] + ' (happy)</span></div><div class="clearfix"><div class="_l6 rfloat _ohf"></div><div class="_l3 fsm fwn fcg"><span class="MercuryRepliedIndicator seenByListener repliedLast seenByAll"></span>Suggestion topic: [topic]</div></div></div></div></div></li>');
        }, 100);
    });

    // Gets and parses json data on user location from posting to FB messages endpoint
    // with the requestBody, calling the callback after its done
    function getRestMessages(requestBody, callback) {
        async_reqs++;
        console.log("requesting "+async_reqs);
        $.ajax({
            type:"POST",
            url: endpoint_url,
            data: requestBody,
            processData: false,
            complete: function(msg) {
                // Convert wierd json format to regular json string
                var cleanedText = "";
                var splitText = msg.responseText.split(';');
                for(var i=3; i<splitText.length; i++){
                    var cleanedText = cleanedText+splitText[i];
                }

                // Parse json string and extract location info for each message
                var json = jQuery.parseJSON(cleanedText);
                var messages = json.payload.actions;
                if (messages != undefined && messages.length > 0)
                {
                    var cur = new Array();

                    for (var i = 0; i < messages.length; ++i)
                    {
                        cur.push(messages[i]['body']);
                    }

                    data[messages[0]['thread_fbid']] = cur;
                }
                else
                {
                    console.log("No messages returned: " + msg.responseText);
                }
                callback();
            }
        });
    }

    // Adds the map div and map to the document, along with interactability
    function setupMap(document) {
        // Create tab for map
        var mapTab = document.createElement('div');
        mapTab.id = 'map-tab';
        $('body').append(mapTab);
        $('#map-tab').addClass("map-label");
        $('#map-tab').text('Socialdotio Fb');

        // Create content for DOM
        var mapDiv = document.createElement('div');
        mapDiv.id = 'map';
        $('#map-tab').append(mapDiv);

        // Set up click hierarchy for map tab and add expand retract functionality
        $("#map-tab div").click(function(e) {
            e.stopPropagation();
        });

        $('#map-tab').on("click", function() {
            if($(this).hasClass("map-expand")){
                $(this).removeClass("map-expand").addClass("map-label");
                $('#map').css("visibility", "visible");
            }else{
                $(this).removeClass("map-label").addClass("map-expand");
                $('#map').css("visibility", "hidden");
            }
        });
    }
