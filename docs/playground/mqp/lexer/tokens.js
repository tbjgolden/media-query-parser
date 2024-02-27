const t=10,e=32,n=45,s=48,u=57,r=65,o=92,l=97,i=122,a=128;export const codepointsToTokens=(c,f=0)=>{const d=[];for(;f<c.length;f+=1){const h=c.at(f),p=f;if(47===h&&42===c.at(f+1)){f+=2;for(let t=c.at(f);void 0!==t;t=c.at(++f))if(42===t&&47===c.at(f+1)){f+=1;break}}else if(9===h||h===e||h===t){let n=c.at(++f);for(;9===n||n===e||n===t;)n=c.at(++f);f-=1;const s=d.at(-1);"whitespace"===(null==s?void 0:s._t)?(d.pop(),d.push({_t:"whitespace",start:s.start,end:f})):d.push({_t:"whitespace",start:p,end:f})}else if(34===h){const t=consumeString(c,f);if(null===t)return{_errid:"INVALID_STRING",start:f,end:f};const[e,n]=t;f=e,d.push({_t:"string",value:n,start:p,end:f})}else if(35===h){if(f+1<c.length){const e=c.at(f+1);if(95===e||e>=r&&e<=90||e>=l&&e<=i||e>=a||e>=s&&e<=u||e===o&&f+2<c.length&&c.at(f+2)!==t){const t=wouldStartIdentifier(c,f+1)?"id":"unrestricted",e=consumeIdentUnsafe(c,f+1);if(null!==e){const[n,s]=e;f=n,d.push({_t:"hash",value:s.toLowerCase(),flag:t,start:p,end:f});continue}}}d.push({_t:"delim",value:h,start:p,end:f})}else if(39===h){const t=consumeString(c,f);if(null===t)return{_errid:"INVALID_STRING",start:f,end:f};const[e,n]=t;f=e,d.push({_t:"string",value:n,start:p,end:f})}else if(40===h)d.push({_t:"(",start:p,end:f});else if(41===h)d.push({_t:")",start:p,end:f});else if(43===h){const t=consumeNumeric(c,f);if(null===t)d.push({_t:"delim",value:h,start:p,end:f});else{const[e,n]=t;f=e,"dimension"===n[0]?d.push({_t:"dimension",value:n[1],unit:n[2].toLowerCase(),flag:"number",start:p,end:f}):"number"===n[0]?d.push({_t:n[0],value:n[1],flag:n[2],start:p,end:f}):d.push({_t:n[0],value:n[1],flag:"number",start:p,end:f})}}else if(44===h)d.push({_t:"comma",start:p,end:f});else if(h===n){const t=consumeNumeric(c,f);if(null!==t){const[e,n]=t;f=e,"dimension"===n[0]?d.push({_t:"dimension",value:n[1],unit:n[2].toLowerCase(),flag:"number",start:p,end:f}):"number"===n[0]?d.push({_t:n[0],value:n[1],flag:n[2],start:p,end:f}):d.push({_t:n[0],value:n[1],flag:"number",start:p,end:f});continue}if(f+2<c.length){const t=c.at(f+1),e=c.at(f+2);if(t===n&&62===e){f+=2,d.push({_t:"CDC",start:p,end:f});continue}}const e=consumeIdentLike(c,f);if(null!==e){const[t,n,s]=e;f=t,d.push({_t:s,value:n,start:p,end:f});continue}d.push({_t:"delim",value:h,start:p,end:f})}else if(46===h){const t=consumeNumeric(c,f);if(null!==t){const[e,n]=t;f=e,"dimension"===n[0]?d.push({_t:"dimension",value:n[1],unit:n[2].toLowerCase(),flag:"number",start:p,end:f}):"number"===n[0]?d.push({_t:n[0],value:n[1],flag:n[2],start:p,end:f}):d.push({_t:n[0],value:n[1],flag:"number",start:p,end:f});continue}d.push({_t:"delim",value:h,start:p,end:f})}else if(58===h)d.push({_t:"colon",start:p,end:f});else if(59===h)d.push({_t:"semicolon",start:p,end:f});else if(60===h){if(f+3<c.length){const t=c.at(f+1),e=c.at(f+2),s=c.at(f+3);if(33===t&&e===n&&s===n){f+=3,d.push({_t:"CDO",start:p,end:f});continue}}d.push({_t:"delim",value:h,start:p,end:f})}else if(64===h){const t=consumeIdent(c,f+1);if(null!==t){const[e,n]=t;f=e,d.push({_t:"at-keyword",value:n.toLowerCase(),start:p,end:f});continue}d.push({_t:"delim",value:h,start:p,end:f})}else if(91===h)d.push({_t:"[",start:p,end:f});else if(93===h)d.push({_t:"]",start:p,end:f});else if(123===h)d.push({_t:"{",start:p,end:f});else if(125===h)d.push({_t:"}",start:p,end:f});else if(h>=s&&h<=u){const t=consumeNumeric(c,f),[e,n]=t;f=e,"dimension"===n[0]?d.push({_t:"dimension",value:n[1],unit:n[2].toLowerCase(),flag:"number",start:p,end:f}):"number"===n[0]?d.push({_t:n[0],value:n[1],flag:n[2],start:p,end:f}):d.push({_t:n[0],value:n[1],flag:"number",start:p,end:f})}else if(95===h||h>=r&&h<=90||h>=l&&h<=i||h>=a||h===o){const t=consumeIdentLike(c,f);if(null===t)d.push({_t:"delim",value:h,start:p,end:f});else{const[e,n,s]=t;f=e,d.push({_t:s,value:n,start:p,end:f})}}else d.push({_t:"delim",value:h,start:p,end:f})}return d.push({_t:"EOF",start:f,end:f}),d};export const consumeString=(e,n)=>{if(e.length<=n+1)return null;const s=e.at(n),u=[];for(let r=n+1;r<e.length;r+=1){const n=e.at(r);if(n===s)return[r,String.fromCodePoint(...u)];if(n===o){const t=consumeEscape(e,r);if(null===t)return null;const[n,s]=t;u.push(s),r=n}else{if(n===t)return null;u.push(n)}}return null};export const wouldStartIdentifier=(e,s)=>{const u=e.at(s);if(void 0===u)return!1;if(u===n){const u=e.at(s+1);return void 0!==u&&(u===n||95===u||u>=r&&u<=90||u>=l&&u<=i||u>=a||u===o&&(!(e.length<=s+2)&&e.at(s+2)!==t))}return 95===u||u>=r&&u<=90||u>=l&&u<=i||u>=a||u===o&&(!(e.length<=s+1)&&e.at(s+1)!==t)};export const consumeEscape=(n,i)=>{if(n.length<=i+1)return null;if(n.at(i)!==o)return null;const a=n.at(i+1);if(a===t)return null;if(a>=s&&a<=u||a>=r&&a<=70||a>=l&&a<=102){const o=[a],c=Math.min(i+7,n.length);let f=i+2;for(;f<c;f+=1){const t=n.at(f);if(!(t>=s&&t<=u||t>=r&&t<=70||t>=l&&t<=102))break;o.push(t)}if(f<n.length){const s=n.at(f);9!==s&&s!==e&&s!==t||(f+=1)}return[f-1,Number.parseInt(String.fromCodePoint(...o),16)]}return[i+1,a]};export const consumeNumeric=(t,e)=>{const n=consumeNumber(t,e);if(null===n)return null;const[s,u,r]=n,o=consumeIdent(t,s+1);if(null!==o){const[t,e]=o;return[t,["dimension",u,e]]}return s+1<t.length&&37===t.at(s+1)?[s+1,["percentage",u]]:[s,["number",u,r]]};export const consumeNumber=(t,e)=>{const r=t.at(e);if(void 0===r)return null;let o="integer";const l=[];for(43!==r&&r!==n||(e+=1,r===n&&l.push(n));e<t.length;){const n=t.at(e);if(!(n>=s&&n<=u))break;l.push(n),e+=1}if(e+1<t.length){const n=t.at(e),r=t.at(e+1);if(46===n&&r>=s&&r<=u)for(l.push(n,r),o="number",e+=2;e<t.length;){const n=t.at(e);if(!(n>=s&&n<=u))break;l.push(n),e+=1}}if(e+1<t.length){const r=t.at(e),i=t.at(e+1),a=t.at(e+2);if(69===r||101===r){let r=!1;if(i>=s&&i<=u?(l.push(69,i),e+=2,r=!0):(i===n||43===i)&&void 0!==a&&a>=s&&a<=u&&(l.push(69),i===n&&l.push(n),l.push(a),e+=3,r=!0),r)for(o="number";e<t.length;){const n=t.at(e);if(!(n>=s&&n<=u))break;l.push(n),e+=1}}}const i=String.fromCodePoint(...l);let a="number"===o?Number.parseFloat(i):Number.parseInt(i);return 0===a&&(a=0),Number.isNaN(a)?null:[e-1,a,o]};export const consumeIdentUnsafe=(t,e)=>{if(t.length<=e)return null;const o=[];for(let c=t.at(e);e<t.length;c=t.at(++e)){if(!(c===n||95===c||c>=r&&c<=90||c>=l&&c<=i||c>=a||c>=s&&c<=u)){{const n=consumeEscape(t,e);if(null!==n){const[t,s]=n;o.push(s),e=t;continue}}break}o.push(c)}return 0===e?null:[e-1,String.fromCodePoint(...o)]};export const consumeIdent=(t,e)=>wouldStartIdentifier(t,e)?consumeIdentUnsafe(t,e):null;export const consumeUrl=(n,s)=>{let u=n.at(s);for(;9===u||u===e||u===t;)u=n.at(++s);const r=[];let l=!1;for(;s<n.length;){if(41===u)return[s,String.fromCodePoint(...r)];if(34===u||39===u||40===u)return null;if(9===u||u===e||u===t)!l&&r.length>0&&(l=!0);else if(u===o){const t=consumeEscape(n,s);if(null===t||l)return null;const[e,u]=t;r.push(u),s=e}else{if(l)return null;r.push(u)}u=n.at(++s)}return null};export const consumeIdentLike=(n,s)=>{const u=consumeIdent(n,s);if(null===u)return null;const[r,o]=u;if("url"===o.toLowerCase()){if(n.length>r+1&&40===n.at(r+1)){for(let s=2;r+s<n.length;s+=1){const u=n.at(r+s);if(34===u||39===u)return[r+1,o.toLowerCase(),"function"];if(9!==u&&u!==e&&u!==t){const t=consumeUrl(n,r+s);if(null===t)return null;const[e,u]=t;return[e,u,"url"]}}return[r+1,o.toLowerCase(),"function"]}}else if(n.length>r+1&&40===n.at(r+1))return[r+1,o.toLowerCase(),"function"];return[r,o.toLowerCase(),"ident"]};