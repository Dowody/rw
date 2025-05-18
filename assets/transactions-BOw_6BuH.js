import{i as s,a as f,x as p}from"./CheckoutPage-c7VaLA7W.js";import{c as a}from"./if-defined-B5Czgbod.js";import"./index-Cml4ZY0i.js";import"./index-BV9XEvWL.js";import"./invoiceUtils-lR4gZZlT.js";import"./gamepad-2-C1a7qJhj.js";import"./shield-check-CDgr5ZKk.js";import"./file-text-Bqh4h83P.js";import"./index-lN4rui7u.js";import"./index-Ch7ZROXx.js";import"./index-Bqs0IyPD.js";import"./index-Bj28ZgTe.js";import"./index-7u63WoNR.js";const d=s`
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
