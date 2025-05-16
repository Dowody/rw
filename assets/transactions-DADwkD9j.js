import{i as s,a as f,x as p}from"./CheckoutPage-CYIBwlg2.js";import{c as a}from"./if-defined-CIN0uSMH.js";import"./index-DZheRRyb.js";import"./index-B26KD9EA.js";import"./invoiceUtils-BR1kCzl0.js";import"./shield-check-OdrETNqg.js";import"./credit-card-C4_3JTnc.js";import"./file-text-BwaIkPz_.js";import"./index-849_MpWR.js";import"./index-CxM3S-sF.js";import"./index-Dwkeglg7.js";import"./index-CEOQDWcB.js";import"./index-CZpLGUuW.js";const d=s`
  :host > wui-flex:first-child {
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  :host > wui-flex:first-child::-webkit-scrollbar {
    display: none;
  }
`;var u=function(o,i,e,r){var n=arguments.length,t=n<3?i:r===null?r=Object.getOwnPropertyDescriptor(i,e):r,l;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")t=Reflect.decorate(o,i,e,r);else for(var m=o.length-1;m>=0;m--)(l=o[m])&&(t=(n<3?l(t):n>3?l(i,e,t):l(i,e))||t);return n>3&&t&&Object.defineProperty(i,e,t),t};let c=class extends f{render(){return p`
      <wui-flex flexDirection="column" .padding=${["0","m","m","m"]} gap="s">
        <w3m-activity-list page="activity"></w3m-activity-list>
      </wui-flex>
    `}};c.styles=d;c=u([a("w3m-transactions-view")],c);export{c as W3mTransactionsView};
