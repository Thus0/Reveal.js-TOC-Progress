/**
 * Author: Thus0
 *
 * Javascript for the toc_progress4x plugin for Reveal.js 4.x
 *      fork from TOC-Progress plugin by Igor Leturia, to be compatible with Reveal.js 4.x
 *      
 *
 * License: GPL v3 (see LICENSE.md)
 *
 * credits:
 *   - Chalkboard by Asvin Goel https://github.com/rajgoel/reveal.js-plugins/
 *   - TOC-Progress by Igor Leturia https://github.com/lucarin91/Reveal.js-TOC-Progress/
 */

window.toc_progress4x = window.toc_progress4x || {
    id: 'toc_progress4x',
    init: function (deck) {
        initialize(deck);
    }
};

/**
 * Get plugin path
 */
function scriptPath() {
    // obtain plugin path from the script element
    var src;
    if ( document.currentScript ) {
        src = document.currentScript.src;
    } else {
        var sel = document.querySelector( 'script[src$="/toc-progress/toc-progress4x.js"]' )
        if ( sel ) {
            src = sel.src;
        }
    }
    var path = ( src === undefined ) ? "" : src.slice( 0, src.lastIndexOf( "/" ) + 1 );
    console.log("Path: " + path);
    return path;
}

// Get plugin path
var path = scriptPath();

/**
 * Init plugin TocProgress2
 */
const initialize = function(Reveal) {
    // Global variables
    var toc_progress_on = false;            // indicate that TOC-Progress footer is displayed

    // Initialize default configuration
    var reduce_or_scroll = 'scroll';        // "reduce" | "scroll"
    var background = 'rgba(0,0,127,0.1)';
    var current_color = 'white';
    var viewport = "body";                  // "html" for Reveal.js 3.x | "body" for Reveal.js 4.x
    var hide_h2_title = true;               // hide h2 title on secondary view
    var show_toc = true;                    // show TOC-Progress footer on startup
    var hotkey = "Q";                       // hotkey to toggle TOC-Progress footer


    // Load configuration file
    var config = configure();

    // Load CSS stylesheet
    loadStylesheet(config, path);

    // Load key bindings
    loadKeyBindings(config);

    // Call toggle on startup
    if (show_toc == true) {
        toggle();
    }

    /**
     * Capture 'slidechanged' event to reduce or scroll the elements in the TOC-Progress footer if necessary
     */
    Reveal.addEventListener( 'slidechanged', function( event ) {
        console.log("'slidechanged' event received");
        reduceOrScrollIfNecessary(reduce_or_scroll);
    } );

    /**
     * Load configuration
     */
    function configure() {
        console.log("configure");
        config = Reveal.getConfig().toc_progress4x || {};
        if ( 'reduce_or_scroll' in config ) reduce_or_scroll = config.reduce_or_scroll;
        if ( 'background' in config ) background = config.background;
        if ( 'current_color' in config ) current_color = config.current_color;
        if ( 'viewport' in config ) viewport = config.viewport;
        if ( 'hide_h2_title' in config ) hide_h2_title = config.hide_h2_title;
        if ( 'show_toc' in config ) show_toc = config.show_toc;
        if ( 'hotkey' in config ) hotkey = config.hotkey;
    }

    /**
     * Load stylesheet
     */
    function loadStylesheet(config, path) { 
        var head = document.querySelector("head");

        // Add footer_process.css stylesheet
        var link = document.createElement("link");
        link.href = path + "toc-progress.css";
        link.type = "text/css";
        link.rel = "stylesheet";

        // Wrapper for callback to make sure it only fires once
        var finish = function() {
            if ( typeof callback === 'function' ) {
                callback.call();
                callback = null;
            }
        };
        link.onload = finish;
        // Internet Explorer
        link.onreadystatechange = function () {
            if ( readyState === 'loaded' ) {
                finish();
            }
        };
        // Normal browsers
        head.appendChild(link);
    }

    /**
     * Load key bindings
     */
    function loadKeyBindings(config) {
        // Capture 'Q' (81) key to toggle the diplay of the TOC-Progress footer
        // TODO: warn user if key is already set
        Reveal.addKeyBinding( { keyCode: hotkey.charCodeAt(0), key: hotkey, description: "Toggle TOC-Progress footer" }, function() {toggle()} ); 
    }

    /*
     * Function to obtain all child elements with any of the indicated tags
     * (from http://www.quirksmode.org/dom/getElementsByTagNames.html)
     */
    function getElementsByTagNames(list,obj) {
        if (!obj) {
            var obj=document;
        };
        console.log("obj");console.log(obj);
        console.log("list");console.log(list);
        var tagNames=list.split(',');
        var resultArray=new Array();
        for (var i=0;i<tagNames.length;i++) {
            var tags=obj.getElementsByTagName(tagNames[i]);
            for (var j=0;j<tags.length;j++) {
                resultArray.push(tags[j]);
            };
        };
        var testNode=resultArray[0];
        if (!testNode) {
            return [];
        };
        if (testNode.sourceIndex) {
            resultArray.sort(
                function (a,b) {
                    return a.sourceIndex-b.sourceIndex;
                }
            );
        } else if (testNode.compareDocumentPosition) {
            resultArray.sort(
                function (a,b) {
                    return 3-(a.compareDocumentPosition(b)&6);
                }
            );
        };
        return resultArray;
    };

    /**
     * Method to create the TOC-Progress footer
     */
    function create() {
        console.log("create");

        // Create the skeleton
        var toc_progress_footer = document.createElement("footer");
        toc_progress_footer.setAttribute('id','toc-progress-footer');
        toc_progress_footer.setAttribute('style','background:'+background);
        var toc_progress_footer_main=document.createElement('div');
        toc_progress_footer_main.setAttribute('id','toc-progress-footer-main');
        toc_progress_footer.appendChild(toc_progress_footer_main);
        var toc_progress_footer_main_inside=document.createElement('div');
        toc_progress_footer_main_inside.setAttribute('id','toc-progress-footer-main-inside');
        toc_progress_footer_main.appendChild(toc_progress_footer_main_inside);
        var toc_progress_footer_main_inside_ul=document.createElement('ul');
        toc_progress_footer_main_inside.appendChild(toc_progress_footer_main_inside_ul);
        var toc_progress_footer_secondary=document.createElement('div');
        toc_progress_footer_secondary.setAttribute('id','toc-progress-footer-secondary');
        toc_progress_footer.appendChild(toc_progress_footer_secondary);
        var toc_progress_footer_secondary_inside=document.createElement('div');
        toc_progress_footer_secondary_inside.setAttribute('id','toc-progress-footer-secondary-inside');
        toc_progress_footer_secondary.appendChild(toc_progress_footer_secondary_inside);
        var toc_progress_footer_secondary_inside_ul=document.createElement('ul');
        toc_progress_footer_secondary_inside.appendChild(toc_progress_footer_secondary_inside_ul);
        var toc_progress_footer_secondary_inside_ul_ul=document.createElement('ul');
        toc_progress_footer_secondary_inside_ul.appendChild(toc_progress_footer_secondary_inside_ul_ul);
        var div_class_reveal=document.querySelectorAll('.reveal')[0];
        div_class_reveal.appendChild(toc_progress_footer);

        // Create the style element
        var style_node=document.createElement('style');
        style_node.setAttribute('id','toc-progress-style');
        style_node.appendChild(document.createTextNode('\n'));
        div_class_reveal.parentNode.insertBefore(style_node,div_class_reveal.nextSibling);

        // Detect main sections and subsections
        // and create list elements in the TOC-Progress footer and styles for each
        var main_sections=document.querySelectorAll('.slides > section');	
        for (var main_sections_index=0;main_sections_index<main_sections.length;main_sections_index++) {
            var main_section=main_sections[main_sections_index];
            var secondary_sections=main_section.getElementsByTagName('section');

            // Main title
            var main_title_set = false;
            {
                var title_element=getElementsByTagNames('h1,h2,h3',main_section)[0];
                // begin debug
                //console.log("Main title_element: ");
                //console.log(title_element);
                // end debug
                if (title_element!=null && (!title_element.hasAttribute('class') || title_element.getAttribute('class').indexOf('no-toc-progress')==-1)) {
                    if (main_section.hasAttribute('data-state')) {
                        main_section.setAttribute('data-state',main_section.getAttribute('data-state')+' toc-progress-'+main_sections_index.toString());
                    } else {
                        main_section.setAttribute('data-state','toc-progress-'+main_sections_index.toString());
                    };
                    var li_element=document.createElement('li');
                    li_element.setAttribute('id','toc-progress-'+main_sections_index.toString());
                    toc_progress_footer_main_inside_ul.appendChild(li_element);
                    var a_element=document.createElement('a');
                    a_element.setAttribute('href','#/'+main_sections_index.toString());
                    a_element.appendChild(document.createTextNode(title_element.textContent));
                    li_element.appendChild(a_element);
                    style_node.textContent=style_node.textContent+'.toc-progress-'+main_sections_index.toString()+' #toc-progress-'+main_sections_index.toString()+' a{font-weight: bold; color: ' + current_color + '}\n';
                    style_node.textContent=style_node.textContent+viewport+'[class*="toc-progress-'+main_sections_index.toString()+'-"] #toc-progress-'+main_sections_index.toString()+' a{font-weight: bold; color: ' + current_color + '}\n';
                    style_node.textContent=style_node.textContent+viewport+':not([class*="toc-progress-'+main_sections_index.toString()+'-"]):not([class*="toc-progress-'+main_sections_index.toString()+' "]):not([class$="toc-progress-'+main_sections_index.toString()+'"]) li[id^="toc-progress-'+main_sections_index.toString()+'-"] {display: none;}\n';
                    main_title_set = true;
                } else if (title_element==null) {
                    var untitled_section_previous=main_section;
                    do {
                        if (untitled_section_previous.previousSibling==null) {
                            untitled_section_previous=untitled_section_previous.parentNode;
                        } else {
                            untitled_section_previous=untitled_section_previous.previousSibling;
                        };
                    } while (untitled_section_previous!=null && (untitled_section_previous.nodeType!=Node.ELEMENT_NODE || !untitled_section_previous.hasAttribute('data-state')));
                    if (untitled_section_previous!=null) {
                        main_section.setAttribute('data-state',untitled_section_previous.getAttribute('data-state'));
                    };
                };
            };

            // Secondary title
            if (secondary_sections.length>0) {
                for (var secondary_sections_index=0;secondary_sections_index<secondary_sections.length;secondary_sections_index++) {
                    var secondary_section=secondary_sections[secondary_sections_index];
                    var title_element=getElementsByTagNames('h1,h2,h3',secondary_section)[0];
                    // begin debug
                    //console.log("Secondary title_element: ");
                    //console.log("tagName: " + title_element.tagName);
                    // end debug
                    if (secondary_section.hasAttribute('class') && secondary_section.getAttribute('class').indexOf('no-toc-progress')!=-1) {
                        title_element = null;
                    }
                    if (title_element!=null && (!title_element.hasAttribute('class') || title_element.getAttribute('class').indexOf('no-toc-progress')==-1)) {
                        if (secondary_sections_index==0 && !main_title_set) {
                            if (secondary_section.hasAttribute('data-state')) {
                                secondary_section.setAttribute('data-state',secondary_section.getAttribute('data-state')+' toc-progress-'+main_sections_index.toString());
                            } else {
                                secondary_section.setAttribute('data-state','toc-progress-'+main_sections_index.toString());
                            };
                            var li_element=document.createElement('li');
                            li_element.setAttribute('id','toc-progress-'+main_sections_index.toString());
                            toc_progress_footer_main_inside_ul.appendChild(li_element);
                            var a_element=document.createElement('a');
                            a_element.setAttribute('href','#/'+main_sections_index.toString());
                            a_element.appendChild(document.createTextNode(title_element.textContent));
                            li_element.appendChild(a_element);
                            style_node.textContent=style_node.textContent+'.toc-progress-'+main_sections_index.toString()+' #toc-progress-'+main_sections_index.toString()+' a{font-weight: bold; color: ' + current_color + '}\n';
                            style_node.textContent=style_node.textContent+viewport+'[class*="toc-progress-'+main_sections_index.toString()+'-"] #toc-progress-'+main_sections_index.toString()+' a{font-weight: bold; color: ' + current_color + '}\n';
                            style_node.textContent=style_node.textContent+viewport+':not([class*="toc-progress-'+main_sections_index.toString()+'-"]):not([class*="toc-progress-'+main_sections_index.toString()+' "]):not([class$="toc-progress-'+main_sections_index.toString()+'"]) li[id^="toc-progress-'+main_sections_index.toString()+'-"] {display: none;}\n';
                        } else {
                            if (secondary_section.hasAttribute('data-state')) {
                                secondary_section.setAttribute('data-state',secondary_section.getAttribute('data-state')+' toc-progress-'+main_sections_index.toString()+'-'+secondary_sections_index.toString());
                            } else {
                                secondary_section.setAttribute('data-state','toc-progress-'+main_sections_index.toString()+'-'+secondary_sections_index.toString());
                            };


                            if (title_element.tagName == "H2" && !hide_h2_title) {
                                var li_element=document.createElement('li');
                                li_element.setAttribute('id','toc-progress-'+main_sections_index.toString()+'-'+secondary_sections_index.toString());
                                toc_progress_footer_secondary_inside_ul_ul.appendChild(li_element);
                                var a_element=document.createElement('a');
                                a_element.setAttribute('href','#/'+main_sections_index.toString()+'/'+secondary_sections_index.toString());
                                a_element.appendChild(document.createTextNode(title_element.textContent));
                                li_element.appendChild(a_element);
                                style_node.textContent=style_node.textContent+'.toc-progress-'+main_sections_index.toString()+'-'+secondary_sections_index.toString()+' #toc-progress-'+main_sections_index.toString()+'-'+secondary_sections_index.toString()+' a{font-weight: bold; color: ' + current_color + '}\n';
                            } else if (title_element.tagName == "H3") {
                                var li_element=document.createElement('li');
                                li_element.setAttribute('id','toc-progress-'+main_sections_index.toString()+'-'+secondary_sections_index.toString());
                                toc_progress_footer_secondary_inside_ul_ul.appendChild(li_element);
                                var a_element=document.createElement('a');
                                a_element.setAttribute('href','#/'+main_sections_index.toString()+'/'+secondary_sections_index.toString());
                                a_element.appendChild(document.createTextNode(title_element.textContent));
                                li_element.appendChild(a_element);
                                style_node.textContent=style_node.textContent+'.toc-progress-'+main_sections_index.toString()+'-'+secondary_sections_index.toString()+' #toc-progress-'+main_sections_index.toString()+'-'+secondary_sections_index.toString()+' a{font-weight: bold; color: ' + current_color + '}\n';
                            } 
                        };
                    } else if (title_element==null) {
                        var untitled_section_previous=secondary_section;
                        do {
                            if (untitled_section_previous.previousSibling==null) {
                                untitled_section_previous=untitled_section_previous.parentNode;
                            } else {
                                untitled_section_previous=untitled_section_previous.previousSibling;
                            };
                        } while (untitled_section_previous!=null && (untitled_section_previous.nodeType!=Node.ELEMENT_NODE || !untitled_section_previous.hasAttribute('data-state')));
                        if (untitled_section_previous!=null) {
                            secondary_section.setAttribute('data-state',untitled_section_previous.getAttribute('data-state'));
                        };
                    };
                };
            };
        };

        // Reduce or scroll the elements in the TOC-Progress footer if necessary
        reduceOrScrollIfNecessary(reduce_or_scroll);

        // Global variable to indicate that TOC-Progress footer is displayed
        toc_progress_on=true;
    }

    /*
     * Method to destroy the TOC-Progress footer
     */
    function destroy() {
        console.log("destroy");

        var toc_progress_footer=document.getElementById('toc-progress-footer');
        toc_progress_footer.parentNode.removeChild(toc_progress_footer);
        var toc_progress_style=document.getElementById('toc-progress-style');
        toc_progress_style.parentNode.removeChild(toc_progress_style);
        var title_element_sections=document.querySelectorAll('section[data-state*="toc-progress-"]');
        for (var title_element_sections_index=0;title_element_sections_index<title_element_sections.length;title_element_sections_index++) {
            var title_element_section=title_element_sections[title_element_sections_index];
            title_element_section.setAttribute('data-state',title_element_section.getAttribute('data-state').replace(/ toc-progress-\d+-\d+/g,''));
            title_element_section.setAttribute('data-state',title_element_section.getAttribute('data-state').replace(/toc-progress-\d+-\d+/g,''));
            title_element_section.setAttribute('data-state',title_element_section.getAttribute('data-state').replace(/ toc-progress-\d+/g,''));
            title_element_section.setAttribute('data-state',title_element_section.getAttribute('data-state').replace(/toc-progress-\d+/g,''));
            if (title_element_section.getAttribute('data-state')=='') {
                title_element_section.removeAttribute('data-state')
            };
        };

        // Global variable to indicate that TOC-Progress footer is not displayed
        toc_progress_on=false;
    };

    /*
     * Method to toggle the TOC-Progress footer
     */
    function toggle() {
        if (toc_progress_on==false) {
            create();
        } else {
            destroy();
        };
    };

    /**
     * Reduce or scroll the elements in the TOC-Progress footer if necessary
     */
    function reduceOrScrollIfNecessary() {
        if (toc_progress_on == true) {
            reduceOrScrollElementIfNecessary(document.getElementById('toc-progress-footer-main'));
            reduceOrScrollElementIfNecessary(document.getElementById('toc-progress-footer-secondary'));
        };
    };

    /* 
     * Reduce or scroll the elements in the TOC-Progress footer if necessary
     */
    function reduceOrScrollElementIfNecessary(element) {
        var visible_li_elements=0;
        var li_element_font_size=1000000;
        var li_elements=element.getElementsByTagName('li');
        for (var li_elements_index=0;li_elements_index<li_elements.length;li_elements_index++) {
            var li_element=li_elements[li_elements_index];
            li_element.removeAttribute('style');
            if (parseFloat(window.getComputedStyle(li_element).getPropertyValue('font-size').replace('px',''))<li_element_font_size) {
                li_element_font_size=parseFloat(window.getComputedStyle(li_element).getPropertyValue('font-size').replace('px',''));
            };
            if (window.getComputedStyle(li_element).getPropertyValue('display')!='none') {
                visible_li_elements=visible_li_elements+1;
            };
        };
        if (reduce_or_scroll=='reduce') {
            if (visible_li_elements*li_element_font_size>element.clientHeight) {
                var new_li_element_font_size=Math.floor(element.clientHeight/visible_li_elements);
                for (var li_elements_index=0;li_elements_index<li_elements.length;li_elements_index++) {
                    var li_element=li_elements[li_elements_index];
                    li_element.setAttribute('style','font-size:'+new_li_element_font_size.toString()+'px');
                };
            };
        } else if (reduce_or_scroll=='scroll') {
            var selected_element_index=-1;
            var visible_element_index=-1;
            for (var li_elements_index=0;li_elements_index<li_elements.length;li_elements_index++) {
                var li_element=li_elements[li_elements_index];
                if (window.getComputedStyle(li_element).getPropertyValue('display')!='none') {
                    visible_element_index=visible_element_index+1;
                };
                if (window.getComputedStyle(li_element).getPropertyValue('font-weight')=='700') {
                    selected_element_index=visible_element_index;
                };
            };
            if (selected_element_index!=-1) {
                if (selected_element_index*li_element_font_size>element.parentNode.clientHeight/2) {
                    element.scrollTop=Math.floor((selected_element_index*li_element_font_size)-(element.parentNode.clientHeight/2)).toString();
                } else {
                    element.scrollTop=0;
                };
            } else {
                element.scrollTop=0;
            };
        };
    };

}

// vim: set sw=4 ts=4 et:
