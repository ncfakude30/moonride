"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[995],{4995:function(e,r,o){o.d(r,{Z:function(){return ee}});var t=o(7294);function n(e){var r=function(e){var r=e.theme,o=e.prefix,t={nextPart:new Map,validators:[]};return c(Object.entries(e.classGroups),o).forEach((function(e){var o=e[0];l(e[1],t,o,r)})),t}(e),o=e.conflictingClassGroups,t=e.conflictingClassGroupModifiers,n=void 0===t?{}:t;return{getClassGroupId:function(e){var o=e.split("-");return""===o[0]&&1!==o.length&&o.shift(),i(o,r)||function(e){if(a.test(e)){var r=a.exec(e)[1],o=r?.substring(0,r.indexOf(":"));if(o)return"arbitrary.."+o}}(e)},getConflictingClassGroupIds:function(e,r){var t=o[e]||[];return r&&n[e]?[].concat(t,n[e]):t}}}function i(e,r){if(0===e.length)return r.classGroupId;var o=e[0],t=r.nextPart.get(o),n=t?i(e.slice(1),t):void 0;if(n)return n;if(0!==r.validators.length){var a=e.join("-");return r.validators.find((function(e){return(0,e.validator)(a)}))?.classGroupId}}var a=/^\[(.+)\]$/;function l(e,r,o,t){e.forEach((function(e){if("string"!==typeof e){if("function"===typeof e)return e.isThemeGetter?void l(e(t),r,o,t):void r.validators.push({validator:e,classGroupId:o});Object.entries(e).forEach((function(e){var n=e[0];l(e[1],s(r,n),o,t)}))}else{(""===e?r:s(r,e)).classGroupId=o}}))}function s(e,r){var o=e;return r.split("-").forEach((function(e){o.nextPart.has(e)||o.nextPart.set(e,{nextPart:new Map,validators:[]}),o=o.nextPart.get(e)})),o}function c(e,r){return r?e.map((function(e){return[e[0],e[1].map((function(e){return"string"===typeof e?r+e:"object"===typeof e?Object.fromEntries(Object.entries(e).map((function(e){var o=e[0],t=e[1];return[r+o,t]}))):e}))]})):e}function d(e){if(e<1)return{get:function(){},set:function(){}};var r=0,o=new Map,t=new Map;function n(n,i){o.set(n,i),++r>e&&(r=0,t=o,o=new Map)}return{get:function(e){var r=o.get(e);return void 0!==r?r:void 0!==(r=t.get(e))?(n(e,r),r):void 0},set:function(e,r){o.has(e)?o.set(e,r):n(e,r)}}}function u(e){var r=e.separator||":",o=1===r.length,t=r[0],n=r.length;return function(e){for(var i,a=[],l=0,s=0,c=0;c<e.length;c++){var d=e[c];if(0===l){if(d===t&&(o||e.slice(c,c+n)===r)){a.push(e.slice(s,c)),s=c+n;continue}if("/"===d){i=c;continue}}"["===d?l++:"]"===d&&l--}var u=0===a.length?e:e.substring(s),p=u.startsWith("!");return{modifiers:a,hasImportantModifier:p,baseClassName:p?u.substring(1):u,maybePostfixModifierPosition:i&&i>s?i-s:void 0}}}function p(e){return{cache:d(e.cacheSize),splitModifiers:u(e),...n(e)}}var b=/\s+/;function f(e,r){var o=r.splitModifiers,t=r.getClassGroupId,n=r.getConflictingClassGroupIds,i=new Set;return e.trim().split(b).map((function(e){var r=o(e),n=r.modifiers,i=r.hasImportantModifier,a=r.baseClassName,l=r.maybePostfixModifierPosition,s=t(l?a.substring(0,l):a),c=Boolean(l);if(!s){if(!l)return{isTailwindClass:!1,originalClassName:e};if(!(s=t(a)))return{isTailwindClass:!1,originalClassName:e};c=!1}var d=function(e){if(e.length<=1)return e;var r=[],o=[];return e.forEach((function(e){"["===e[0]?(r.push.apply(r,o.sort().concat([e])),o=[]):o.push(e)})),r.push.apply(r,o.sort()),r}(n).join(":");return{isTailwindClass:!0,modifierId:i?d+"!":d,classGroupId:s,originalClassName:e,hasPostfixModifier:c}})).reverse().filter((function(e){if(!e.isTailwindClass)return!0;var r=e.modifierId,o=e.classGroupId,t=e.hasPostfixModifier,a=r+o;return!i.has(a)&&(i.add(a),n(o,t).forEach((function(e){return i.add(r+e)})),!0)})).reverse().map((function(e){return e.originalClassName})).join(" ")}function m(){for(var e,r,o=0,t="";o<arguments.length;)(e=arguments[o++])&&(r=g(e))&&(t&&(t+=" "),t+=r);return t}function g(e){if("string"===typeof e)return e;for(var r,o="",t=0;t<e.length;t++)e[t]&&(r=g(e[t]))&&(o&&(o+=" "),o+=r);return o}function h(){for(var e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];var t,n,i,a=l;function l(e){var o=r[0],l=r.slice(1).reduce((function(e,r){return r(e)}),o());return t=p(l),n=t.cache.get,i=t.cache.set,a=s,s(e)}function s(e){var r=n(e);if(r)return r;var o=f(e,t);return i(e,o),o}return function(){return a(m.apply(null,arguments))}}function v(e){var r=function(r){return r[e]||[]};return r.isThemeGetter=!0,r}var y=/^\[(?:([a-z-]+):)?(.+)\]$/i,x=/^\d+\/\d+$/,w=new Set(["px","full","screen"]),k=/^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/,z=/\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/,C=/^-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/;function j(e){return E(e)||w.has(e)||x.test(e)||G(e)}function G(e){return _(e,"length",q)}function N(e){return _(e,"size",A)}function I(e){return _(e,"position",A)}function M(e){return _(e,"url",B)}function P(e){return _(e,"number",E)}function E(e){return!Number.isNaN(Number(e))}function S(e){return e.endsWith("%")&&E(e.slice(0,-1))}function O(e){return Z(e)||_(e,"number",Z)}function $(e){return y.test(e)}function T(){return!0}function R(e){return k.test(e)}function W(e){return _(e,"",D)}function _(e,r,o){var t=y.exec(e);return!!t&&(t[1]?t[1]===r:o(t[2]))}function q(e){return z.test(e)}function A(){return!1}function B(e){return e.startsWith("url(")}function Z(e){return Number.isInteger(Number(e))}function D(e){return C.test(e)}function F(){var e=v("colors"),r=v("spacing"),o=v("blur"),t=v("brightness"),n=v("borderColor"),i=v("borderRadius"),a=v("borderSpacing"),l=v("borderWidth"),s=v("contrast"),c=v("grayscale"),d=v("hueRotate"),u=v("invert"),p=v("gap"),b=v("gradientColorStops"),f=v("gradientColorStopPositions"),m=v("inset"),g=v("margin"),h=v("opacity"),y=v("padding"),x=v("saturate"),w=v("scale"),k=v("sepia"),z=v("skew"),C=v("space"),_=v("translate"),q=function(){return["auto",$,r]},A=function(){return[$,r]},B=function(){return["",j]},Z=function(){return["auto",E,$]},D=function(){return["","0",$]},F=function(){return[E,P]},H=function(){return[E,$]};return{cacheSize:500,theme:{colors:[T],spacing:[j],blur:["none","",R,$],brightness:F(),borderColor:[e],borderRadius:["none","","full",R,$],borderSpacing:A(),borderWidth:B(),contrast:F(),grayscale:D(),hueRotate:H(),invert:D(),gap:A(),gradientColorStops:[e],gradientColorStopPositions:[S,G],inset:q(),margin:q(),opacity:F(),padding:A(),saturate:F(),scale:F(),sepia:D(),skew:H(),space:A(),translate:A()},classGroups:{aspect:[{aspect:["auto","square","video",$]}],container:["container"],columns:[{columns:[R]}],"break-after":[{"break-after":["auto","avoid","all","avoid-page","page","left","right","column"]}],"break-before":[{"break-before":["auto","avoid","all","avoid-page","page","left","right","column"]}],"break-inside":[{"break-inside":["auto","avoid","avoid-page","avoid-column"]}],"box-decoration":[{"box-decoration":["slice","clone"]}],box:[{box:["border","content"]}],display:["block","inline-block","inline","flex","inline-flex","table","inline-table","table-caption","table-cell","table-column","table-column-group","table-footer-group","table-header-group","table-row-group","table-row","flow-root","grid","inline-grid","contents","list-item","hidden"],float:[{float:["right","left","none"]}],clear:[{clear:["left","right","both","none"]}],isolation:["isolate","isolation-auto"],"object-fit":[{object:["contain","cover","fill","none","scale-down"]}],"object-position":[{object:[].concat(["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],[$])}],overflow:[{overflow:["auto","hidden","clip","visible","scroll"]}],"overflow-x":[{"overflow-x":["auto","hidden","clip","visible","scroll"]}],"overflow-y":[{"overflow-y":["auto","hidden","clip","visible","scroll"]}],overscroll:[{overscroll:["auto","contain","none"]}],"overscroll-x":[{"overscroll-x":["auto","contain","none"]}],"overscroll-y":[{"overscroll-y":["auto","contain","none"]}],position:["static","fixed","absolute","relative","sticky"],inset:[{inset:[m]}],"inset-x":[{"inset-x":[m]}],"inset-y":[{"inset-y":[m]}],start:[{start:[m]}],end:[{end:[m]}],top:[{top:[m]}],right:[{right:[m]}],bottom:[{bottom:[m]}],left:[{left:[m]}],visibility:["visible","invisible","collapse"],z:[{z:["auto",O]}],basis:[{basis:q()}],"flex-direction":[{flex:["row","row-reverse","col","col-reverse"]}],"flex-wrap":[{flex:["wrap","wrap-reverse","nowrap"]}],flex:[{flex:["1","auto","initial","none",$]}],grow:[{grow:D()}],shrink:[{shrink:D()}],order:[{order:["first","last","none",O]}],"grid-cols":[{"grid-cols":[T]}],"col-start-end":[{col:["auto",{span:["full",O]},$]}],"col-start":[{"col-start":Z()}],"col-end":[{"col-end":Z()}],"grid-rows":[{"grid-rows":[T]}],"row-start-end":[{row:["auto",{span:[O]},$]}],"row-start":[{"row-start":Z()}],"row-end":[{"row-end":Z()}],"grid-flow":[{"grid-flow":["row","col","dense","row-dense","col-dense"]}],"auto-cols":[{"auto-cols":["auto","min","max","fr",$]}],"auto-rows":[{"auto-rows":["auto","min","max","fr",$]}],gap:[{gap:[p]}],"gap-x":[{"gap-x":[p]}],"gap-y":[{"gap-y":[p]}],"justify-content":[{justify:["normal"].concat(["start","end","center","between","around","evenly","stretch"])}],"justify-items":[{"justify-items":["start","end","center","stretch"]}],"justify-self":[{"justify-self":["auto","start","end","center","stretch"]}],"align-content":[{content:["normal"].concat(["start","end","center","between","around","evenly","stretch"],["baseline"])}],"align-items":[{items:["start","end","center","baseline","stretch"]}],"align-self":[{self:["auto","start","end","center","stretch","baseline"]}],"place-content":[{"place-content":[].concat(["start","end","center","between","around","evenly","stretch"],["baseline"])}],"place-items":[{"place-items":["start","end","center","baseline","stretch"]}],"place-self":[{"place-self":["auto","start","end","center","stretch"]}],p:[{p:[y]}],px:[{px:[y]}],py:[{py:[y]}],ps:[{ps:[y]}],pe:[{pe:[y]}],pt:[{pt:[y]}],pr:[{pr:[y]}],pb:[{pb:[y]}],pl:[{pl:[y]}],m:[{m:[g]}],mx:[{mx:[g]}],my:[{my:[g]}],ms:[{ms:[g]}],me:[{me:[g]}],mt:[{mt:[g]}],mr:[{mr:[g]}],mb:[{mb:[g]}],ml:[{ml:[g]}],"space-x":[{"space-x":[C]}],"space-x-reverse":["space-x-reverse"],"space-y":[{"space-y":[C]}],"space-y-reverse":["space-y-reverse"],w:[{w:["auto","min","max","fit",$,r]}],"min-w":[{"min-w":["min","max","fit",$,j]}],"max-w":[{"max-w":["0","none","full","min","max","fit","prose",{screen:[R]},R,$]}],h:[{h:[$,r,"auto","min","max","fit"]}],"min-h":[{"min-h":["min","max","fit",$,j]}],"max-h":[{"max-h":[$,r,"min","max","fit"]}],"font-size":[{text:["base",R,G]}],"font-smoothing":["antialiased","subpixel-antialiased"],"font-style":["italic","not-italic"],"font-weight":[{font:["thin","extralight","light","normal","medium","semibold","bold","extrabold","black",P]}],"font-family":[{font:[T]}],"fvn-normal":["normal-nums"],"fvn-ordinal":["ordinal"],"fvn-slashed-zero":["slashed-zero"],"fvn-figure":["lining-nums","oldstyle-nums"],"fvn-spacing":["proportional-nums","tabular-nums"],"fvn-fraction":["diagonal-fractions","stacked-fractons"],tracking:[{tracking:["tighter","tight","normal","wide","wider","widest",$]}],"line-clamp":[{"line-clamp":["none",E,P]}],leading:[{leading:["none","tight","snug","normal","relaxed","loose",$,j]}],"list-image":[{"list-image":["none",$]}],"list-style-type":[{list:["none","disc","decimal",$]}],"list-style-position":[{list:["inside","outside"]}],"placeholder-color":[{placeholder:[e]}],"placeholder-opacity":[{"placeholder-opacity":[h]}],"text-alignment":[{text:["left","center","right","justify","start","end"]}],"text-color":[{text:[e]}],"text-opacity":[{"text-opacity":[h]}],"text-decoration":["underline","overline","line-through","no-underline"],"text-decoration-style":[{decoration:[].concat(["solid","dashed","dotted","double","none"],["wavy"])}],"text-decoration-thickness":[{decoration:["auto","from-font",j]}],"underline-offset":[{"underline-offset":["auto",$,j]}],"text-decoration-color":[{decoration:[e]}],"text-transform":["uppercase","lowercase","capitalize","normal-case"],"text-overflow":["truncate","text-ellipsis","text-clip"],indent:[{indent:A()}],"vertical-align":[{align:["baseline","top","middle","bottom","text-top","text-bottom","sub","super",$]}],whitespace:[{whitespace:["normal","nowrap","pre","pre-line","pre-wrap","break-spaces"]}],break:[{break:["normal","words","all","keep"]}],hyphens:[{hyphens:["none","manual","auto"]}],content:[{content:["none",$]}],"bg-attachment":[{bg:["fixed","local","scroll"]}],"bg-clip":[{"bg-clip":["border","padding","content","text"]}],"bg-opacity":[{"bg-opacity":[h]}],"bg-origin":[{"bg-origin":["border","padding","content"]}],"bg-position":[{bg:[].concat(["bottom","center","left","left-bottom","left-top","right","right-bottom","right-top","top"],[I])}],"bg-repeat":[{bg:["no-repeat",{repeat:["","x","y","round","space"]}]}],"bg-size":[{bg:["auto","cover","contain",N]}],"bg-image":[{bg:["none",{"gradient-to":["t","tr","r","br","b","bl","l","tl"]},M]}],"bg-color":[{bg:[e]}],"gradient-from-pos":[{from:[f]}],"gradient-via-pos":[{via:[f]}],"gradient-to-pos":[{to:[f]}],"gradient-from":[{from:[b]}],"gradient-via":[{via:[b]}],"gradient-to":[{to:[b]}],rounded:[{rounded:[i]}],"rounded-s":[{"rounded-s":[i]}],"rounded-e":[{"rounded-e":[i]}],"rounded-t":[{"rounded-t":[i]}],"rounded-r":[{"rounded-r":[i]}],"rounded-b":[{"rounded-b":[i]}],"rounded-l":[{"rounded-l":[i]}],"rounded-ss":[{"rounded-ss":[i]}],"rounded-se":[{"rounded-se":[i]}],"rounded-ee":[{"rounded-ee":[i]}],"rounded-es":[{"rounded-es":[i]}],"rounded-tl":[{"rounded-tl":[i]}],"rounded-tr":[{"rounded-tr":[i]}],"rounded-br":[{"rounded-br":[i]}],"rounded-bl":[{"rounded-bl":[i]}],"border-w":[{border:[l]}],"border-w-x":[{"border-x":[l]}],"border-w-y":[{"border-y":[l]}],"border-w-s":[{"border-s":[l]}],"border-w-e":[{"border-e":[l]}],"border-w-t":[{"border-t":[l]}],"border-w-r":[{"border-r":[l]}],"border-w-b":[{"border-b":[l]}],"border-w-l":[{"border-l":[l]}],"border-opacity":[{"border-opacity":[h]}],"border-style":[{border:[].concat(["solid","dashed","dotted","double","none"],["hidden"])}],"divide-x":[{"divide-x":[l]}],"divide-x-reverse":["divide-x-reverse"],"divide-y":[{"divide-y":[l]}],"divide-y-reverse":["divide-y-reverse"],"divide-opacity":[{"divide-opacity":[h]}],"divide-style":[{divide:["solid","dashed","dotted","double","none"]}],"border-color":[{border:[n]}],"border-color-x":[{"border-x":[n]}],"border-color-y":[{"border-y":[n]}],"border-color-t":[{"border-t":[n]}],"border-color-r":[{"border-r":[n]}],"border-color-b":[{"border-b":[n]}],"border-color-l":[{"border-l":[n]}],"divide-color":[{divide:[n]}],"outline-style":[{outline:[""].concat(["solid","dashed","dotted","double","none"])}],"outline-offset":[{"outline-offset":[$,j]}],"outline-w":[{outline:[j]}],"outline-color":[{outline:[e]}],"ring-w":[{ring:B()}],"ring-w-inset":["ring-inset"],"ring-color":[{ring:[e]}],"ring-opacity":[{"ring-opacity":[h]}],"ring-offset-w":[{"ring-offset":[j]}],"ring-offset-color":[{"ring-offset":[e]}],shadow:[{shadow:["","inner","none",R,W]}],"shadow-color":[{shadow:[T]}],opacity:[{opacity:[h]}],"mix-blend":[{"mix-blend":["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity","plus-lighter"]}],"bg-blend":[{"bg-blend":["normal","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity","plus-lighter"]}],filter:[{filter:["","none"]}],blur:[{blur:[o]}],brightness:[{brightness:[t]}],contrast:[{contrast:[s]}],"drop-shadow":[{"drop-shadow":["","none",R,$]}],grayscale:[{grayscale:[c]}],"hue-rotate":[{"hue-rotate":[d]}],invert:[{invert:[u]}],saturate:[{saturate:[x]}],sepia:[{sepia:[k]}],"backdrop-filter":[{"backdrop-filter":["","none"]}],"backdrop-blur":[{"backdrop-blur":[o]}],"backdrop-brightness":[{"backdrop-brightness":[t]}],"backdrop-contrast":[{"backdrop-contrast":[s]}],"backdrop-grayscale":[{"backdrop-grayscale":[c]}],"backdrop-hue-rotate":[{"backdrop-hue-rotate":[d]}],"backdrop-invert":[{"backdrop-invert":[u]}],"backdrop-opacity":[{"backdrop-opacity":[h]}],"backdrop-saturate":[{"backdrop-saturate":[x]}],"backdrop-sepia":[{"backdrop-sepia":[k]}],"border-collapse":[{border:["collapse","separate"]}],"border-spacing":[{"border-spacing":[a]}],"border-spacing-x":[{"border-spacing-x":[a]}],"border-spacing-y":[{"border-spacing-y":[a]}],"table-layout":[{table:["auto","fixed"]}],caption:[{caption:["top","bottom"]}],transition:[{transition:["none","all","","colors","opacity","shadow","transform",$]}],duration:[{duration:H()}],ease:[{ease:["linear","in","out","in-out",$]}],delay:[{delay:H()}],animate:[{animate:["none","spin","ping","pulse","bounce",$]}],transform:[{transform:["","gpu","none"]}],scale:[{scale:[w]}],"scale-x":[{"scale-x":[w]}],"scale-y":[{"scale-y":[w]}],rotate:[{rotate:[O,$]}],"translate-x":[{"translate-x":[_]}],"translate-y":[{"translate-y":[_]}],"skew-x":[{"skew-x":[z]}],"skew-y":[{"skew-y":[z]}],"transform-origin":[{origin:["center","top","top-right","right","bottom-right","bottom","bottom-left","left","top-left",$]}],accent:[{accent:["auto",e]}],appearance:["appearance-none"],cursor:[{cursor:["auto","default","pointer","wait","text","move","help","not-allowed","none","context-menu","progress","cell","crosshair","vertical-text","alias","copy","no-drop","grab","grabbing","all-scroll","col-resize","row-resize","n-resize","e-resize","s-resize","w-resize","ne-resize","nw-resize","se-resize","sw-resize","ew-resize","ns-resize","nesw-resize","nwse-resize","zoom-in","zoom-out",$]}],"caret-color":[{caret:[e]}],"pointer-events":[{"pointer-events":["none","auto"]}],resize:[{resize:["none","y","x",""]}],"scroll-behavior":[{scroll:["auto","smooth"]}],"scroll-m":[{"scroll-m":A()}],"scroll-mx":[{"scroll-mx":A()}],"scroll-my":[{"scroll-my":A()}],"scroll-ms":[{"scroll-ms":A()}],"scroll-me":[{"scroll-me":A()}],"scroll-mt":[{"scroll-mt":A()}],"scroll-mr":[{"scroll-mr":A()}],"scroll-mb":[{"scroll-mb":A()}],"scroll-ml":[{"scroll-ml":A()}],"scroll-p":[{"scroll-p":A()}],"scroll-px":[{"scroll-px":A()}],"scroll-py":[{"scroll-py":A()}],"scroll-ps":[{"scroll-ps":A()}],"scroll-pe":[{"scroll-pe":A()}],"scroll-pt":[{"scroll-pt":A()}],"scroll-pr":[{"scroll-pr":A()}],"scroll-pb":[{"scroll-pb":A()}],"scroll-pl":[{"scroll-pl":A()}],"snap-align":[{snap:["start","end","center","align-none"]}],"snap-stop":[{snap:["normal","always"]}],"snap-type":[{snap:["none","x","y","both"]}],"snap-strictness":[{snap:["mandatory","proximity"]}],touch:[{touch:["auto","none","pinch-zoom","manipulation",{pan:["x","left","right","y","up","down"]}]}],select:[{select:["none","text","all","auto"]}],"will-change":[{"will-change":["auto","scroll","contents","transform",$]}],fill:[{fill:[e,"none"]}],"stroke-w":[{stroke:[j,P]}],stroke:[{stroke:[e,"none"]}],sr:["sr-only","not-sr-only"]},conflictingClassGroups:{overflow:["overflow-x","overflow-y"],overscroll:["overscroll-x","overscroll-y"],inset:["inset-x","inset-y","start","end","top","right","bottom","left"],"inset-x":["right","left"],"inset-y":["top","bottom"],flex:["basis","grow","shrink"],gap:["gap-x","gap-y"],p:["px","py","ps","pe","pt","pr","pb","pl"],px:["pr","pl"],py:["pt","pb"],m:["mx","my","ms","me","mt","mr","mb","ml"],mx:["mr","ml"],my:["mt","mb"],"font-size":["leading"],"fvn-normal":["fvn-ordinal","fvn-slashed-zero","fvn-figure","fvn-spacing","fvn-fraction"],"fvn-ordinal":["fvn-normal"],"fvn-slashed-zero":["fvn-normal"],"fvn-figure":["fvn-normal"],"fvn-spacing":["fvn-normal"],"fvn-fraction":["fvn-normal"],rounded:["rounded-s","rounded-e","rounded-t","rounded-r","rounded-b","rounded-l","rounded-ss","rounded-se","rounded-ee","rounded-es","rounded-tl","rounded-tr","rounded-br","rounded-bl"],"rounded-s":["rounded-ss","rounded-es"],"rounded-e":["rounded-se","rounded-ee"],"rounded-t":["rounded-tl","rounded-tr"],"rounded-r":["rounded-tr","rounded-br"],"rounded-b":["rounded-br","rounded-bl"],"rounded-l":["rounded-tl","rounded-bl"],"border-spacing":["border-spacing-x","border-spacing-y"],"border-w":["border-w-s","border-w-e","border-w-t","border-w-r","border-w-b","border-w-l"],"border-w-x":["border-w-r","border-w-l"],"border-w-y":["border-w-t","border-w-b"],"border-color":["border-color-t","border-color-r","border-color-b","border-color-l"],"border-color-x":["border-color-r","border-color-l"],"border-color-y":["border-color-t","border-color-b"],"scroll-m":["scroll-mx","scroll-my","scroll-ms","scroll-me","scroll-mt","scroll-mr","scroll-mb","scroll-ml"],"scroll-mx":["scroll-mr","scroll-ml"],"scroll-my":["scroll-mt","scroll-mb"],"scroll-p":["scroll-px","scroll-py","scroll-ps","scroll-pe","scroll-pt","scroll-pr","scroll-pb","scroll-pl"],"scroll-px":["scroll-pr","scroll-pl"],"scroll-py":["scroll-pt","scroll-pb"]},conflictingClassGroupModifiers:{"font-size":["leading"]}}}var H=h(F),J=["a","abbr","address","area","article","aside","audio","b","base","bdi","bdo","big","blockquote","body","br","button","canvas","caption","cite","code","col","colgroup","data","datalist","dd","del","details","dfn","dialog","div","dl","dt","em","embed","fieldset","figcaption","figure","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","iframe","img","input","ins","kbd","keygen","label","legend","li","link","main","map","mark","menu","menuitem","meta","meter","nav","noscript","object","ol","optgroup","option","output","p","param","picture","pre","progress","q","rp","rt","ruby","s","samp","script","section","select","small","source","span","strong","style","sub","summary","sup","table","tbody","td","textarea","tfoot","th","thead","time","title","tr","track","u","ul","var","video","wbr","circle","clipPath","defs","ellipse","foreignObject","g","image","line","linearGradient","marker","mask","path","pattern","polygon","polyline","radialGradient","rect","stop","svg","text","tspan"],K=Symbol("isTwElement?"),L=(e,r)=>e.reduce(((e,o,t)=>e.concat(o||[],r[t]||[])),[]),Q=(e,r="")=>{let o=e.join(" ").trim().replace(/\n/g," ").replace(/\s{2,}/g," ").split(" ").filter((e=>","!==e)),t=r?r.split(" "):[];return H(...o.concat(t).filter((e=>" "!==e)))},U=([e])=>"$"!==e.charAt(0),V=e=>!0===e[K],X=e=>(r,...o)=>{let n=(i=[])=>{let a=t.forwardRef(((n,a)=>{let{$as:l=e,style:s={},...c}=n,d=V(e)?e:l,u=i?i.reduce(((e,r)=>Object.assign(e,"function"==typeof r?r(n):r)),{}):{},p=V(d)?c:Object.fromEntries(Object.entries(c).filter(U));return t.createElement(d,{...p,style:{...u,...s},ref:a,className:Q(L(r,o.map((e=>e({...c,$as:l})))),c.className),...V(e)?{$as:l}:{}})}));return a[K]=!0,a.displayName="string"!=typeof e?e.displayName||e.name||"tw.Component":"tw."+e,a.withStyle=e=>n(i.concat(e)),a};return n()},Y=J.reduce(((e,r)=>({...e,[r]:X(r)})),{}),ee=Object.assign(X,Y)}}]);