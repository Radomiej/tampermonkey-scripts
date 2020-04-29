// ==UserScript==
// @name         Novelki Translator Helper
// @namespace    https://novelki.pl
// @version      0.1
// @description  Dodatkowe usprawnienia dla tłumacza
// @author       Radomiej
// @match        https://novelki.pl/panel/projects/*/chapters/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @require      https://raw.githubusercontent.com/richtr/guessLanguage.js/master/lib/_languageData.js
// @require      https://raw.githubusercontent.com/richtr/guessLanguage.js/master/lib/guessLanguage.js
// @icon         https://novelki.pl/favicon-32x32.png

// ==/UserScript==

var scope = {
    foreginTexts: [],
    cacheMaxTime: 1000 * 60 * 60 * 24 * 7 //7 days cache
};

(function() {
    'use strict';
    // Your code here...
    $(window).on("load", function () {
        scriptStart();
    });
})();



function scriptStart(){
    //Get a reference to the CodeMirror editor
    var editor = document.querySelector('.CodeMirror').CodeMirror;
    scope.editor = editor;

    //Register key listener
    document.addEventListener ("keydown", function (event) {
        if (event.altKey && event.key === "t") { //case sensitive
            translate(editor.getSelection());
            event.preventDefault();
            return false;
        }
        else if (event.altKey && event.key === "r") { //case sensitive
            console.log("Restore");
            restoreLocalChanges();
            event.preventDefault();
            return false;
        }
        else if (event.altKey && event.key === "p") { //case sensitive
            console.log("Prepare");
            prepare();
            event.preventDefault();
            return false;
        }
    } );

    //Register auto save changes
    // on and off handler like in jQuery
    editor.on('change',function(cMirror){
        storeLocalChanges();
    });

    //Clear caches
    clearOldChanges();
}


function prepare(){
    for(var text of scope.foreginTexts) {
        guessLanguage.detect(text, function(language) { // confrim that it is not PL
            var fixate = scope.editor.getValue().replace(text, "");
            scope.editor.setValue(fixate);
        });
    }
}

function translate(englishText){
    scope.foreginTexts.push(englishText);
    var encodedText = encodeURIComponent(englishText);
    $.get( "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pl&hl=pl&dt=t&dt=bd&dj=1&source=icon&tk=629535.629535&q=" + encodedText, function( data ) {
        var translatedText = englishText + "\n";
        for(var item of data.sentences) {
            translatedText += item.trans;
        }
        scope.editor.replaceSelection(translatedText);

    });
}

function clearOldChanges(){
    var restores = new Map(JSON.parse(localStorage['trans-snapshoot'] || '[]'));
    var toRemoveKeys = [];
    restores.forEach(function (value, key, map) {
        if(Date.now() - value < scope.cacheMaxTime) return;
        console.log("Clear cache for: " + key);
        localStorage.removeItem(key);
        toRemoveKeys.push(key);
    });

    if(toRemoveKeys.length > 0){ // just logger
        console.log("Clear caches count: " + toRemoveKeys.length);
    }
    toRemoveKeys.forEach(function (value) {
        restores.delete(value);
    });
    localStorage['trans-snapshoot'] = JSON.stringify(Array.from(restores.entries()));
}

function storeLocalChanges(){
    var text = scope.editor.getValue();
    if(!text || text === '' || text.trim() === '') return;

    var url = $(location).attr('href');
    var restoreName = 'trans-snapshoot-' + url;
    localStorage[restoreName] = scope.editor.getValue();

    //Save store data
    if (localStorage.getItem("infiniteScrollEnabled") === null) {

    }
    var restores = new Map(JSON.parse(localStorage['trans-snapshoot'] || '[]'));
    restores.set(restoreName, Date.now());
    localStorage['trans-snapshoot'] = JSON.stringify(Array.from(restores.entries()));

}

function restoreLocalChanges(){
    var url = $(location).attr('href');
    var restoreChanges = localStorage['trans-snapshoot-' + url] || 'null';
    scope.editor.setValue(restoreChanges);
}