import{i as s,a as f,x as p}from"./CheckoutPage-lC7kdlDm.js";import{c as a}from"./if-defined-zye_2eEM.js";import"./index-AxNp4Sjr.js";import"./index-Bo_KBEeX.js";import"./invoiceUtils-pXH93EYi.js";import"./shield-check-Dyf4wDP1.js";import"./credit-card-Bj3XBP4o.js";import"./file-text-Nei2I5In.js";import"./index-DOLneHp8.js";import"./index-e7GWILU7.js";import"./index-kQbmnl1C.js";import"./index-DIG2Fin-.js";import"./index-Bg2n9mgs.js";const d=s`
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
