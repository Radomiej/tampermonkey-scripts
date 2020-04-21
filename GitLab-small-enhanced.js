// ==UserScript==
// @name         GitLab small enhanced
// @namespace    https://github.com/Radomiej/tampermonkey-scripts
// @version      0.1
// @description  Better brench names in pipelines
// @author       Radomiej
// @match        http://gitlab.itti.com.pl/*/*/pipelines
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    GM_addStyle ( `
.ci-table .branch-commit .ref-name {
max-width: 200px;
}
` );

    window.addEventListener('load', function() {
        // your code here
         $('.table-section.section-wrap.section-20').each(function() {
            $( this ).removeClass( "section-20" ).addClass( "section-30" );
            console.log("mutuje");}
         );

    }, false);

})();