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
  JR._console = ('console' in window && 'log' in console && 'warn' in console && 'info' in console);

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
      var allowed = ['Components','XPCNativeWrapper','XPCSafeJSObjectWrapper','getInterface','netscape','GetWeakReference'],
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
  };

  JR.performanceTips = function(){
    var domsize = document.body.innerHTML.length;

    function level(value,mid,high){
      return value<mid?'low':value<high?'mid':'high';
    }
    function parentNodes(node){
      var counter = 0;
      if(node.parentNode)
        while(node = node.parentNode){ counter++ };
      return counter;
    }
    var nodes = $tagname('*'), nodeStats = [], i = nodes.length, average = 0, very = false;
    while(i--) {
      average += parentNodes(nodes[i]);
      if(parentNodes(nodes[i])>15){
        very = true;
        nodes[i].style.cssText += ';border:1px dashed #f00';
      }
    }
    average = average/nodes.length;

    JR.stats(nodes.length, 'elements', level(nodes.length,750,1500));

    JR.nodesTips();
    JR.stats(average.toFixed(1), 'average nesting depth', level(average,8,15));
    JR.stats((domsize/1024).toFixed(1)+'k', 'serialized DOM size', level(domsize,100*1024,250*1024));

    if(domsize>(100*1024) && domsize<(250*1024))
      JR.tip('Your serialized DOM size is a little high.','Performance might improve if you reduce the amount of HTML.');
    if(domsize>=(250*1024))
      JR.warn('DOM size is higher than 250k.','Performance might improve if you reduce the amount of HTML.');

    var bodycount = JR.benchmark(function(){
      document.body.appendChild(document.createTextNode(' '));
      var x = document.body.innerHTML;
    }, 10);
    JR.stats(bodycount.toFixed(3)+'s', 'serialization time', level(bodycount,0.05,0.1));
    if(bodycount>0.1)
      JR.warn('Average DOM serialization speed is '+bodycount.toFixed(3)+'s.','Try to reduce the complexity of the DOM structure.');

    if(nodes.length>1500)
      JR.warn('Element count seems excessively high.','Performance might improve if you reduce the number of nodes.');
    if(average>8 && average<=15)
      JR.tip('Nesting depth is a little high.','Reducing it might increase performance.');
    if(very)
      JR.warn('Nesting depth is very high.','Some of the nodes are nested more than 15 levels deep (these are marked with a dashed red border).');

    JR.cssTips();
    JR.doctypeTips();
    JR.frameworkTips();
    JR.webfontTips();
    JR.scriptTagsTips();
    JR.iFrameTips();
    JR.opacityTips();
    JR.flashTips();
    JR.globals();

    if(JR._lines.tip.length == 0 && JR._lines.warn.length == 0)
      JR.tip('No tips! Congratulations! It seems your site is up to speed!');
  };

  var IE = !!(window.attachEvent && navigator.userAgent.indexOf('Opera') === -1);
  if(IE) JR.getStyle = function(element, style) {
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style;
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];
    if (style == 'opacity') {
      if (value = (element.style.filter || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }
    return value;
  };

  var old = $('jr_results_tips');
  if(old) old.parentNode.removeChild(old);
  setTimeout(function(){
    var error;

    if(JR._console)
      JR.info('Check the JavaScript console of your browser for detailed information on some of the tips.');
    try {
      if("undefined" === typeof(JDROPVIEW)) JR.performanceTips();
    } catch(e) {
      error = e;
    }
    if(error){
      JR.info('Error while analyzing page. '+
        dmlink('Please let the DOM Monster know about this problem', 'https://github.com/madrobby/dom-monster/issues') + '!',
        '(Please include the information below)');

      JR.trace(
        [
          'Location: '+location.href,
          'User agent: '+navigator.userAgent
        ].concat(printStackTrace({e:error})));
    }
    var body = $tagname('body')[0], node = document.createElement('div');
    node.id = 'jr_results';
    body.appendChild(node);

    JR.statsHTML +=
      '<a href="http://twitter.com/dom_monster" target="_new" style="'+JR.reset+';display:block;margin-top:20px;margin-right:10px;line-height:1.3;padding:6px 6px 6px 48px;background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAF7ElEQVR42q2WaUxUVxTHX2tSK5uyaQS0WIEZARGZDWZAoIhSQQRZBkYZ0FFBXLCmiGyxllhFwKgoAkWpWgVbUQHRurbVtvGDqYnUrRXbNF1iNdbUxqQm9PR%2Fn2%2FizZPCiHz4Zd65b949%2F3uWe69wNCf0RVCDfLADXAA94D54AO6BG%2BAgyAaOtsxpq2M9OAN6AdnIt8BnKASkgieABkE3cHwZAW7gD0CMYwvCxF%2BZLUf%2BvuJlBFgAMdqyddQ4W0H18b7UkODHgM1%2Bn6c%2BwZfq3vah5rkBTMRtfD9isAKaACaBALOWtk33psoID6qK9KIaUD3NkzbDZlRHegIvPHtSTZQX1c6YQPvSgqxR0A9WwAFAVhFHEIVd8UrKVThQrp89VRg86aAxmA6kTaEilTst9rWj5QEjqSVTxRzzKZo3WAGNspxCRCitM3hRIRw2p06hzkXhdHyRgWpnKejdEHfaMsOHOhbq5fWQ88ICsGJGAZsMPBMBmN2%2BMIxhHRefuf%2FKyR5QAHIMdOIzQi0chv3JfI12W9xEqotXyCdEJLR0OEtNR8xaydaJNsb7EhDXn4BXENrqr96ZeeVsfvRO2A7MeXNKoNA4Z5JbsdrlQbnOnTAm5VRHbVkaOrn0Lbq83kxXK%2FOoe%2FNS6q5cCjubjudGsYLlnf8LlMC6OJdjOWFb8LwCjGArX31%2BeQzd2ZBJt9anIZ%2FhteyPh%2BaphAMZU199Tz%2FmVkOikjotBuZcnPRSuYnu7Cqiq5ty6fzq2XRqWSydWxVP31Xl0%2B0dhRAXw0fiF2AnRhmRPZMfvbW7fC51LQ4n2OVssOlUXiTdhPNr61JQVIaeIzmhr2FcTEVNrHdnmdaN9qcH01FMerEoRXTyZWESQq6hNoZZTIfosBsR%2BboknY1bBXQBAYhpvVQ460oPFntiSQQh5c3sRRAq%2B6%2BuxRFiNcPp4%2FYFYeM%2BNgYLVTHjhYrwsc0b0deoh6cFiKrvsIRbHfCwb%2FvaITdy4R9xcsm0388ti8Z%2FxXdbrMUQi5d3uQnUrUhBY5K%2FUBHhsbcyepxU8ZIT0GnRU6dY9egGySEiwcIqF2bkis4J39%2FjamQeX5EK8ANftXAqfDjH%2F%2BJ2bKt8G36apaWdcwLpkBm2JYK6ciPp85WxdLkoQQytdSHgEfDgfEzmhJ0GdvK2iAMEyiXbASJ%2Ba%2Bd6m%2FV5EzagdD9Hmj9pJM33H0Um5UhaMnU07c7Q0NWyJDr2zMk3svlL5a3ZV29eBzfBMBABiMFvyeex2hWasZShcIJjd%2FpgpoIylU6UMtGeWs1hdJJF4en%2FC7h5DeAxIFDX305oBAR%2BAr%2FKi4y143V0S4HOg1LhcFOckq6UJFEWImFEVMoiJ9AJtJj0TQB3p3gojX0Ghg%2B0FaeAHwHxsAI7mx9Fl4sTKTvAmdJ87OmoZRp9sSqOMuDcCDbE%2BlIXukn65pIUUQK9YBN43dbDyBlck4voQASq4v3JhPBngtYcPW1NDKR0XwexFlCY1q74G7SBWpAH%2FAZzGu7jnbPW2z7bn5LftGPOrasWc29GRPZkqOl0XqS1C9YMxaW0iRfAVrY%2FI4Tqk4Nob6aG9hhVVJc8hepTguk4WvHCyul8C8YOhYAWQHIRiISYZ1S7RDhrT34T6gWThkJADaBBcA4ItiBg0%2BgPF9COjYidE1jl87diIHd%2BH6hsFoCc9QuOYNwNJus3RHk%2F%2FCgt%2BAZCzTrjAXbIR9hs%2Fjls1vUiLU%2BkbbcN%2BAPBVthp1y%2FvG8YKJWpXc0GQE5WFjjaxIxXRcGs1qezL9R4NazSjf95vDPbDBjWGXW6A8CIIa9UuA7G6ROPaW6p1pbUq54TK6PFCfaJSwC3JEXYPuFuqcXt9d3KAgFSJICJ90bcATN4fZkASj8F4JqooxFkoVru2SeP3cG0btVblIlRP9xbYPaIlM0Q4KKPFpBJP1w6LnmdAAWs4AQ3ceCA3fh0MA0KRShQmlGrd%2BqQq5g2hLkEh7Iz3szKggOFSFEzsmRv3AN%2BDP0Gq%2FLvi%2FwHpEqPH8x%2FFZLYKQrropQAAAABJRU5ErkJggg==) no-repeat 5px 5px #ddf8ff;border:2px solid #00ceff;border-radius:4px;color:#42c2e0;text-decoration:none">For daily tips, follow @dom_monster on Twitter!</a>';

    node.style.cssText =
      JR.reset+'text-align:left;z-index:1000000;letter-spacing:0;position:fixed;bottom:0;'+
      'color:#444;font:12px/13px \'Helvetica Neue\', Verdana, Arial, sans serif;'+
      'width:80%;left:10%';
    node.innerHTML =
      '<div id="jr_results_tips" style="'+JR.reset+'max-height:400px;margin:10px;padding:5px;overflow:auto;background:#fff;border:2px solid #b42328;-moz-border-radius:9px;-webkit-border-radius:9px;-webkit-box-shadow: 0px 2px 40px rgba(0,0,0,0.5);-webkit-transition:-webkit-transform ease-out 0.3s;-webkit-transform:translateY(450px)">' +
        '<div style="'+JR.reset+'height:23px;font-size:16px;font-weight:normal;margin-top:0px;margin-bottom:5px;color:#444">'+
          '<div style="'+JR.reset+'float:left;padding:5px 0px 3px 5px" id="jr_results_prognosis_container">'+
            '<span id="jr_results_prognosis" style="'+JR.reset+'"></span> '+
            '<span style="'+JR.reset+'font-size:12px;font-weight:normal" id="jr_results_warnings_container"><span id="jr_results_warnings" style="'+JR.reset+'"></span></span>'+
          '</div>'+
          '<div style="'+JR.reset+'cursor:pointer;float:right;padding:5px 10px 3px 10px;height:15px;background:#b42328;-webkit-border-radius:5px;color:#fff;text-shadow:0px 1px 3px rgba(0,0,0,0.5)" onclick="location.href=\'http://mir.aculo.us/dom-monster/\'">'+
            'dom monster <span style="'+JR.reset+'font-size:10px">v'+JR.Version+'</span>'+
          '</div>'+
          '<div style="'+JR.reset+'float:right;padding:7px 10px 0px 10px;">'+
          '<span style="'+JR.reset+'color:#888;font-size:10px;text-decoration:underline;cursor:pointer" onclick="document.getElementById(\'jr_results_tips\').saveResults()">'+
            'save to Jdrop'+
          '</span>'+
          '<span style="'+JR.reset+'padding-left:10px;color:#888;font-size:10px;text-decoration:underline;cursor:pointer" onclick="var r=document.getElementById(\'jr_results_tips\');r.parentNode.removeChild(r);">'+
            'close'+
          '</span>'+
          '</div>'+
        '</div>'+
        '<div style="'+JR.reset+'float:left;width:220px;padding:4px;margin-top:2px" id="jr_stats">'+
        '</div>'+
      '</div>';
    JR.flush();
    setTimeout(function(){
      $('jr_results_tips').style.cssText += ';-webkit-transform:translateY(0px)';
    }, 10);

    $('jr_results_tips').saveResults = JR.saveResults;
  },10);
 })();

 function printStackTrace(options) {
     var ex = (options && options.e) ? options.e : null;
     var guess = options ? !!options.guess : true;

     var p = new printStackTrace.implementation();
     var result = p.run(ex);
     return (guess) ? p.guessFunctions(result) : result;
 }

 printStackTrace.implementation = function() {};

 printStackTrace.implementation.prototype = {
     run: function(ex) {
         ex = ex ||
             (function() {
                 try {
                     var _err = __undef__ << 1;
                 } catch (e) {
                     return e;
                 }
             })();
         // Use either the stored mode, or resolve it
         var mode = this._mode || this.mode(ex);
         if (mode === 'other') {
             return this.other(arguments.callee);
         } else {
             return this[mode](ex);
         }
     },

     /**
      * @return {String} mode of operation for the environment in question.
      */
     mode: function(e) {
         if (e['arguments']) {
             return (this._mode = 'chrome');
         } else if (window.opera && e.stacktrace) {
             return (this._mode = 'opera10');
         } else if (e.stack) {
             return (this._mode = 'firefox');
         } else if (window.opera && !('stacktrace' in e)) { //Opera 9-
             return (this._mode = 'opera');
         }
         return (this._mode = 'other');
     },

     /**
      * Given a context, function name, and callback function, overwrite it so that it calls
      * printStackTrace() first with a callback and then runs the rest of the body.
      *
      * @param {Object} context of execution (e.g. window)
      * @param {String} functionName to instrument
      * @param {Function} function to call with a stack trace on invocation
      */
     instrumentFunction: function(context, functionName, callback) {
         context = context || window;
         context['_old' + functionName] = context[functionName];
         context[functionName] = function() {
             callback.call(this, printStackTrace());
             return context['_old' + functionName].apply(this, arguments);
         };
         context[functionName]._instrumented = true;
     },

     /**
      * Given a context and function name of a function that has been
      * instrumented, revert the function to it's original (non-instrumented)
      * state.
      *
      * @param {Object} context of execution (e.g. window)
      * @param {String} functionName to de-instrument
      */
     deinstrumentFunction: function(context, functionName) {
         if (context[functionName].constructor === Function &&
                 context[functionName]._instrumented &&
                 context['_old' + functionName].constructor === Function) {
             context[functionName] = context['_old' + functionName];
         }
     },

     /**
      * Given an Error object, return a formatted Array based on Chrome's stack string.
      *
      * @param e - Error object to inspect
      * @return Array<String> of function calls, files and line numbers
      */
     chrome: function(e) {
         return e.stack.replace(/^[^\(]+?[\n$]/gm, '').replace(/^\s+at\s+/gm, '').replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@').split('\n');
     },

     /**
      * Given an Error object, return a formatted Array based on Firefox's stack string.
      *
      * @param e - Error object to inspect
      * @return Array<String> of function calls, files and line numbers
      */
     firefox: function(e) {
         return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
     },

     /**
      * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
      *
      * @param e - Error object to inspect
      * @return Array<String> of function calls, files and line numbers
      */
     opera10: function(e) {
         var stack = e.stacktrace;
         var lines = stack.split('\n'), ANON = '{anonymous}',
             lineRE = /.*line (\d+), column (\d+) in ((<anonymous function\:?\s*(\S+))|([^\(]+)\([^\)]*\))(?: in )?(.*)\s*$/i, i, j, len;
         for (i = 2, j = 0, len = lines.length; i < len - 2; i++) {
             if (lineRE.test(lines[i])) {
                 var location = RegExp.$6 + ':' + RegExp.$1 + ':' + RegExp.$2;
                 var fnName = RegExp.$3;
                 fnName = fnName.replace(/<anonymous function\:?\s?(\S+)?>/g, ANON);
                 lines[j++] = fnName + '@' + location;
             }
         }

         lines.splice(j, lines.length - j);
         return lines;
     },

     // Opera 7.x-9.x only!
     opera: function(e) {
         var lines = e.message.split('\n'), ANON = '{anonymous}',
             lineRE = /Line\s+(\d+).*script\s+(http\S+)(?:.*in\s+function\s+(\S+))?/i,
             i, j, len;

         for (i = 4, j = 0, len = lines.length; i < len; i += 2) {
             //TODO: RegExp.exec() would probably be cleaner here
             if (lineRE.test(lines[i])) {
                 lines[j++] = (RegExp.$3 ? RegExp.$3 + '()@' + RegExp.$2 + RegExp.$1 : ANON + '()@' + RegExp.$2 + ':' + RegExp.$1) + ' -- ' + lines[i + 1].replace(/^\s+/, '');
             }
         }

         lines.splice(j, lines.length - j);
         return lines;
     },

     // Safari, IE, and others
     other: function(curr) {
         var ANON = '{anonymous}', fnRE = /function\s*([\w\-$]+)?\s*\(/i,
             stack = [], fn, args, maxStackSize = 10;

         while (curr && stack.length < maxStackSize) {
             fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
             args = Array.prototype.slice.call(curr['arguments']);
             stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
             curr = curr.caller;
         }
         return stack;
     },

     /**
      * Given arguments array as a String, subsituting type names for non-string types.
      *
      * @param {Arguments} object
      * @return {Array} of Strings with stringified arguments
      */
     stringifyArguments: function(args) {
         for (var i = 0; i < args.length; ++i) {
             var arg = args[i];
             if (arg === undefined) {
                 args[i] = 'undefined';
             } else if (arg === null) {
                 args[i] = 'null';
             } else if (arg.constructor) {
                 if (arg.constructor === Array) {
                     if (arg.length < 3) {
                         args[i] = '[' + this.stringifyArguments(arg) + ']';
                     } else {
                         args[i] = '[' + this.stringifyArguments(Array.prototype.slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(Array.prototype.slice.call(arg, -1)) + ']';
                     }
                 } else if (arg.constructor === Object) {
                     args[i] = '#object';
                 } else if (arg.constructor === Function) {
                     args[i] = '#function';
                 } else if (arg.constructor === String) {
                     args[i] = '"' + arg + '"';
                 }
             }
         }
         return args.join(',');
     },

     sourceCache: {},

     /**
      * @return the text from a given URL.
      */
     ajax: function(url) {
         var req = this.createXMLHTTPObject();
         if (!req) {
             return;
         }
         req.open('GET', url, false);
         req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
         req.send('');
         return req.responseText;
     },

     /**
      * Try XHR methods in order and store XHR factory.
      *
      * @return <Function> XHR function or equivalent
      */
     createXMLHTTPObject: function() {
         var xmlhttp, XMLHttpFactories = [
             function() {
                 return new XMLHttpRequest();
             }, function() {
                 return new ActiveXObject('Msxml2.XMLHTTP');
             }, function() {
                 return new ActiveXObject('Msxml3.XMLHTTP');
             }, function() {
                 return new ActiveXObject('Microsoft.XMLHTTP');
             }
         ];
         for (var i = 0; i < XMLHttpFactories.length; i++) {
             try {
                 xmlhttp = XMLHttpFactories[i]();
                 // Use memoization to cache the factory
                 this.createXMLHTTPObject = XMLHttpFactories[i];
                 return xmlhttp;
             } catch (e) {}
         }
     },

     /**
      * Given a URL, check if it is in the same domain (so we can get the source
      * via Ajax).
      *
      * @param url <String> source url
      * @return False if we need a cross-domain request
      */
     isSameDomain: function(url) {
         return url.indexOf(location.hostname) !== -1;
     },

     /**
      * Get source code from given URL if in the same domain.
      *
      * @param url <String> JS source URL
      * @return <Array> Array of source code lines
      */
     getSource: function(url) {
         if (!(url in this.sourceCache)) {
             this.sourceCache[url] = this.ajax(url).split('\n');
         }
         return this.sourceCache[url];
     },

     guessFunctions: function(stack) {
         for (var i = 0; i < stack.length; ++i) {
             var reStack = /\{anonymous\}\(.*\)@(\w+:\/\/([\-\w\.]+)+(:\d+)?[^:]+):(\d+):?(\d+)?/;
             var frame = stack[i], m = reStack.exec(frame);
             if (m) {
                 var file = m[1], lineno = m[4]; //m[7] is character position in Chrome
                 if (file && this.isSameDomain(file) && lineno) {
                     var functionName = this.guessFunctionName(file, lineno);
                     stack[i] = frame.replace('{anonymous}', functionName);
                 }
             }
         }
         return stack;
     },

     guessFunctionName: function(url, lineNo) {
         try {
             return this.guessFunctionNameFromLines(lineNo, this.getSource(url));
         } catch (e) {
             return 'getSource failed with url: ' + url + ', exception: ' + e.toString();
         }
     },

     guessFunctionNameFromLines: function(lineNo, source) {
         var reFunctionArgNames = /function ([^(]*)\(([^)]*)\)/;
         var reGuessFunction = /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*(function|eval|new Function)/;
         // Walk backwards from the first line in the function until we find the line which
         // matches the pattern above, which is the function definition
         var line = "", maxLines = 10;
         for (var i = 0; i < maxLines; ++i) {
             line = source[lineNo - i] + line;
             if (line !== undefined) {
                 var m = reGuessFunction.exec(line);
                 if (m && m[1]) {
                     return m[1];
                 } else {
                     m = reFunctionArgNames.exec(line);
                     if (m && m[1]) {
                         return m[1];
                     }
                 }
             }
         }
         return '(?)';
     }
 };

 /*
     http://www.JSON.org/json2.js
     2010-11-17
     Public Domain.
     NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
     See http://www.JSON.org/js.html
 */
 if(!this.JSON){this.JSON={}}(function(){function f(n){return n<10?"0"+n:n}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(key){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;function quote(string){escapable.lastIndex=0;return escapable.test(string)?'"'+string.replace(escapable,function(a){var c=meta[a];return typeof c==="string"?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+string+'"'}function str(key,holder){var i,k,v,length,mind=gap,partial,value=holder[key];if(value&&typeof value==="object"&&typeof value.toJSON==="function"){value=value.toJSON(key)}if(typeof rep==="function"){value=rep.call(holder,key,value)}switch(typeof value){case"string":return quote(value);case"number":return isFinite(value)?String(value):"null";case"boolean":case"null":return String(value);case"object":if(!value){return"null"}gap+=indent;partial=[];if(Object.prototype.toString.apply(value)==="[object Array]"){length=value.length;for(i=0;i<length;i+=1){partial[i]=str(i,value)||"null"}v=partial.length===0?"[]":gap?"[\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"]":"["+partial.join(",")+"]";gap=mind;return v}if(rep&&typeof rep==="object"){length=rep.length;for(i=0;i<length;i+=1){k=rep[i];if(typeof k==="string"){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}else{for(k in value){if(Object.hasOwnProperty.call(value,k)){v=str(k,value);if(v){partial.push(quote(k)+(gap?": ":":")+v)}}}}v=partial.length===0?"{}":gap?"{\n"+gap+partial.join(",\n"+gap)+"\n"+mind+"}":"{"+partial.join(",")+"}";gap=mind;return v}}if(typeof JSON.stringify!=="function"){JSON.stringify=function(value,replacer,space){var i;gap="";indent="";if(typeof space==="number"){for(i=0;i<space;i+=1){indent+=" "}}else{if(typeof space==="string"){indent=space}}rep=replacer;if(replacer&&typeof replacer!=="function"&&(typeof replacer!=="object"||typeof replacer.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":value})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){var j;function walk(holder,key){var k,v,value=holder[key];if(value&&typeof value==="object"){for(k in value){if(Object.hasOwnProperty.call(value,k)){v=walk(value,k);if(v!==undefined){value[k]=v}else{delete value[k]}}}}return reviver.call(holder,key,value)}text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}}());
