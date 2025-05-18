import{i as s,a as f,x as p}from"./CheckoutPage-Dzgf_enj.js";import{c as a}from"./if-defined-BU45SX_a.js";import"./index-CoRbu2xD.js";import"./index-D5Mvrn8N.js";import"./invoiceUtils-BxBZ_IFP.js";import"./gamepad-2-C3dfxic0.js";import"./shield-check-DWfMx-9S.js";import"./file-text-CWGIevsS.js";import"./index-DLvUOyds.js";import"./index-BprACa1P.js";import"./index-CYQjF47K.js";import"./index-jkdjg8NU.js";import"./index-CCP34jYc.js";const d=s`
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
