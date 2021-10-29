"use strict";

var loading_timer;
var domain = (/^dev\./.test(document.location.hostname.toString()) ? 'dev' : 'ltn')+'.hitomi.la';
var galleryblockextension = '.html';
var galleryblockdir = 'galleryblock';
var nozomiextension = '.nozomi';

function subdomain_from_galleryid(g, number_of_frontends) {
        var o = g % number_of_frontends;

        return String.fromCharCode(97 + o);
}

function subdomain_from_url(url, base) {
        var retval = 'b';
        if (base) {
                retval = base;
        }
        
        var number_of_frontends = 2;
        var b = 16;
        
        var r = /\/[0-9a-f]\/([0-9a-f]{2})\//;
        var m = r.exec(url);
        if (!m) {
                return 'a';
        }
        
        var g = parseInt(m[1], b);
        if (!isNaN(g)) {
                var o = 0;
                if (g < 0x7b) {
                        o = 1;
                }
                //retval = subdomain_from_galleryid(g, number_of_frontends) + retval;
                retval = String.fromCharCode(97 + o) + retval;
        }
        
        return retval;
}

function url_from_url(url, base) {
        return url.replace(/\/\/..?\.hitomi\.la\//, '//'+subdomain_from_url(url, base)+'.hitomi.la/');
}


function full_path_from_hash(hash) {
        if (hash.length < 3) {
                return hash;
        }
        return hash.replace(/^.*(..)(.)$/, '$2/$1/'+hash);
}


function url_from_hash(galleryid, image, dir, ext) {
        ext = ext || dir || image.name.split('.').pop();
        dir = dir || 'images';
        
        return 'https://a.hitomi.la/'+dir+'/'+full_path_from_hash(image.hash)+'.'+ext;
}

function url_from_url_from_hash(galleryid, image, dir, ext, base) {
        return url_from_url(url_from_hash(galleryid, image, dir, ext), base);
}

function rewrite_tn_paths(html) {
        return html.replace(/\/\/tn\.hitomi\.la\/[^\/]+\/[0-9a-f]\/[0-9a-f]{2}\//g, function(url) {
                return url_from_url(url, 'tn');
        });
}


function show_loading() {
        return vate_loading(true);
}

function hide_loading() {
        stop_loading_timer();
        return vate_loading(false);
}

function vate_loading(bool) {
        var el = $('#loader-content');
        if (!el) return;
        
        if (bool) {
                el.show();
        } else {
                el.hide();
        }
}


function start_loading_timer() {
        hide_loading();
        loading_timer = setTimeout(show_loading, 500);
}

function stop_loading_timer() {
        clearTimeout(loading_timer);
}



function scroll_to_top() {
        document.body.scrollTop = document.documentElement.scrollTop = 0;
}


function localDates() {
        $(".date").each(function() {
                //2007-02-06 20:02:00-06
                //2016-03-27 13:37:33.612-05
                var r = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.\d+)?([+-]\d{2})/;
                var m = r.exec($(this).html());
                if (!m) {
                        return;
                }
                
                //2007-02-06T20:02:00-06:00
                $(this).html(new Date(m[1]+'-'+m[2]+'-'+m[3]+'T'+m[4]+':'+m[5]+':'+m[6]+m[7]+':00').toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })); //Feb 6, 2007, 8:02 PM
        });    
}

//https://stackoverflow.com/a/51332115/272601
function retry(fn, retries, err) {
        retries = typeof retries !== 'undefined' ? retries : 3;
        err = typeof err !== 'undefined' ? err : null;
        
        if (!retries) {
                return Promise.reject(err);
        }
        return fn().catch(function(err) {
                //console.warn(`retry ${3 - retries}, err ${err}`);
                return retry(fn, (retries - 1), err);
        });
}


$(document).ready(function() {
        $("#lang").mouseenter(function() {
                $("#lang-drop").addClass("active");
        });
        $("#lang").mouseleave(function() {
                $("#lang-drop").removeClass("active");
        });
        $("#lang").click(function() {
                $("#lang-drop").toggleClass("active");
        });
        $(".drop-button").click(function() {
                $("nav").toggleClass("active");
        });
        localDates();
});


// var cls = 0;
// const po = new PerformanceObserver((list) => {
// for (const entry of list.getEntries()) {
// cls += entry.value;
// console.log(entry, 'total is now: '+cls);
// }
// });
// po.observe({type: 'layout-shift', buffered: true});
