import{i as s,a as f,x as p}from"./CheckoutPage-DS0Cex5v.js";import{c as a}from"./if-defined-hRqPwO8Z.js";import"./index-D-i7Zl8x.js";import"./index-C60RHSrd.js";import"./invoiceUtils-vytCLSo3.js";import"./gamepad-2-CNQfoblG.js";import"./shield-check-BBO7W4af.js";import"./file-text-DlHai6-P.js";import"./index-TbpxPuRU.js";import"./index-BkSxza0s.js";import"./index-dAxx9fv_.js";import"./index-DnNDAHTU.js";import"./index-mWucgfB0.js";const d=s`
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
