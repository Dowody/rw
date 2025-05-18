const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/add-DGm_II9I.js","assets/CheckoutPage-Dzgf_enj.js","assets/index-D5Mvrn8N.js","assets/index-CIiiU5ML.css","assets/invoiceUtils-BxBZ_IFP.js","assets/gamepad-2-C3dfxic0.js","assets/shield-check-DWfMx-9S.js","assets/file-text-CWGIevsS.js","assets/all-wallets-3RWTU_pL.js","assets/arrow-bottom-circle-Ce0r8L8u.js","assets/app-store-C2v-X8PX.js","assets/apple-D9Xk2oWf.js","assets/arrow-bottom-P2_Bzb_m.js","assets/arrow-left-BR5X6wDb.js","assets/arrow-right-ClLlsQ1B.js","assets/arrow-top-C9fDWYaN.js","assets/bank-CJu5EQEY.js","assets/browser-GeG2x-T3.js","assets/card-Bv_1a7PI.js","assets/checkmark-Chl93UAe.js","assets/checkmark-bold-DJ_ZD7Yp.js","assets/chevron-bottom-mT1jYPZp.js","assets/chevron-left-Decuv2H7.js","assets/chevron-right-Cfu6pnmv.js","assets/chevron-top-ChqugFPt.js","assets/chrome-store-_p5NCGZR.js","assets/clock-bGctaTLA.js","assets/close-B_KUYs1Z.js","assets/compass-BMUEsBOE.js","assets/coinPlaceholder-BqL2zt6w.js","assets/copy-CSyTAUu1.js","assets/cursor-DA_L6C9z.js","assets/cursor-transparent-CdCR3Dyg.js","assets/desktop-DfQRZEYZ.js","assets/disconnect-DTc9z7mE.js","assets/discord-kysiqnEU.js","assets/etherscan-BH0-IjEM.js","assets/extension-WxlXaw3U.js","assets/external-link-fI_AMoaM.js","assets/facebook-v5KY6C6R.js","assets/farcaster-BEnUjzNm.js","assets/filters-CWfwBEw_.js","assets/github-CnL0LY0R.js","assets/google-BQaKiMD2.js","assets/help-circle-CVX_kzUJ.js","assets/image-WJ1Ep21I.js","assets/id-CD6B68z6.js","assets/info-circle-BFBICG0M.js","assets/lightbulb-BaGIFDS_.js","assets/mail-DEZRVFj_.js","assets/mobile-BqLDTdXQ.js","assets/more-Di4mZiKe.js","assets/network-placeholder-BeAj6t6m.js","assets/nftPlaceholder-_QUj2pFg.js","assets/off-CWY4goKG.js","assets/play-store-DbgsfevM.js","assets/plus-chYVq2BB.js","assets/qr-code-Dda90ImA.js","assets/recycle-horizontal-BGlVkqgi.js","assets/refresh-C1HXqKjT.js","assets/search-CT7KhSFQ.js","assets/send-CE7YRGsz.js","assets/swapHorizontal-EjjWLNcX.js","assets/swapHorizontalMedium-AnHjexOO.js","assets/swapHorizontalBold-4SX3HxzZ.js","assets/swapHorizontalRoundedBold-CmlEHigX.js","assets/swapVertical-BYUQAq7m.js","assets/telegram-CWzpsnCr.js","assets/three-dots-D-kf5NIH.js","assets/twitch-BOv6j3LA.js","assets/x-SMw1LxMU.js","assets/twitterIcon-IAZlg8O6.js","assets/verify-BOkF1JEV.js","assets/verify-filled-BPueXuPy.js","assets/wallet-BkTtv_CI.js","assets/walletconnect-BG9ZLjJF.js","assets/wallet-placeholder-DehPUm8r.js","assets/warning-circle--0BZMvHm.js","assets/info-5F2TVMVH.js","assets/exclamation-triangle-COtMG3ni.js","assets/reown-logo-BFOOtFVJ.js"])))=>i.map(i=>d[i]);
import{_ as r}from"./index-D5Mvrn8N.js";import{Z as k,_ as B,$ as T,i as P,r as R,K as j,a as L,x as S,X as H}from"./CheckoutPage-Dzgf_enj.js";const d={getSpacingStyles(t,e){if(Array.isArray(t))return t[e]?`var(--wui-spacing-${t[e]})`:void 0;if(typeof t=="string")return`var(--wui-spacing-${t})`},getFormattedDate(t){return new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(t)},getHostName(t){try{return new URL(t).hostname}catch{return""}},getTruncateString({string:t,charsStart:e,charsEnd:i,truncate:n}){return t.length<=e+i?t:n==="end"?`${t.substring(0,e)}...`:n==="start"?`...${t.substring(t.length-i)}`:`${t.substring(0,Math.floor(e))}...${t.substring(t.length-Math.floor(i))}`},generateAvatarColors(t){const i=t.toLowerCase().replace(/^0x/iu,"").replace(/[^a-f0-9]/gu,"").substring(0,6).padEnd(6,"0"),n=this.hexToRgb(i),o=getComputedStyle(document.documentElement).getPropertyValue("--w3m-border-radius-master"),s=100-3*Number(o==null?void 0:o.replace("px","")),c=`${s}% ${s}% at 65% 40%`,u=[];for(let h=0;h<5;h+=1){const g=this.tintColor(n,.15*h);u.push(`rgb(${g[0]}, ${g[1]}, ${g[2]})`)}return`
    --local-color-1: ${u[0]};
    --local-color-2: ${u[1]};
    --local-color-3: ${u[2]};
    --local-color-4: ${u[3]};
    --local-color-5: ${u[4]};
    --local-radial-circle: ${c}
   `},hexToRgb(t){const e=parseInt(t,16),i=e>>16&255,n=e>>8&255,o=e&255;return[i,n,o]},tintColor(t,e){const[i,n,o]=t,a=Math.round(i+(255-i)*e),s=Math.round(n+(255-n)*e),c=Math.round(o+(255-o)*e);return[a,s,c]},isNumber(t){return{number:/^[0-9]+$/u}.number.test(t)},getColorTheme(t){var e;return t||(typeof window<"u"&&window.matchMedia?(e=window.matchMedia("(prefers-color-scheme: dark)"))!=null&&e.matches?"dark":"light":"dark")},splitBalance(t){const e=t.split(".");return e.length===2?[e[0],e[1]]:["0","00"]},roundNumber(t,e,i){return t.toString().length>=e?Number(t).toFixed(i):t},formatNumberToLocalString(t,e=2){return t===void 0?"0.00":typeof t=="number"?t.toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e}):parseFloat(t).toLocaleString("en-US",{maximumFractionDigits:e,minimumFractionDigits:e})}};function M(t,e){const{kind:i,elements:n}=e;return{kind:i,elements:n,finisher(o){customElements.get(t)||customElements.define(t,o)}}}function U(t,e){return customElements.get(t)||customElements.define(t,e),e}function I(t){return function(i){return typeof i=="function"?U(t,i):M(t,i)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const F={attribute:!0,type:String,converter:B,reflect:!1,hasChanged:k},G=(t=F,e,i)=>{const{kind:n,metadata:o}=i;let a=globalThis.litPropertyMetadata.get(o);if(a===void 0&&globalThis.litPropertyMetadata.set(o,a=new Map),n==="setter"&&((t=Object.create(t)).wrapped=!0),a.set(i.name,t),n==="accessor"){const{name:s}=i;return{set(c){const u=e.get.call(this);e.set.call(this,c),this.requestUpdate(s,u,t)},init(c){return c!==void 0&&this.C(s,void 0,t,c),c}}}if(n==="setter"){const{name:s}=i;return function(c){const u=this[s];e.call(this,c),this.requestUpdate(s,u,t)}}throw Error("Unsupported decorator location: "+n)};function l(t){return(e,i)=>typeof i=="object"?G(t,e,i):((n,o,a)=>{const s=o.hasOwnProperty(a);return o.constructor.createProperty(a,n),s?Object.getOwnPropertyDescriptor(o,a):void 0})(t,e,i)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function lt(t){return l({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const N=t=>t===null||typeof t!="object"&&typeof t!="function",W=t=>t.strings===void 0;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const V={ATTRIBUTE:1,CHILD:2},C=t=>(...e)=>({_$litDirective$:t,values:e});let x=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,i,n){this._$Ct=e,this._$AM=i,this._$Ci=n}_$AS(e,i){return this.update(e,i)}update(e,i){return this.render(...i)}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const f=(t,e)=>{var n;const i=t._$AN;if(i===void 0)return!1;for(const o of i)(n=o._$AO)==null||n.call(o,e,!1),f(o,e);return!0},E=t=>{let e,i;do{if((e=t._$AM)===void 0)break;i=e._$AN,i.delete(t),t=e}while((i==null?void 0:i.size)===0)},z=t=>{for(let e;e=t._$AM;t=e){let i=e._$AN;if(i===void 0)e._$AN=i=new Set;else if(i.has(t))break;i.add(t),X(e)}};function q(t){this._$AN!==void 0?(E(this),this._$AM=t,z(this)):this._$AM=t}function K(t,e=!1,i=0){const n=this._$AH,o=this._$AN;if(o!==void 0&&o.size!==0)if(e)if(Array.isArray(n))for(let a=i;a<n.length;a++)f(n[a],!1),E(n[a]);else n!=null&&(f(n,!1),E(n));else f(this,t)}const X=t=>{t.type==V.CHILD&&(t._$AP??(t._$AP=K),t._$AQ??(t._$AQ=q))};class Z extends x{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,i,n){super._$AT(e,i,n),z(this),this.isConnected=e._$AU}_$AO(e,i=!0){var n,o;e!==this.isConnected&&(this.isConnected=e,e?(n=this.reconnected)==null||n.call(this):(o=this.disconnected)==null||o.call(this)),i&&(f(this,e),E(this))}setValue(e){if(W(this._$Ct))this._$Ct._$AI(e,this);else{const i=[...this._$Ct._$AH];i[this._$Ci]=e,this._$Ct._$AI(i,this,0)}}disconnected(){}reconnected(){}}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class Y{constructor(e){this.G=e}disconnect(){this.G=void 0}reconnect(e){this.G=e}deref(){return this.G}}class Q{constructor(){this.Y=void 0,this.Z=void 0}get(){return this.Y}pause(){this.Y??(this.Y=new Promise(e=>this.Z=e))}resume(){var e;(e=this.Z)==null||e.call(this),this.Y=this.Z=void 0}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const D=t=>!N(t)&&typeof t.then=="function",O=1073741823;class J extends Z{constructor(){super(...arguments),this._$Cwt=O,this._$Cbt=[],this._$CK=new Y(this),this._$CX=new Q}render(...e){return e.find(i=>!D(i))??T}update(e,i){const n=this._$Cbt;let o=n.length;this._$Cbt=i;const a=this._$CK,s=this._$CX;this.isConnected||this.disconnected();for(let c=0;c<i.length&&!(c>this._$Cwt);c++){const u=i[c];if(!D(u))return this._$Cwt=c,u;c<o&&u===n[c]||(this._$Cwt=O,o=0,Promise.resolve(u).then(async h=>{for(;s.get();)await s.get();const g=a.deref();if(g!==void 0){const $=g._$Cbt.indexOf(u);$>-1&&$<g._$Cwt&&(g._$Cwt=$,g.setValue(h))}}))}return T}disconnected(){this._$CK.disconnect(),this._$CX.pause()}reconnected(){this._$CK.reconnect(this),this._$CX.resume()}}const tt=C(J);class et{constructor(){this.cache=new Map}set(e,i){this.cache.set(e,i)}get(e){return this.cache.get(e)}has(e){return this.cache.has(e)}delete(e){this.cache.delete(e)}clear(){this.cache.clear()}}const A=new et,it=P`
  :host {
    display: flex;
    aspect-ratio: var(--local-aspect-ratio);
    color: var(--local-color);
    width: var(--local-width);
  }

  svg {
    width: inherit;
    height: inherit;
    object-fit: contain;
    object-position: center;
  }

  .fallback {
    width: var(--local-width);
    height: var(--local-height);
  }
`;var m=function(t,e,i,n){var o=arguments.length,a=o<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,i):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")a=Reflect.decorate(t,e,i,n);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(a=(o<3?s(a):o>3?s(e,i,a):s(e,i))||a);return o>3&&a&&Object.defineProperty(e,i,a),a};const b={add:async()=>(await r(async()=>{const{addSvg:t}=await import("./add-DGm_II9I.js");return{addSvg:t}},__vite__mapDeps([0,1,2,3,4,5,6,7]))).addSvg,allWallets:async()=>(await r(async()=>{const{allWalletsSvg:t}=await import("./all-wallets-3RWTU_pL.js");return{allWalletsSvg:t}},__vite__mapDeps([8,1,2,3,4,5,6,7]))).allWalletsSvg,arrowBottomCircle:async()=>(await r(async()=>{const{arrowBottomCircleSvg:t}=await import("./arrow-bottom-circle-Ce0r8L8u.js");return{arrowBottomCircleSvg:t}},__vite__mapDeps([9,1,2,3,4,5,6,7]))).arrowBottomCircleSvg,appStore:async()=>(await r(async()=>{const{appStoreSvg:t}=await import("./app-store-C2v-X8PX.js");return{appStoreSvg:t}},__vite__mapDeps([10,1,2,3,4,5,6,7]))).appStoreSvg,apple:async()=>(await r(async()=>{const{appleSvg:t}=await import("./apple-D9Xk2oWf.js");return{appleSvg:t}},__vite__mapDeps([11,1,2,3,4,5,6,7]))).appleSvg,arrowBottom:async()=>(await r(async()=>{const{arrowBottomSvg:t}=await import("./arrow-bottom-P2_Bzb_m.js");return{arrowBottomSvg:t}},__vite__mapDeps([12,1,2,3,4,5,6,7]))).arrowBottomSvg,arrowLeft:async()=>(await r(async()=>{const{arrowLeftSvg:t}=await import("./arrow-left-BR5X6wDb.js");return{arrowLeftSvg:t}},__vite__mapDeps([13,1,2,3,4,5,6,7]))).arrowLeftSvg,arrowRight:async()=>(await r(async()=>{const{arrowRightSvg:t}=await import("./arrow-right-ClLlsQ1B.js");return{arrowRightSvg:t}},__vite__mapDeps([14,1,2,3,4,5,6,7]))).arrowRightSvg,arrowTop:async()=>(await r(async()=>{const{arrowTopSvg:t}=await import("./arrow-top-C9fDWYaN.js");return{arrowTopSvg:t}},__vite__mapDeps([15,1,2,3,4,5,6,7]))).arrowTopSvg,bank:async()=>(await r(async()=>{const{bankSvg:t}=await import("./bank-CJu5EQEY.js");return{bankSvg:t}},__vite__mapDeps([16,1,2,3,4,5,6,7]))).bankSvg,browser:async()=>(await r(async()=>{const{browserSvg:t}=await import("./browser-GeG2x-T3.js");return{browserSvg:t}},__vite__mapDeps([17,1,2,3,4,5,6,7]))).browserSvg,card:async()=>(await r(async()=>{const{cardSvg:t}=await import("./card-Bv_1a7PI.js");return{cardSvg:t}},__vite__mapDeps([18,1,2,3,4,5,6,7]))).cardSvg,checkmark:async()=>(await r(async()=>{const{checkmarkSvg:t}=await import("./checkmark-Chl93UAe.js");return{checkmarkSvg:t}},__vite__mapDeps([19,1,2,3,4,5,6,7]))).checkmarkSvg,checkmarkBold:async()=>(await r(async()=>{const{checkmarkBoldSvg:t}=await import("./checkmark-bold-DJ_ZD7Yp.js");return{checkmarkBoldSvg:t}},__vite__mapDeps([20,1,2,3,4,5,6,7]))).checkmarkBoldSvg,chevronBottom:async()=>(await r(async()=>{const{chevronBottomSvg:t}=await import("./chevron-bottom-mT1jYPZp.js");return{chevronBottomSvg:t}},__vite__mapDeps([21,1,2,3,4,5,6,7]))).chevronBottomSvg,chevronLeft:async()=>(await r(async()=>{const{chevronLeftSvg:t}=await import("./chevron-left-Decuv2H7.js");return{chevronLeftSvg:t}},__vite__mapDeps([22,1,2,3,4,5,6,7]))).chevronLeftSvg,chevronRight:async()=>(await r(async()=>{const{chevronRightSvg:t}=await import("./chevron-right-Cfu6pnmv.js");return{chevronRightSvg:t}},__vite__mapDeps([23,1,2,3,4,5,6,7]))).chevronRightSvg,chevronTop:async()=>(await r(async()=>{const{chevronTopSvg:t}=await import("./chevron-top-ChqugFPt.js");return{chevronTopSvg:t}},__vite__mapDeps([24,1,2,3,4,5,6,7]))).chevronTopSvg,chromeStore:async()=>(await r(async()=>{const{chromeStoreSvg:t}=await import("./chrome-store-_p5NCGZR.js");return{chromeStoreSvg:t}},__vite__mapDeps([25,1,2,3,4,5,6,7]))).chromeStoreSvg,clock:async()=>(await r(async()=>{const{clockSvg:t}=await import("./clock-bGctaTLA.js");return{clockSvg:t}},__vite__mapDeps([26,1,2,3,4,5,6,7]))).clockSvg,close:async()=>(await r(async()=>{const{closeSvg:t}=await import("./close-B_KUYs1Z.js");return{closeSvg:t}},__vite__mapDeps([27,1,2,3,4,5,6,7]))).closeSvg,compass:async()=>(await r(async()=>{const{compassSvg:t}=await import("./compass-BMUEsBOE.js");return{compassSvg:t}},__vite__mapDeps([28,1,2,3,4,5,6,7]))).compassSvg,coinPlaceholder:async()=>(await r(async()=>{const{coinPlaceholderSvg:t}=await import("./coinPlaceholder-BqL2zt6w.js");return{coinPlaceholderSvg:t}},__vite__mapDeps([29,1,2,3,4,5,6,7]))).coinPlaceholderSvg,copy:async()=>(await r(async()=>{const{copySvg:t}=await import("./copy-CSyTAUu1.js");return{copySvg:t}},__vite__mapDeps([30,1,2,3,4,5,6,7]))).copySvg,cursor:async()=>(await r(async()=>{const{cursorSvg:t}=await import("./cursor-DA_L6C9z.js");return{cursorSvg:t}},__vite__mapDeps([31,1,2,3,4,5,6,7]))).cursorSvg,cursorTransparent:async()=>(await r(async()=>{const{cursorTransparentSvg:t}=await import("./cursor-transparent-CdCR3Dyg.js");return{cursorTransparentSvg:t}},__vite__mapDeps([32,1,2,3,4,5,6,7]))).cursorTransparentSvg,desktop:async()=>(await r(async()=>{const{desktopSvg:t}=await import("./desktop-DfQRZEYZ.js");return{desktopSvg:t}},__vite__mapDeps([33,1,2,3,4,5,6,7]))).desktopSvg,disconnect:async()=>(await r(async()=>{const{disconnectSvg:t}=await import("./disconnect-DTc9z7mE.js");return{disconnectSvg:t}},__vite__mapDeps([34,1,2,3,4,5,6,7]))).disconnectSvg,discord:async()=>(await r(async()=>{const{discordSvg:t}=await import("./discord-kysiqnEU.js");return{discordSvg:t}},__vite__mapDeps([35,1,2,3,4,5,6,7]))).discordSvg,etherscan:async()=>(await r(async()=>{const{etherscanSvg:t}=await import("./etherscan-BH0-IjEM.js");return{etherscanSvg:t}},__vite__mapDeps([36,1,2,3,4,5,6,7]))).etherscanSvg,extension:async()=>(await r(async()=>{const{extensionSvg:t}=await import("./extension-WxlXaw3U.js");return{extensionSvg:t}},__vite__mapDeps([37,1,2,3,4,5,6,7]))).extensionSvg,externalLink:async()=>(await r(async()=>{const{externalLinkSvg:t}=await import("./external-link-fI_AMoaM.js");return{externalLinkSvg:t}},__vite__mapDeps([38,1,2,3,4,5,6,7]))).externalLinkSvg,facebook:async()=>(await r(async()=>{const{facebookSvg:t}=await import("./facebook-v5KY6C6R.js");return{facebookSvg:t}},__vite__mapDeps([39,1,2,3,4,5,6,7]))).facebookSvg,farcaster:async()=>(await r(async()=>{const{farcasterSvg:t}=await import("./farcaster-BEnUjzNm.js");return{farcasterSvg:t}},__vite__mapDeps([40,1,2,3,4,5,6,7]))).farcasterSvg,filters:async()=>(await r(async()=>{const{filtersSvg:t}=await import("./filters-CWfwBEw_.js");return{filtersSvg:t}},__vite__mapDeps([41,1,2,3,4,5,6,7]))).filtersSvg,github:async()=>(await r(async()=>{const{githubSvg:t}=await import("./github-CnL0LY0R.js");return{githubSvg:t}},__vite__mapDeps([42,1,2,3,4,5,6,7]))).githubSvg,google:async()=>(await r(async()=>{const{googleSvg:t}=await import("./google-BQaKiMD2.js");return{googleSvg:t}},__vite__mapDeps([43,1,2,3,4,5,6,7]))).googleSvg,helpCircle:async()=>(await r(async()=>{const{helpCircleSvg:t}=await import("./help-circle-CVX_kzUJ.js");return{helpCircleSvg:t}},__vite__mapDeps([44,1,2,3,4,5,6,7]))).helpCircleSvg,image:async()=>(await r(async()=>{const{imageSvg:t}=await import("./image-WJ1Ep21I.js");return{imageSvg:t}},__vite__mapDeps([45,1,2,3,4,5,6,7]))).imageSvg,id:async()=>(await r(async()=>{const{idSvg:t}=await import("./id-CD6B68z6.js");return{idSvg:t}},__vite__mapDeps([46,1,2,3,4,5,6,7]))).idSvg,infoCircle:async()=>(await r(async()=>{const{infoCircleSvg:t}=await import("./info-circle-BFBICG0M.js");return{infoCircleSvg:t}},__vite__mapDeps([47,1,2,3,4,5,6,7]))).infoCircleSvg,lightbulb:async()=>(await r(async()=>{const{lightbulbSvg:t}=await import("./lightbulb-BaGIFDS_.js");return{lightbulbSvg:t}},__vite__mapDeps([48,1,2,3,4,5,6,7]))).lightbulbSvg,mail:async()=>(await r(async()=>{const{mailSvg:t}=await import("./mail-DEZRVFj_.js");return{mailSvg:t}},__vite__mapDeps([49,1,2,3,4,5,6,7]))).mailSvg,mobile:async()=>(await r(async()=>{const{mobileSvg:t}=await import("./mobile-BqLDTdXQ.js");return{mobileSvg:t}},__vite__mapDeps([50,1,2,3,4,5,6,7]))).mobileSvg,more:async()=>(await r(async()=>{const{moreSvg:t}=await import("./more-Di4mZiKe.js");return{moreSvg:t}},__vite__mapDeps([51,1,2,3,4,5,6,7]))).moreSvg,networkPlaceholder:async()=>(await r(async()=>{const{networkPlaceholderSvg:t}=await import("./network-placeholder-BeAj6t6m.js");return{networkPlaceholderSvg:t}},__vite__mapDeps([52,1,2,3,4,5,6,7]))).networkPlaceholderSvg,nftPlaceholder:async()=>(await r(async()=>{const{nftPlaceholderSvg:t}=await import("./nftPlaceholder-_QUj2pFg.js");return{nftPlaceholderSvg:t}},__vite__mapDeps([53,1,2,3,4,5,6,7]))).nftPlaceholderSvg,off:async()=>(await r(async()=>{const{offSvg:t}=await import("./off-CWY4goKG.js");return{offSvg:t}},__vite__mapDeps([54,1,2,3,4,5,6,7]))).offSvg,playStore:async()=>(await r(async()=>{const{playStoreSvg:t}=await import("./play-store-DbgsfevM.js");return{playStoreSvg:t}},__vite__mapDeps([55,1,2,3,4,5,6,7]))).playStoreSvg,plus:async()=>(await r(async()=>{const{plusSvg:t}=await import("./plus-chYVq2BB.js");return{plusSvg:t}},__vite__mapDeps([56,1,2,3,4,5,6,7]))).plusSvg,qrCode:async()=>(await r(async()=>{const{qrCodeIcon:t}=await import("./qr-code-Dda90ImA.js");return{qrCodeIcon:t}},__vite__mapDeps([57,1,2,3,4,5,6,7]))).qrCodeIcon,recycleHorizontal:async()=>(await r(async()=>{const{recycleHorizontalSvg:t}=await import("./recycle-horizontal-BGlVkqgi.js");return{recycleHorizontalSvg:t}},__vite__mapDeps([58,1,2,3,4,5,6,7]))).recycleHorizontalSvg,refresh:async()=>(await r(async()=>{const{refreshSvg:t}=await import("./refresh-C1HXqKjT.js");return{refreshSvg:t}},__vite__mapDeps([59,1,2,3,4,5,6,7]))).refreshSvg,search:async()=>(await r(async()=>{const{searchSvg:t}=await import("./search-CT7KhSFQ.js");return{searchSvg:t}},__vite__mapDeps([60,1,2,3,4,5,6,7]))).searchSvg,send:async()=>(await r(async()=>{const{sendSvg:t}=await import("./send-CE7YRGsz.js");return{sendSvg:t}},__vite__mapDeps([61,1,2,3,4,5,6,7]))).sendSvg,swapHorizontal:async()=>(await r(async()=>{const{swapHorizontalSvg:t}=await import("./swapHorizontal-EjjWLNcX.js");return{swapHorizontalSvg:t}},__vite__mapDeps([62,1,2,3,4,5,6,7]))).swapHorizontalSvg,swapHorizontalMedium:async()=>(await r(async()=>{const{swapHorizontalMediumSvg:t}=await import("./swapHorizontalMedium-AnHjexOO.js");return{swapHorizontalMediumSvg:t}},__vite__mapDeps([63,1,2,3,4,5,6,7]))).swapHorizontalMediumSvg,swapHorizontalBold:async()=>(await r(async()=>{const{swapHorizontalBoldSvg:t}=await import("./swapHorizontalBold-4SX3HxzZ.js");return{swapHorizontalBoldSvg:t}},__vite__mapDeps([64,1,2,3,4,5,6,7]))).swapHorizontalBoldSvg,swapHorizontalRoundedBold:async()=>(await r(async()=>{const{swapHorizontalRoundedBoldSvg:t}=await import("./swapHorizontalRoundedBold-CmlEHigX.js");return{swapHorizontalRoundedBoldSvg:t}},__vite__mapDeps([65,1,2,3,4,5,6,7]))).swapHorizontalRoundedBoldSvg,swapVertical:async()=>(await r(async()=>{const{swapVerticalSvg:t}=await import("./swapVertical-BYUQAq7m.js");return{swapVerticalSvg:t}},__vite__mapDeps([66,1,2,3,4,5,6,7]))).swapVerticalSvg,telegram:async()=>(await r(async()=>{const{telegramSvg:t}=await import("./telegram-CWzpsnCr.js");return{telegramSvg:t}},__vite__mapDeps([67,1,2,3,4,5,6,7]))).telegramSvg,threeDots:async()=>(await r(async()=>{const{threeDotsSvg:t}=await import("./three-dots-D-kf5NIH.js");return{threeDotsSvg:t}},__vite__mapDeps([68,1,2,3,4,5,6,7]))).threeDotsSvg,twitch:async()=>(await r(async()=>{const{twitchSvg:t}=await import("./twitch-BOv6j3LA.js");return{twitchSvg:t}},__vite__mapDeps([69,1,2,3,4,5,6,7]))).twitchSvg,twitter:async()=>(await r(async()=>{const{xSvg:t}=await import("./x-SMw1LxMU.js");return{xSvg:t}},__vite__mapDeps([70,1,2,3,4,5,6,7]))).xSvg,twitterIcon:async()=>(await r(async()=>{const{twitterIconSvg:t}=await import("./twitterIcon-IAZlg8O6.js");return{twitterIconSvg:t}},__vite__mapDeps([71,1,2,3,4,5,6,7]))).twitterIconSvg,verify:async()=>(await r(async()=>{const{verifySvg:t}=await import("./verify-BOkF1JEV.js");return{verifySvg:t}},__vite__mapDeps([72,1,2,3,4,5,6,7]))).verifySvg,verifyFilled:async()=>(await r(async()=>{const{verifyFilledSvg:t}=await import("./verify-filled-BPueXuPy.js");return{verifyFilledSvg:t}},__vite__mapDeps([73,1,2,3,4,5,6,7]))).verifyFilledSvg,wallet:async()=>(await r(async()=>{const{walletSvg:t}=await import("./wallet-BkTtv_CI.js");return{walletSvg:t}},__vite__mapDeps([74,1,2,3,4,5,6,7]))).walletSvg,walletConnect:async()=>(await r(async()=>{const{walletConnectSvg:t}=await import("./walletconnect-BG9ZLjJF.js");return{walletConnectSvg:t}},__vite__mapDeps([75,1,2,3,4,5,6,7]))).walletConnectSvg,walletConnectLightBrown:async()=>(await r(async()=>{const{walletConnectLightBrownSvg:t}=await import("./walletconnect-BG9ZLjJF.js");return{walletConnectLightBrownSvg:t}},__vite__mapDeps([75,1,2,3,4,5,6,7]))).walletConnectLightBrownSvg,walletConnectBrown:async()=>(await r(async()=>{const{walletConnectBrownSvg:t}=await import("./walletconnect-BG9ZLjJF.js");return{walletConnectBrownSvg:t}},__vite__mapDeps([75,1,2,3,4,5,6,7]))).walletConnectBrownSvg,walletPlaceholder:async()=>(await r(async()=>{const{walletPlaceholderSvg:t}=await import("./wallet-placeholder-DehPUm8r.js");return{walletPlaceholderSvg:t}},__vite__mapDeps([76,1,2,3,4,5,6,7]))).walletPlaceholderSvg,warningCircle:async()=>(await r(async()=>{const{warningCircleSvg:t}=await import("./warning-circle--0BZMvHm.js");return{warningCircleSvg:t}},__vite__mapDeps([77,1,2,3,4,5,6,7]))).warningCircleSvg,x:async()=>(await r(async()=>{const{xSvg:t}=await import("./x-SMw1LxMU.js");return{xSvg:t}},__vite__mapDeps([70,1,2,3,4,5,6,7]))).xSvg,info:async()=>(await r(async()=>{const{infoSvg:t}=await import("./info-5F2TVMVH.js");return{infoSvg:t}},__vite__mapDeps([78,1,2,3,4,5,6,7]))).infoSvg,exclamationTriangle:async()=>(await r(async()=>{const{exclamationTriangleSvg:t}=await import("./exclamation-triangle-COtMG3ni.js");return{exclamationTriangleSvg:t}},__vite__mapDeps([79,1,2,3,4,5,6,7]))).exclamationTriangleSvg,reown:async()=>(await r(async()=>{const{reownSvg:t}=await import("./reown-logo-BFOOtFVJ.js");return{reownSvg:t}},__vite__mapDeps([80,1,2,3,4,5,6,7]))).reownSvg};async function rt(t){if(A.has(t))return A.get(t);const i=(b[t]??b.copy)();return A.set(t,i),i}let v=class extends L{constructor(){super(...arguments),this.size="md",this.name="copy",this.color="fg-300",this.aspectRatio="1 / 1"}render(){return this.style.cssText=`
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-aspect-ratio: ${this.aspectRatio}
    `,S`${tt(rt(this.name),S`<div class="fallback"></div>`)}`}};v.styles=[R,j,it];m([l()],v.prototype,"size",void 0);m([l()],v.prototype,"name",void 0);m([l()],v.prototype,"color",void 0);m([l()],v.prototype,"aspectRatio",void 0);v=m([I("wui-icon")],v);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const at=C(class extends x{constructor(t){var e;if(super(t),t.type!==V.ATTRIBUTE||t.name!=="class"||((e=t.strings)==null?void 0:e.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){var n,o;if(this.st===void 0){this.st=new Set,t.strings!==void 0&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(a=>a!=="")));for(const a in e)e[a]&&!((n=this.nt)!=null&&n.has(a))&&this.st.add(a);return this.render(e)}const i=t.element.classList;for(const a of this.st)a in e||(i.remove(a),this.st.delete(a));for(const a in e){const s=!!e[a];s===this.st.has(a)||(o=this.nt)!=null&&o.has(a)||(s?(i.add(a),this.st.add(a)):(i.remove(a),this.st.delete(a)))}return T}}),nt=P`
  :host {
    display: inline-flex !important;
  }

  slot {
    width: 100%;
    display: inline-block;
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings:
      'tnum' on,
      'lnum' on,
      'case' on;
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    overflow: inherit;
    text-overflow: inherit;
    text-align: var(--local-align);
    color: var(--local-color);
  }

  .wui-line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }

  .wui-line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .wui-font-medium-400 {
    font-size: var(--wui-font-size-medium);
    font-weight: var(--wui-font-weight-light);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-medium-600 {
    font-size: var(--wui-font-size-medium);
    letter-spacing: var(--wui-letter-spacing-medium);
  }

  .wui-font-title-600 {
    font-size: var(--wui-font-size-title);
    letter-spacing: var(--wui-letter-spacing-title);
  }

  .wui-font-title-6-600 {
    font-size: var(--wui-font-size-title-6);
    letter-spacing: var(--wui-letter-spacing-title-6);
  }

  .wui-font-mini-700 {
    font-size: var(--wui-font-size-mini);
    letter-spacing: var(--wui-letter-spacing-mini);
    text-transform: uppercase;
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
    letter-spacing: var(--wui-letter-spacing-large);
  }

  .wui-font-2xl-500,
  .wui-font-2xl-600,
  .wui-font-2xl-700 {
    font-size: var(--wui-font-size-2xl);
    letter-spacing: var(--wui-letter-spacing-2xl);
  }

  .wui-font-paragraph-400,
  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
    letter-spacing: var(--wui-letter-spacing-paragraph);
  }

  .wui-font-small-400,
  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
    letter-spacing: var(--wui-letter-spacing-small);
  }

  .wui-font-tiny-400,
  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
    letter-spacing: var(--wui-letter-spacing-tiny);
  }

  .wui-font-micro-700,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-micro);
    text-transform: uppercase;
  }

  .wui-font-tiny-400,
  .wui-font-small-400,
  .wui-font-medium-400,
  .wui-font-paragraph-400 {
    font-weight: var(--wui-font-weight-light);
  }

  .wui-font-large-700,
  .wui-font-paragraph-700,
  .wui-font-micro-700,
  .wui-font-mini-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-medium-600,
  .wui-font-medium-title-600,
  .wui-font-title-6-600,
  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }

  :host([disabled]) {
    opacity: 0.4;
  }
`;var y=function(t,e,i,n){var o=arguments.length,a=o<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,i):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")a=Reflect.decorate(t,e,i,n);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(a=(o<3?s(a):o>3?s(e,i,a):s(e,i))||a);return o>3&&a&&Object.defineProperty(e,i,a),a};let p=class extends L{constructor(){super(...arguments),this.variant="paragraph-500",this.color="fg-300",this.align="left",this.lineClamp=void 0}render(){const e={[`wui-font-${this.variant}`]:!0,[`wui-color-${this.color}`]:!0,[`wui-line-clamp-${this.lineClamp}`]:!!this.lineClamp};return this.style.cssText=`
      --local-align: ${this.align};
      --local-color: var(--wui-color-${this.color});
    `,S`<slot class=${at(e)}></slot>`}};p.styles=[R,nt];y([l()],p.prototype,"variant",void 0);y([l()],p.prototype,"color",void 0);y([l()],p.prototype,"align",void 0);y([l()],p.prototype,"lineClamp",void 0);p=y([I("wui-text")],p);const ot=P`
  :host {
    display: flex;
    width: inherit;
    height: inherit;
  }
`;var w=function(t,e,i,n){var o=arguments.length,a=o<3?e:n===null?n=Object.getOwnPropertyDescriptor(e,i):n,s;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")a=Reflect.decorate(t,e,i,n);else for(var c=t.length-1;c>=0;c--)(s=t[c])&&(a=(o<3?s(a):o>3?s(e,i,a):s(e,i))||a);return o>3&&a&&Object.defineProperty(e,i,a),a};let _=class extends L{render(){return this.style.cssText=`
      flex-direction: ${this.flexDirection};
      flex-wrap: ${this.flexWrap};
      flex-basis: ${this.flexBasis};
      flex-grow: ${this.flexGrow};
      flex-shrink: ${this.flexShrink};
      align-items: ${this.alignItems};
      justify-content: ${this.justifyContent};
      column-gap: ${this.columnGap&&`var(--wui-spacing-${this.columnGap})`};
      row-gap: ${this.rowGap&&`var(--wui-spacing-${this.rowGap})`};
      gap: ${this.gap&&`var(--wui-spacing-${this.gap})`};
      padding-top: ${this.padding&&d.getSpacingStyles(this.padding,0)};
      padding-right: ${this.padding&&d.getSpacingStyles(this.padding,1)};
      padding-bottom: ${this.padding&&d.getSpacingStyles(this.padding,2)};
      padding-left: ${this.padding&&d.getSpacingStyles(this.padding,3)};
      margin-top: ${this.margin&&d.getSpacingStyles(this.margin,0)};
      margin-right: ${this.margin&&d.getSpacingStyles(this.margin,1)};
      margin-bottom: ${this.margin&&d.getSpacingStyles(this.margin,2)};
      margin-left: ${this.margin&&d.getSpacingStyles(this.margin,3)};
    `,S`<slot></slot>`}};_.styles=[R,ot];w([l()],_.prototype,"flexDirection",void 0);w([l()],_.prototype,"flexWrap",void 0);w([l()],_.prototype,"flexBasis",void 0);w([l()],_.prototype,"flexGrow",void 0);w([l()],_.prototype,"flexShrink",void 0);w([l()],_.prototype,"alignItems",void 0);w([l()],_.prototype,"justifyContent",void 0);w([l()],_.prototype,"columnGap",void 0);w([l()],_.prototype,"rowGap",void 0);w([l()],_.prototype,"gap",void 0);w([l()],_.prototype,"padding",void 0);w([l()],_.prototype,"margin",void 0);_=w([I("wui-flex")],_);/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const dt=t=>t??H;export{d as U,C as a,I as c,at as e,Z as f,l as n,dt as o,lt as r};
