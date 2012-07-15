/*
 * DOM MONSTER
 * Copyright (c) 2009-2011 Amy Hoy & Thomas Fuchs
 * This code is licensed under the terms of the MIT LICENSE
 * http://mir.aculo.us/dom-monster
 *
 * includes JAVASCRIPT STACKTRACE
 * see https://github.com/emwendelin/javascript-stacktrace
 * for license information
 */

(function(){
  var JR = { Version: '1.3.1' };

  // export
  window.JR = JR;

  // IE does not seem to properly define the indexOf for arrays.
  if ("undefined" === typeof(Array.prototype.indexOf)) {
    Array.prototype.indexOf = function (object, index) {
      var length = this.length;

	  index = index || 0;
      if (index < 0) {
        index += length;
      }

	  for (; index < length; ++index) {
        if (this[index] === object) {
          return index;
        }
      }

      return -1;
    };
  }

  function $(id){ return document.getElementById(id); }

  function $tagname(tagname) {
    var nodes = document.getElementsByTagName(tagname),
      retValue = [];

	for (var i = nodes.length - 1; i >= 0; i = i - 1) {
      retValue[i] = nodes[i];
    }

    return retValue;

    // This is yields undefined behavior according to the ECMA spec
	// since this is returns a NodeList which is a host object.
	// This causes a break in IE.
    //return [].slice.call(document.getElementsByTagName(tagname));
  }

  JR._lines = { info:[], tip:[], warn:[] };
  JR._console = false; // ('console' in window && 'log' in console && 'warn' in console && 'info' in console);

  JR.reset = " margin:0;padding:0;border:0;outline:0;font-weight:inherit;font-style:inherit;font-size:100%;font-family:inherit;vertical-align: baseline;color:inherit;line-height:inherit;";

  function html(str){
    return str.replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function dmlink(str, url){
    return '<a style="'+JR.reset+'text-decoration:underline;color:#844" href="'+url+'">'+html(str)+'</a>';
  }

  function unique(arr){
    var hash={}, result=[];
    for (var i=0, l=arr.length; i<l; ++i)
      if(!hash.hasOwnProperty(arr[i])){
        hash[arr[i]]=true;
        result.push(arr[i]);
      }
    return result;
  }

  JR.saveResults = function() {
    var hResults = {
      warn: JR._lines.warn, tip: JR._lines.tip, info: JR._lines.info, statsHTML: JR.statsHTML
    }, summary = "", prognosis = $("jr_results_prognosis");

    if (prognosis) summary = prognosis.innerHTML + ", ";

    summary += document.getElementsByTagName('*').length + ' elements';
    summary = summary.replace("'", "\\'");
    JR.SaveToJdrop("DOM Monster", hResults, JR.Version, summary);
  };

  JR.SaveToJdrop = function(appname, myDataObj, version, summary) {
    // create object of parameters to pass to Jdrop
    var params = { "appname": appname,
      "title": document.title,
      "version": version,
      "summary": summary,
      "json": JSON.stringify(myDataObj) };

    // hidden iframe to use as target of form submit
    var jdropif = document.createElement("iframe");
    jdropif.style.display = "none";
    jdropif.name = "jdropiframe";
    jdropif.id = "jdropiframe";
    document.body.appendChild(jdropif);

    // form for posting data
    var jdropform = document.createElement("form");
    jdropform.method = "post";
    jdropform.action = "http://jdrop.org/save";
    jdropform.target = "jdropiframe";
    jdropform.style.display = "hidden";

    // add each param to the form as an input field
    for (var key in params) {
      var pInput = document.createElement("input");
      pInput.setAttribute("name", key);
      pInput.setAttribute("value", params[key]);
      jdropform.appendChild(pInput);
    }

    // submit the form and cleanup
    document.body.appendChild(jdropform);
    jdropif.onload = function() { document.body.removeChild(jdropform); document.body.removeChild(jdropif); };
    jdropif.onerror = function() { document.body.removeChild(jdropform); document.body.removeChild(jdropif); };
    jdropform.submit();
  };

  JR.JdropCallback = function(jsonobj) {
    if (!document.getElementById("jr_results_prognosis_container")) {
      setTimeout(function() { JR.JdropCallback(jsonobj); }, 500);
      return;
    }
    JR._lines.warn = jsonobj['warn'];
    JR._lines.tip = jsonobj['tip'];
    JR._lines.info = jsonobj['info'];
    JR.statsHTML = jsonobj['statsHTML'];
    JR.flush();
  };

  window.__DOMMonsterJdropCallBack = JR.JdropCallback;

  JR.close = function(){
    var results = $('jr_results_tips');
    results.parentNode.removeChild(results);
  };

  JR.flush = function(string){
    var results = $('jr_results_tips'),
      html = '<div style="'+JR.reset+';margin-left:230px;padding-top:4px">';
    function flushArray(array){
      for(var i=0;i<array.length;i++)
        html += '<div style="'+JR.reset+'margin:0 0 4px 0;padding:4px 0px 0px 0px;font-size:11px">' + array[i] + '</div>';
    }
    var prognosis = $("jr_results_prognosis"),
      container = $("jr_results_prognosis_container"),
      warnings = JR._lines.warn.length;
    if(warnings>0) {
      if(warnings>2) {
        container.style.cssText += ';color:#A02523';
        prognosis.innerHTML = 'whoa, potentially huge issues';
        $('jr_results_warnings').innerHTML = JR._lines.warn.length + ' warnings indicate app ill-health';
      } else {
        container.style.cssText += ';color:#E8871D';
        prognosis.innerHTML = 'room for improvement';
        $('jr_results_warnings').innerHTML = JR._lines.warn.length + ' warning' + (warnings==1?'':'s');
      }
      $('jr_results_warnings_container').style.cssText += ';display:inline';
    } else {
      container.style.cssText += ';color:#40a40F';
      prognosis.innerHTML = 'yay! you\'re doing a great job!';
      $('jr_results_warnings_container').style.cssText += ';display:none';
    }

    flushArray(JR._lines.warn);
    flushArray(JR._lines.tip);
    flushArray(JR._lines.info);
    html += '</div>';
    results.innerHTML += html;

    $('jr_stats').innerHTML = JR.statsHTML;
  };

  JR.log = function(string, hint, type){
    type = type || 'tip';
    hint = hint || '';
    var color = { info: '888', tip:'88f', warn:'efb000' }[type];
    JR._lines[type].push(
      '<div style="'+JR.reset+'text-transform:uppercase;font-size:10px;border:1px solid #'+color+';width:32px;color:#'+color+';-webkit-border-radius:5px;padding:1px;float:left;text-align:center;margin:-2px 4px 0px 0px">'+type+'</div> '+
      '<strong style="'+JR.reset+'font-weight:bold">'+string+'</strong> '+hint);
  };
  JR.tip = function(string, hint){ JR.log(string,hint,'tip'); };
  JR.info = function(string, hint){ JR.log(string,hint,'info'); };
  JR.warn = function(string, hint){ JR.log(string,hint,'warn'); };

  JR.trace = function(msgs){
    var formatted = "";
    for(var i=0;i<msgs.length;i++)
      formatted += html(msgs[i]) + '<br>';

    JR._lines['info'].push(
      '<div style="'+JR.reset+';font-family:monospace;border:1px solid #888;padding:5px">'+formatted+'</div>'
    );
  }

  JR.time = function(scope){
    JR.time.scope = JR.time.scope || {};
    if(JR.time.scope[scope]) {
      var duration = (new Date()).getTime()-JR.time.scope[scope];
      JR.time.scope[scope] = null;
      return duration/1000;
    } else {
      JR.time.scope[scope] = (new Date()).getTime();
      return null;
    }
  };

  JR.benchmark = function(method, times, scope){
    var i = times || 1000;
    JR.time(scope||'benchmark');
    while(i--) method();
    return JR.time(scope||'benchmark')/times;
  };

  JR.scriptTagsTips = function(){
    var nodes = $tagname('script'),
      head = document.head || $tagname('head')[0];

    var count = 0, headcount = 0, i = nodes.length, sources = [], longInlines = [];
    while(i--){
      if(nodes[i].src && nodes[i].src !== ''){
        if(nodes[i].src.indexOf('dommonster.js') === -1 &&
           nodes[i].src.indexOf('google-analytics.com/ga.js') === -1 &&
           nodes[i].src.indexOf('getclicky.com/') === -1){
          if(nodes[i].parentNode === head){
             headcount = headcount + 1;
             sources.push(nodes[i].src);
          }
      if(nodes[i].innerHTML.length >= (1024*2))
            longInlines.push(nodes[i]);

          count = count + 1;
        }
      }else{
        if(nodes[i].parentNode === head){
          headcount = headcount + 1;
        }

    if(nodes[i].innerHTML.length >= (1024*2))
            longInlines.push(nodes[i]);

        count = count + 1;
      }
    }

    if(count>2 && count<6)
      JR.tip('Found '+count+' &lt;script&gt; tags on page.','Try to reduce the number of script tags.');
    if(count.length>=6)
      JR.warn('Found '+count+' &lt;script&gt; tags on page.','Try to reduce the number of script tags.');


  // inline scripts block rendering
    // http://www.stevesouders.com/blog/2009/05/06/positioning-inline-scripts/
    if(longInlines.length>0)
      JR.tip('Found ' + longInlines.length + ' big (>=2kB) inline script'+((longInlines.length>1)?'s':'')+'.', 'Try to avoid big inline scripts, they block rendering and won\'t get cached.');

    JR.noLoaders = function() {
      var loaders = ['head', 'yepnope', '$LAB', 'jsl', 'JSLoader'], r = true;
      for (var i=0;i<loaders.length;i++)
        if (loaders[i] in window) {
          JR.tip("You're using "+loaders[i]+", a JavaScript loader library.",
            "Often you can achieve the best performance and compression by serving a single "+
            "concatenated JavaScript file instead; however, your page might be more responsive with "+
            "a loader library.");
          r = false;
        }
      return r;
    }

    if(headcount>0 && JR.noLoaders())
      JR.tip('<span style="cursor:help" title="'+sources.join('\n')+'">Found '+headcount+' &lt;script&gt; tags in HEAD.</span>','For better perceived loading performance move script tags to end of document; or use a non-blocking JS loader library.');
  };

  function digitCompare(user, edge) {
    return (~~user || 0) >= (edge || 0);
  }

  JR.versionCompare = function(userVersion, edgeVersion) {
    if(userVersion === undefined) return true;

    userVersion = userVersion.split('.');

    var major = digitCompare(userVersion[0], edgeVersion[0]),
        minor = digitCompare(userVersion[1], edgeVersion[1]),
        build = digitCompare(userVersion[2], edgeVersion[2]);

    return (!major || major && !minor || major && minor && !build);
  };

  JR.frameworkTips = function(){
    // Version number on http://prototypejs.org/download
    if('Prototype' in window && JR.versionCompare(Prototype.Version, [1, 7]))
      JR.tip("You are using the Prototype JavaScript framework v"+Prototype.Version+".","There's a newer version available, which potentially includes performance updates.");

    // Version number on http://script.aculo.us/downloads
    if('Scriptaculous' in window && JR.versionCompare(Scriptaculous.Version, [1, 9, 0]))
      JR.tip("You are using script.aculo.us v"+Scriptaculous.Version+".","There's a newer version available, which potentially includes performance updates.");

    // Version number on http://jquery.com/
    if(typeof jQuery == 'function'){
      if(JR.versionCompare(jQuery.prototype.jquery, [1, 5, 2])) {
        JR.tip("You are using the jQuery JavaScript framework v"+jQuery.prototype.jquery+".","There's a newer version available, which potentially includes performance updates.");
      }
      // Version number on http://jqueryui.com/home
      if(jQuery.ui && JR.versionCompare(jQuery.ui.version, [1, 8, 11])) {
        JR.tip("You are using the jQuery UI JavaScript framework v"+jQuery.ui.version+".","There's a newer version available, which potentially includes performance updates.");
      }
    }

    // Version number on http://download.dojotoolkit.org/
    if(typeof dojo == 'object' && JR.versionCompare(dojo.version.toString(), [1, 5, 0]) && !(dojo.version.toString().match(/dev/)))
      JR.tip("You are using the dojo JavaScript toolkit v"+dojo.version.toString()+".","There's a newer version available, which potentially includes performance updates.");

    // Version number on http://developer.yahoo.com/yui/
    if(typeof YAHOO == 'object' && typeof YAHOO.evn == 'object' && JR.versionCompare(YAHOO.env.getVersion('yahoo').version, [2, 8, 2]))
      JR.tip("You are using the Yahoo! User Interface Library 2 v"+YAHOO.env.getVersion('yahoo').version+".","There's a newer version available, which potentially includes performance updates.");

    // Version number on http://developer.yahoo.com/yui/3/
    if('YUI' in window && typeof YUI == 'function' && JR.versionCompare(YUI().version, [3, 3, 0]))
      JR.tip("You are using the Yahoo! User Interface Library 3 v"+YUI().version+".","There's a newer version available, which potentially includes performance updates.");

    // Version number on http://mootools.net/download
    if(typeof MooTools == 'object' && (!MooTools.version || JR.versionCompare(MooTools.version, [1, 3])))
      JR.tip("You are using the MooTools JavaScript tools v"+MooTools.version+".","There's a newer version available, which potentially includes performance updates.");

    // Version number Extjs on http://www.sencha.com/products/js/download.php
    if(typeof Ext === 'object' && JR.versionCompare(Ext.version, [3, 3, 1]))
      JR.tip("You are using the Ext JS v"+Ext.version+".","There's a newer version available, which potentially includes performance updates.");

    // Version number on http://rightjs.org/
    if('RightJS' in window && JR.versionCompare(RightJS.version, [2, 2, 3]))
      JR.tip("You are using the RightJS JavaScript framework v"+RightJS.version+".","There's a newer version available, which potentially includes performance updates.");
  };

  JR.webfontTips = function(){
    var tiptext = "Using external webfont services can increase your page load times, as well as possible downtime if the service goes down.";

    if(typeof Typekit == 'object')
      JR.tip("You are using the Typekit webfont service.", tiptext);

    function isFontService(href){
      return /(webtype|fontdeck|fontslive|fonts|fonts\.googleapis|kernest|typotheque)\.com/.test(href)
    }
    var styles = document.styleSheets, i = styles.length;
    if(i==0) return;
    while(i--) {
      var href = styles[i].href||'', j = 0;
      if(styles[i].rules) j = styles[i].rules.length;
      if(isFontService(href)){
        if(JR._console) console.log(href);
        JR.tip("You are using an external webfont service.", tiptext);
        return "";
      }
      if(j==0) continue;
      while(j--){
        var href = styles[i].rules[j].href||'';
        if(isFontService(href)){
          if(JR._console) console.log(href);
          JR.tip("You are using an external webfont service.", tiptext);
          return "";
        }
      }
    }
  };

  JR.iFrameTips = function(){
    var nodes = $tagname('iframe');
    if(nodes.length>0 && nodes.length<4)
      JR.tip('Reduce the number of &lt;iframe&gt; tags.','There are '+nodes.length+' iframe elements on the page.');
    if(nodes.length>=4)
      JR.warn('Reduce the number of &lt;iframe&gt; tags','There are '+nodes.length+' iframe elements on the page.');
  };

  JR.cssTips = function(){
    function linkTagTips(){
    var nodes = [], links = $tagname('link'), i = links.length;
    if(i==0) return;
    while(i--) if((links[i].rel||'').toLowerCase()=='stylesheet') nodes.push(links[i]);
    if(nodes.length>1 && nodes.length<8)
      JR.tip('Reduce the number of &lt;link rel="stylesheet"&gt; tags.','There are '+nodes.length+' external stylesheets loaded on the page.');
    if(nodes.length>=8)
      JR.warn('Reduce the number of &lt;link rel="stylesheet"&gt; tags','There are '+nodes.length+' external stylesheets loaded on the page.');
    }
    function styleAttributeTips(){
      var nodes = $tagname('*'), i = nodes.length, styleNodes = 0, styleBytes = 0;
      while(i--)
        if(nodes[i].style.cssText.length > 0){
          if(JR._console) console.warn('Inline style', nodes[i]);
          styleNodes++;
          styleBytes += nodes[i].style.cssText.length + 8;
        }
      if(styleNodes>0)
        JR.tip('Reduce the number of tags that use the style attribute, replacing it with external CSS definitions.', styleNodes+' nodes use the style attribute, for a total of '+styleBytes+' bytes.');
    }
    function dontAtImport() {
      var styles = $tagname('style'),
        i = styles.length,
        present = false;
      if (i == 0) return;
      while (i--) if (styles[i].innerHTML.indexOf('@import') != '-1') present = true;
      if (present)
        JR.tip('Using @import in a style element will impact rendering performance.', 'Use the &lt;link&gt; tag instead. See '+dmlink('this article', 'http://www.stevesouders.com/blog/2009/04/09/dont-use-import/')+' for details.');
    }
    function checkForShadows() {
      var stylesheets = [].slice(document.styleSheets), shadowCount = 0;

      for (var i = 0; i < stylesheets.length; i++)
        if (stylesheets[i].cssRules)
          for (var x = 0; x < stylesheets[i].cssRules.length; x++)
            if (stylesheets[i].cssRules[x].cssText.indexOf('box-shadow') != '-1') shadowCount++;

      if (shadowCount > 0)
        JR.tip('Using the box-shadow property can introduce serious scroll & resize lag in the browser.', 'Consider replacing with border-image or reducing the number of elements with shadows (currently: ' + shadowCount + ')');
    }
    linkTagTips();
    styleAttributeTips();
    dontAtImport();
    checkForShadows();
  };

  // via https://gist.github.com/773044
  function getDocType() {
    var node = document.firstChild;
    while (node) {
      var nodeType = node.nodeType;
      if (nodeType === 10) {
        // doctype
        var doctype = '<!DOCTYPE '+(document.documentElement.tagName || 'html').toLowerCase();
        if (node.publicId) {
          doctype += ' PUBLIC "' + node.publicId + '"';
        }
      if (node.systemId) {
        doctype += ' "' + node.systemId + '"';
      }
      return doctype+'>';
      }
      if (nodeType === 8 && (""+node.nodeValue).toLowerCase().indexOf("doctype") === 0) {
        // IE represents DocType as comment
        return '<!' + node.nodeValue + '>';
      }
      node = node.nextSibling;
    }
    return "";
  }

  JR.doctypeTips = function(){
    var dt = getDocType();
    if(dt !== "" && getDocType().toLowerCase() !== '<!doctype html>')
      JR.tip('Switch to HTML5 and use a short doctype declaration.',
        html('Using (<!DOCTYPE html>) saves some bytes and increases parsing speed '+
          '(your current declaration is ' + dt + ').'));
  };

   JR.flashTips = function() {
     var nodes = [],
     obj = $tagname('embed'),
     i = obj.length;

     if (i) {
       while (i--) {
         if ((obj[i].type || '').toLowerCase() == 'application/x-shockwave-flash') nodes.push(obj[i]);
       }
     }

     obj = $tagname('object');
     i = obj.length;
     if (i) {
       while (i--) {
         if ((obj[i].classid || '').toLowerCase() == 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' || (obj[i].type || '').toLowerCase() == 'application/x-shockwave-flash') nodes.push(obj[i]);
       }
     }

     if (nodes.length == 1) {
       JR.tip('Consider alternatives to using Flash.', 'There is 1 Flash object embedded. Replacing this with browser-native implementations (SVG, VML, Canvas) could lead to better loading times, especially if the Flash plugin is loaded first.');
     } else if (nodes.length) {
       JR.tip('Consider alternatives to using Flash.', 'There are ' + nodes.length + ' Flash objects embedded. Replacing these with browser-native implementations (SVG, VML, Canvas) could lead to better loading times, especially if the Flash plugin is loaded first.');
     }
   };

  JR.getStyle = function(element, style) {
    style = style == 'float' ? 'cssFloat' : style;
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  JR.opacityTips = function(){
    var nodes = $tagname('*'), op = [], i = nodes.length;
    while(i--){
      var opacity = JR.getStyle(nodes[i],'opacity') || 1;
      if(opacity<1) {
        nodes[i].style.cssText += ';border:1px dashed #00f';
        op.push(nodes[i]);
        if(JR._console) console.info('Transparent node', nodes[i]);
      }
    }
    if(op.length>0 && op.length < 10)
      JR.tip('Some nodes use transparency.','To improve rendering performance, try not to use the CSS opacity property (found '+op.length+' nodes, marked with a dashed blue border).');
    if(op.length >= 10)
      JR.warn('Lots of nodes use transparency.','To improve rendering performance, try not to use the CSS opacity property (found '+op.length+' nodes, marked with a dashed blue border).');
  };

  JR.nodesTips = function(){
    function level(value,mid,high){
      return value<mid?'low':value<high?'mid':'high';
    }
    function revlevel(value,mid,high){
      return value<mid?'high':value<high?'mid':'low';
    }
    var nodes = $tagname('*'), i = nodes.length, nodecount = 0, ids = {}, multiIds = [], multiIdsElements = [],
      empty = 0, deprecated = 0, whitespace = 0, textnodes = 0, comments = 0, deprecatedTags = {}, emptyAttr = 0,
      js_byte = 0, js = 0, textnodeLength = 0,
      inlinejs = ['mouseover', 'mouseout','mousedown', 'mouseup','click','dblclick','mousemove', 'load','error','beforeunload','focus','blur','touchstart','touchend','touchmove'];

    var DEPRECATED = ("font center strike u dir applet acronym bgsound isindex layer ilayer nolayer listing marquee nobr " +
      "noembed plaintext spacer xml xmp").split(' ');

    var INVALID_FOR_TEXTNODES = ("script style").split(' ');

    while(i--) {
      var tag = nodes[i].tagName.toLowerCase(), attribute, j = inlinejs.length;
      if (nodes[i].childNodes.length==0 && !(tag=='link' || tag=='br' || tag=='script' || tag=='meta' || tag=='img' ||
            tag=='a' || tag=='input' || tag=='hr' || tag=='param' || tag=='iframe' ||
            tag=='area' || tag=='base') && !((nodes[i].id||'') == '_firebugConsole')) {
        if(JR._console) console.warn('Empty node', nodes[i]);
        empty++;
      }

      if(DEPRECATED.indexOf(tag)>-1) {
        if(JR._console) console.warn('Deprecated node', nodes[i]);
        if(!deprecatedTags[tag]) deprecatedTags[tag] = true;
        deprecated++;
      }

      if(nodes[i].id)
        if(ids[nodes[i].id]){
          multiIds.push(nodes[i].id);
          multiIdsElements.push(nodes[i]);
        }
        else ids[nodes[i].id] = true;

      if(tag=='link' && /stylesheet|icon|shortcut|prefetch/.test(nodes[i].rel) && nodes[i].getAttribute('href') === ''){
        if(JR._console) console.warn('Empty href attribute', nodes[i]);
        emptyAttr++;
      }

      if(tag=='html'){
        attribute = nodes[i].attributes.getNamedItem('manifest');
        if(attribute && attribute.value === ''){
          if(JR._console) console.warn('Empty manifest attribute', nodes[i]);
          emptyAttr++;
        }
      }

      if(tag=='video' || tag=='audio' || tag=='iframe' || tag=='input' || tag=='embed' || tag == 'img'){
        attribute = nodes[i].attributes.getNamedItem('src');
        if(attribute && attribute.value === '' ){
          if(JR._console) console.warn('Empty src attribute', nodes[i]);
          emptyAttr++;
        }
      }

      while( j-- ){
        attribute = nodes[i].getAttribute('on'+inlinejs[j]);
        if(attribute){
            if(JR._console) console.warn('Inline JavaScript', nodes[i]);
            js_byte += 5 + attribute.length + inlinejs[j].length;
            js++;
        }
      }

      // additional toLowerCase check prevents SVG problem, #29
      if(nodes[i].href && nodes[i].href.toLowerCase && nodes[i].href.toLowerCase().indexOf( "javascript:" ) == 0 ){
        if(JR._console) console.warn('Inline JavaScript', nodes[i]);
        js++;
        js_byte += nodes[i].href.length;
      }
    }
    function findWhitespaceTextnodes(element){
      // Safety check
      if(element.childNodes && element.childNodes.length>0)
        for(var i=0;i<element.childNodes.length;i++)
          findWhitespaceTextnodes(element.childNodes[i]);
      nodecount++;
      if(element.nodeType==8)
        comments++;
      if(element.nodeType==3 && /^\s+$/.test(element.nodeValue)){
        // if(JR._console) console.warn('Whitespace-only text node', element);
        whitespace++;
      }
      if(element.nodeType==3 && INVALID_FOR_TEXTNODES.indexOf(element.parentNode.tagName.toLowerCase())==-1){
        textnodes++;
        textnodeLength += element.nodeValue.length;
      }
    }
    findWhitespaceTextnodes(document);

    var contentPercent = textnodeLength/document.body.innerHTML.length*100

    JR.stats(nodecount, 'nodes', level(nodecount,1500,3000));
    JR.stats(textnodes, 'text nodes', level(textnodes,750,1500));
    JR.stats((textnodeLength/1024).toFixed(1)+'k', 'text node size', level(textnodeLength,80000,500000));
    JR.stats(contentPercent.toFixed(2)+'%', 'content percentage', revlevel(contentPercent, 25, 50));

    if(empty) JR.tip('There are '+empty+' empty nodes.','Removing them might improve performance.');
    if(deprecated) {
      var tags = [];
      for(tag in deprecatedTags) tags.push(tag.toUpperCase());
      JR.tip('There are '+deprecated+' nodes which use a deprecated tag name ('+tags.join(', ')+').','Try updating this content to HTML5.');
    }
    if(multiIds.length > 0){
      JR.warn('There '+((multiIds.length==1)?'is ':'are ')+multiIds.length+' duplicate id'+((multiIds.length>1)?'s':'')+' for nodes in your document.', 'Node ids must be unique within the HTML document. See JavaScript console for details.');
      if(JR._console) console.warn('Duplicate element ids found', unique(multiIds));
      if(JR._console) console.warn('Nodes affected by duplicate ids', multiIdsElements);
    }
    if(whitespace)
      JR.tip(((whitespace/nodecount)*100).toFixed(1)+'% of nodes are whitespace-only text nodes.','Reducing the amount of whitespace, like line breaks and tab stops, can help improve the loading and DOM API performance of the page.');
    if(comments)
      JR.tip('There are '+comments+' HTML comments.','Removing the comments can help improve the loading and DOM API performance of the page.');
    if(emptyAttr)
      JR.warn('There are '+emptyAttr+' HTML elements with empty source attributes.', 'Removing these nodes or updating the attributes will prevent double-loading of the page in some browsers. See this article for more information: '+dmlink('Empty image src can destroy your site','http://www.nczonline.net/blog/2009/11/30/empty-image-src-can-destroy-your-site/'))
    if(js&&js_byte)
      JR.tip('There are '+js_byte+' bytes of inline JavaScript code in '+js+' HTML nodes.', 'Removing the inline JavaScript, or updating the attributes will improve the loading speed of the page.');
  };

  JR.statsHTML = '';
  JR.stats = function(value, stat, type){
    var color = { low: '80E41F', mid: 'E8871D', high: 'A02523' };
    JR.statsHTML +=
      '<div style="'+JR.reset+'margin:0;margin-left:5px;padding:0;margin-bottom:4px;height:auto"><div style="'+JR.reset+';float:left;width:13px;height:13px;margin-right:2px;background:#'+color[type||'low']+'"> </div>'+
      '<strong>'+value+'</strong> '+stat+
      '</div>'
  };

  JR.globals = function(){
    function ignore(name){
      var allowed = ['Components','XPCNativeWrapper','XPCSafeJSObjectWrapper','getInterface','netscape','GetWeakReference', '_phantom', 'callPhantom', 'JR', '__DOMMonsterJdropCallBack', 'phantomas'],
      i = allowed.length;
      while(i--){
        if(allowed[i] === name)
          return true;
      }
      return false;
    }

    function nametag(attr){
      var ele = nametag.cache = nametag.cache || $tagname('*'), i = ele.length;
      while(i--){
        if(ele[i].name && ele[i].name == attr)
          return true;
      }
      return false;
    }

    var global = (function(){ return this })(), properties = {}, prop, found = [], clean, iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    clean = iframe.contentWindow;

    for(prop in global){
      if(!ignore(prop) && !/^[0-9]/.test(prop) && !(document.getElementById(prop) || {}).nodeName && !nametag(prop)){
        properties[prop] = true;
      }
    }

    for(prop in clean){
      if(properties[prop]){
        delete properties[prop];
      }
    }

    for(prop in properties){
      found.push(prop.split('(')[0]);
    }

    if(found.length > 5){
      JR.tip('Found '+found.length+' JavaScript globals.','Cutting back on globals can increase JavaScript performance.' + (JR._console ? ' See JavaScript console for details.' : ''));
      if(JR._console) console.log('Found more than 5 globals on your page.', found);
    }

    return found;
  };
 })();

