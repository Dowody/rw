import{i as s,a as f,x as p}from"./CheckoutPage-B5JVes06.js";import{c as a}from"./if-defined-C2O_ltkn.js";import"./index-S2L9jk0l.js";import"./index-1cQoQDj9.js";import"./invoiceUtils-Da5hzvi0.js";import"./gamepad-2-DYEKKtKL.js";import"./shield-check-DnBohWZ1.js";import"./file-text-pg8vdgDU.js";import"./index-Cx0HsVHE.js";import"./index-l_UWI8hy.js";import"./index-B9Tqfx29.js";import"./index-Dsc7iqnu.js";import"./index-DDj9gFWg.js";const d=s`
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
