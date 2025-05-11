import{i as s,a as f,x as p}from"./CheckoutPage-CowK6Su9.js";import{c as a}from"./if-defined-CD3wi2mv.js";import"./index-4AaQcusv.js";import"./index-z76zTYa2.js";import"./invoiceUtils-BOKw0gRL.js";import"./shield-check-DgsIdo1E.js";import"./credit-card-BC3FdHbu.js";import"./file-text-DkDZivbL.js";import"./index-BU0x2vSi.js";import"./index-BK6Ef4cs.js";import"./index-C63-8LGu.js";import"./index-C2TI-88r.js";import"./index-B6-Z8hxo.js";const d=s`
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
